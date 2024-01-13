import { publicProcedure, router } from "./trpc"
import z from "zod"

import { publicProcedure, router } from "./trpc"
import z from "zod"

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: "Hello World" }
  }),
})
export type AppRouter = typeof appRouter
