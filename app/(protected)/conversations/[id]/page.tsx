import { currentUser } from "@/lib/auth"
import MessageChannel from "@/components/chat/message-channel"
import { serverClient } from "@/app/_trpc/serverClient"

const page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser()
  const initialMessages = await serverClient.conversations.getAllMessages(params.id)
  console.log(user)
  return <MessageChannel currentUserId={user!.id} conversationId={params.id} initialMessages={initialMessages}/>
}

export default page
