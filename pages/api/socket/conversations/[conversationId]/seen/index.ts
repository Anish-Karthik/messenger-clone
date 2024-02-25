import { NextApiRequest } from "next"
import { NextApiResponseServerIo } from "@/types"

import { db } from "@/lib/db"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {
    const conversationId = req.query.conversationId as string
    const { currentUserId } = req.body
    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Find existing conversation
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    })

    if (!conversation) {
      return res.status(404).json({ error: "Not Found" })
    }

    // Find last message
    const lastMessage = conversation.messages[conversation.messages.length - 1]

    if (!lastMessage) {
      return res.status(200).json({ error: "Not Found" })
    }

    // Update seen of last message
    const updatedMessage = await db.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUserId,
          },
        },
      },
    })

    // Update all connections with new seen
    // await pusherServer.trigger(currentUser.email, "conversation:update", {
    //   id: conversationId,
    //   messages: [updatedMessage],
    // })
    res?.socket?.server?.io?.emit(`conversation:user:${currentUserId}update`, {
      id: conversationId,
      messages: [updatedMessage],
    })
    console.log(lastMessage)

    // If user has already seen the message, no need to go further
    if (lastMessage.seenIds.indexOf(currentUserId) !== -1) {
      return res.status(200).json(updatedMessage)
    }

    // Update last message seen
    // await pusherServer.trigger(
    //   conversationId!,
    //   "message:update",
    //   updatedMessage
    // )
    res?.socket?.server?.io?.emit(
      `conversation:${conversationId}:messages:update`,
      updatedMessage
    )
    console.log("No prob here")
    return res.status(200).json(updatedMessage)
  } catch (error) {
    console.log(error, "ERROR_MESSAGES_SEEN")
    return res.status(500).json({ error })
  }
}
