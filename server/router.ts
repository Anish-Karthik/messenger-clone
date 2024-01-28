import { z } from "zod"

import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

import { publicProcedure, router } from "./trpc"

const usersRouter = router({
  getById: publicProcedure.input(z.string()).query(async ({ input: id }) => {
    return await db.user.findUnique({ where: { id } })
  }),
  getByEmail: publicProcedure
    .input(z.string())
    .query(async ({ input: email }) => {
      return await db.user.findUnique({ where: { email } })
    }),
  getAll: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { id, cursor } = input
      const items = await db.user.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          NOT: {
            id,
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }
      return {
        items,
        nextCursor,
      }
    }),
  getAllConversations: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { userId: id, cursor } = input
      const items = await db.user.findUnique({ where: { id } }).conversations({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        // include last message from the messages list also
        include: {
          users: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            include: {
              sender: true,
              seen: true,
            },
          },
        },
        orderBy: {
          lastMessageAt: "desc",
        },
      })
      console.log(items)
      let nextCursor: typeof cursor | undefined = undefined
      if (items && items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }
      return {
        items,
        nextCursor,
      }
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ input: { name, email, image } }) => {
      await db.user.create({ data: { name, email, image } })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ input: { id, name, image } }) => {
      await db.user.update({ where: { id }, data: { name, image } })
    }),
})

const conversationsRouter = router({
  getById: publicProcedure.input(z.string()).query(async ({ input: id }) => {
    return await db.conversation.findUnique({
      where: { id },
      include: { users: true },
    })
  }),
  getAll: publicProcedure.query(async () => {
    return await db.conversation.findMany()
  }),
  create: publicProcedure
    .input(
      z.object({
        users: z.array(z.string()),
        isGroup: z.boolean().default(false),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input: { name, users, isGroup } }) => {
      if (!isGroup && users.length === 2) {
        const existing = await db.conversation.findFirst({
          where: {
            AND: [
              { isGroup: false },
              { users: { every: { id: { in: users } } } },
            ],
          },
          include: {
            users: true,
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                sender: true,
                seen: true,
              },
            },
          },
        })
        if (existing && existing.userIds.length === 2) {
          return existing
        }
      }
      return await db.conversation.create({
        data: {
          isGroup,
          name,
          users: { connect: users.map((id) => ({ id })) },
        },
        include: {
          users: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            include: {
              sender: true,
              seen: true,
            },
          },
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input: { id, name } }) => {
      await db.conversation.update({ where: { id }, data: { name } })
    }),
  getAllMessages: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      return await db.conversation
        .findUnique({ where: { id } })
        .messages({ include: { sender: true, seen: true } })
    }),
  setSeen: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input: { conversationId, userId } }) => {
      const conversation = await db.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            include: {
              sender: true,
              seen: true,
            },
          },
          users: true,
        },
      })

      if (!conversation) {
        throw new Error("Conversation not found")
      }

      // Find last message
      const lastMessage = conversation.messages[0]

      if (!lastMessage) {
        return conversation
      }

      // Update seen of last message
      const updatedMessage = await db.message.update({
        where: {
          id: lastMessage.id,
        },
        include: {
          sender: true,
          seen: true,
        },
        data: {
          seen: {
            connect: {
              id: userId,
            },
          },
        },
      })
      return conversation
    }),
})
export const messagesRouter = router({
  create: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        senderId: z.string(),
        body: z.string(),
        image: z.string().url(),
      })
    )
    .mutation(async ({ input: { conversationId, senderId, body, image } }) => {
      const newMessage = await db.message.create({
        data: {
          conversationId,
          senderId,
          body,
          image,
          seen: { connect: { id: senderId } },
        },
        include: {
          sender: true,
          seen: true,
        },
      })
      // update the conversation with the new message
      const updatedConversation = await db.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: newMessage.createdAt,
          messages: {
            connect: { id: newMessage.id },
          },
        },
        include: {
          users: true,
        },
      })
      await pusherServer.trigger(conversationId, "messages:new", newMessage)

      // last message is the new message without the sender
      let lastMessage = { ...newMessage, sender: undefined }

      updatedConversation.users.map((user) => {
        if (user.id === senderId) return
        pusherServer.trigger(user.email!, "conversation:update", {
          id: conversationId,
          messages: [lastMessage],
        })
      })

      return newMessage
    }),
})

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: "Hello World" }
  }),
  messages: messagesRouter,
  users: usersRouter,
  conversations: conversationsRouter,
})
export type AppRouter = typeof appRouter
