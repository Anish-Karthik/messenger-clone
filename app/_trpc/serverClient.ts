import { appRouter } from "@/server/router"
import { httpBatchLink } from "@trpc/client"

export const serverClient = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
})
