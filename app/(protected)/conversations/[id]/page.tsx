import { currentUser } from "@/lib/auth"
import MessageChannel from "@/components/chat/message-channel"

const page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser()
  console.log(user)
  return <MessageChannel currentUserId={user!.id} conversationId={params.id} />
}

export default page
