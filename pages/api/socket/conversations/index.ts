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
    const body = req.body
    console.log(body)
    console.log(req)
    const { userId, isGroup, members, name, currentUserId } = body

    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return res.status(400).json({ error: "Invalid Data" })
    }

    if (isGroup) {
      const newConversation = await db.conversation.create({
        data: {
          name,
          isGroup: true,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUserId,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      })

      // Update all connections with new conversation
      newConversation.users.forEach((user) => {
        if (user.id) {
          res?.socket?.server?.io?.emit(
            `conversation:user:${user.id}:new`,
            newConversation
          )
        }
      })

      return res.status(200).json(newConversation)
    }

    const existingConversations = await db.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUserId, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUserId],
            },
          },
        ],
      },
    })

    const singleConversation = existingConversations[0]

    if (singleConversation) {
      return res.status(200).json(singleConversation)
    }

    const newConversation = await db.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUserId,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    })

    // Update all connections with new conversation
    newConversation.users.map((user) => {
      if (user.id) {
        res?.socket?.server?.io?.emit(
          `conversation:user:${user.id}:new`,
          newConversation
        )
      }
    })

    return res.status(200).json(newConversation)
  } catch (error) {
    console.log(error)
    return
  }
}
