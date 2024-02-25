import { FullConversationType, FullMessageType } from "@/types"
import { z } from "zod"

import { db } from "@/lib/db"

import { publicProcedure, router } from "../trpc"

export const conversationsRouter = router({
  getById: publicProcedure.input(z.string()).query(async ({ input: id }) => {
    return await db.conversation.findUnique({
      where: { id },
      include: { users: true },
    })
  }),
  getAll: publicProcedure.query(async () => {
    const conversations: FullConversationType[] =
      await db.conversation.findMany({
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
    return conversations
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
      const newConversation: FullConversationType =
        await db.conversation.create({
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
      console.log(newConversation.users)
      return newConversation
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

  delete: publicProcedure.input(z.string()).mutation(async ({ input: id }) => {
    const deletedConversation = await db.conversation.delete({ where: { id } })

    return deletedConversation
  }),

  getAllMessages: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().min(1).max(100).nullish().default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input: { conversationId, limit, cursor } }) => {
      const items: FullMessageType[] = (await db.conversation
        .findUnique({ where: { id: conversationId } })
        .messages({
          take: limit! + 1,
          cursor: cursor ? { id: cursor } : undefined,
          // include last message from the messages list also
          include: {
            sender: true,
            seen: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }))!
      console.log(items)
      let nextCursor: typeof cursor | undefined = undefined
      if (items && items.length > limit!) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }
      let prevCursor: typeof cursor | undefined = undefined
      if (items && items.length >= limit!) {
        const prevItem = items[0]
        console.log(prevItem?.body)
        prevCursor = prevItem!.id
      }
      return {
        items,
        // prevCursor,
        nextCursor,
      }
    }),

  setSeen: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input: { conversationId, userId } }) => {
      console.log(conversationId, userId)
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
      console.log(lastMessage)
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

      const currentUser = conversation.users.find((user) => user.id === userId)!

      console.log(lastMessage)
      // If user has already seen the message, no need to go further
      if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
        return conversation
      }
      return updatedMessage
    }),
})
