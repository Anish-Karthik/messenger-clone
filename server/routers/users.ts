import { z } from "zod"

import { db } from "@/lib/db"

import { publicProcedure, router } from "../trpc"

export const usersRouter = router({
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
