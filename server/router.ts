import { conversationsRouter } from "./routers/conversations"
import { messagesRouter } from "./routers/messages"
import { usersRouter } from "./routers/users"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: "Hello World" }
  }),
  messages: messagesRouter,
  users: usersRouter,
  conversations: conversationsRouter,
})

export type AppRouter = typeof appRouter
