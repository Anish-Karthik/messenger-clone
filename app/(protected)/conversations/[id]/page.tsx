import { redirect } from "next/navigation"

import { currentUser } from "@/lib/auth"
import MessageChannel from "@/components/chat/message-channel"
import MessageForm from "@/components/chat/message-form"
import TopCard from "@/components/chat/top-card"
import { serverClient } from "@/app/_trpc/serverClient"

// import {  } from '@prisma/client'
function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

const sleep = (time: number = 15000) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const page = async ({ params }: { params: { id: string } }) => {
  await sleep()
  if (!isValidObjectId(params.id)) {
    redirect("/conversations")
  }
  const user = await currentUser()
  const conversationDetail = await serverClient.conversations.getById(
    params.id || ""
  )
  if (!conversationDetail) {
    redirect("/conversations")
  }
  if (!user) {
    redirect("/")
  }
  console.log(params?.id)
  console.log(user)
  return (
    <div className="relative h-full">
      <TopCard
        className="absolute inset-x-0 top-0"
        conversationDetail={conversationDetail}
        currentUserId={user.id}
      />
      <div className="absolute inset-x-0 inset-y-20">
        <MessageChannel currentUserId={user!.id} conversationId={params.id} />
      </div>
      <MessageForm
        conversationId={conversationDetail.id}
        senderId={user.id}
        className="absolute inset-x-0 bottom-0"
      />
    </div>
  )
}

export default page
