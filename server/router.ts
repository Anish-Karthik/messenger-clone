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
  getAll: publicProcedure.query(async () => {
    return await db.user.findMany()
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
  conversations: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      return await db.user
        .findUnique({ where: { id } })
        .conversations({ include: { users: true } })
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
        name: z.string(),
        users: z.array(z.string()),
      })
    )
    .mutation(async ({ input: { name, users } }) => {
      await db.conversation.create({
        data: { name, users: { connect: users.map((id) => ({ id })) } },
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
