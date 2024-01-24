import { z } from "zod"

import { db } from "@/lib/db"

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
      })
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
    return await db.conversation.findUnique({ where: { id } })
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
  messages: publicProcedure.input(z.string()).query(async ({ input: id }) => {
    return await db.conversation
      .findUnique({ where: { id } })
      .messages({ include: { sender: true, seen: true } })
  }),
})

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: "Hello World" }
  }),
  users: usersRouter,
  conversations: conversationsRouter,
})
export type AppRouter = typeof appRouter
