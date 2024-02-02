import { z } from "zod"

import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

import { publicProcedure, router } from "../trpc"

export const conversationsRouter = router({
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
      return await db.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            include: {
              sender: true,
              seen: true,
            },
          },
        },
      })
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
      // Update all connections with new seen
      await pusherServer.trigger(currentUser.id!, "conversation:update", {
        id: conversationId,
        messages: [updatedMessage],
      })
      console.log(lastMessage)
      // If user has already seen the message, no need to go further
      if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
        return conversation
      }

      // Update last message seen
      await pusherServer.trigger(
        conversationId!,
        "message:update",
        updatedMessage
      )
      return updatedMessage
    }),
})
