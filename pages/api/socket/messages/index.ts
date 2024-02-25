import { NextApiRequest } from "next"
import { NextApiResponseServerIo } from "@/types"

import { db } from "@/lib/db"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  console.log(req.method)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {
    const body = req.body
    const { message, images, conversationId, currentUserId } = body
    console.log(currentUserId)
    if (!currentUserId) {
      console.log(currentUserId)
      return res.status(401).json({ error: "Unauthorized" })
    }
    res?.socket?.server?.io?.emit("user:join", currentUserId)

    const newMessage = await db.message.create({
      include: {
        seen: true,
        sender: true,
      },
      data: {
        body: message,
        images: images,
        conversation: {
          connect: { id: conversationId },
        },
        sender: {
          connect: { id: currentUserId },
        },
        seen: {
          connect: {
            id: currentUserId,
          },
        },
      },
    })

    const updatedConversation = await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    })

    const conversationKey = `conversation:${conversationId}:messages`

    res?.socket?.server?.io?.emit(conversationKey, newMessage)

    return res.status(200).json(newMessage)
  } catch (error) {
    console.log(error, "ERROR_MESSAGES")
    return res.status(500).json({ message: "Internal Error" })
  }
}
