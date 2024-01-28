import React from "react"
import { redirect } from "next/navigation"

import { currentUser } from "@/lib/auth"
import MessageForm from "@/components/chat/message-form"
import TopCard from "@/components/chat/top-card"
import { serverClient } from "@/app/_trpc/serverClient"

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) => {
  console.log(params)
  const startTime = performance.now()

  const conversationDetail = await serverClient.conversations.getById(params.id)
  const user = (await currentUser())!
  if (!conversationDetail) {
    redirect("/conversations")
  }
  const endTime = performance.now()
  const executionTime = endTime - startTime
  console.log(`Execution time: ${executionTime} milliseconds`)

  return (
    <div className="relative h-full">
      <TopCard
        className="absolute inset-x-0 top-0"
        conversationDetail={conversationDetail}
        currentUserId={user.id}
      />
      <div className="absolute inset-x-0 inset-y-20">{children}</div>
      <MessageForm
        conversationId={conversationDetail.id}
        senderId={user.id}
        className="absolute inset-x-0 bottom-0"
      />
    </div>
  )
}

export default layout
