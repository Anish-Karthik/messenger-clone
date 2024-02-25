import { NextApiRequest } from "next"
import { NextApiResponseServerIo } from "@/types"

import { db } from "@/lib/db"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {
    const conversationId = req.query.conversationId as string
    const { currentUserId } = req.body
    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    res?.socket?.server?.io?.emit("user:join", currentUserId)

    const existingConversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    })

    if (!existingConversation) {
      return res.status(404).json({ error: "Not Found" })
    }

    const deletedConversation = await db.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUserId],
        },
      },
    })
    console.log(existingConversation)
    existingConversation.users.forEach((user) => {
      console.log(user)
      if (user.id) {
        console.log(user.id)
        res?.socket?.server?.io?.emit(
          `conversation:user:${user.id}:remove`,
          conversationId
        )
      }
    })

    return res.status(200).json(deletedConversation)
  } catch (error) {
    console.log("DELETE CONVERSATION: " + error)
    return res.status(500).json({ error })
  }
}
