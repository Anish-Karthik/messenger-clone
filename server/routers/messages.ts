import { Message } from "@prisma/client"
import { z } from "zod"

import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

import { publicProcedure, router } from "../trpc"

export const messagesRouter = router({
  // create: publicProcedure
  //   .input(
  //     z.object({
  //       conversationId: z.string(),
  //       senderId: z.string(),
  //       body: z.string(),
  //       images: z.array(z.string().url()).optional(),
  //     })
  //   )
  //   .mutation(async ({ input: { conversationId, senderId, body, images } }) => {
  //     try {
  //       const newMessage = await db.message.create({
  //         data: {
  //           conversationId,
  //           senderId,
  //           body,
  //           images,
  //           seen: { connect: { id: senderId } },
  //         },
  //         include: {
  //           sender: true,
  //           seen: true,
  //         },
  //       })
  //       // update the conversation with the new message
  //       const updatedConversation = await db.conversation.update({
  //         where: { id: conversationId },
  //         data: {
  //           lastMessageAt: newMessage.createdAt,
  //           messages: {
  //             connect: { id: newMessage.id },
  //           },
  //         },
  //         include: {
  //           users: true,
  //         },
  //       })
  //       try {
  //         console.log(updatedConversation)
  //         await pusherServer.trigger(conversationId, "messages:new", newMessage)
  //         console.log("No prob here")
  //         // last message is the new message without the sender
  //         let lastMessage = { ...newMessage, sender: undefined }
  //         console.log(lastMessage)

          updatedConversation.users.forEach((user) => {
            const lastMessageToBeSent: {
              id: string
              messages: Message[]
            } = {
              id: conversationId,
              messages: [lastMessage],
            }
            pusherServer.trigger(
              user.id!,
              "conversation:update",
              lastMessageToBeSent
            )
          })
        } catch (error) {
          console.log(error)
          return newMessage
        }
        return newMessage
      } catch (error) {
        console.log(error)
        throw new Error("Error creating message")
      }
    }),
})
