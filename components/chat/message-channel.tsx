"use client"

import React, { useEffect, useRef } from "react"
import Image from "next/image"
import { FullMessageType } from "@/types"
import { format } from "date-fns"
import { find } from "lodash"

import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"
import { trpc } from "@/app/_trpc/client"

import UserAvatar from "../shared/user-avatar"

const MessageChannel = ({
  currentUserId,
  conversationId,
}: {
  currentUserId: string
  conversationId: string
}) => {
  const utils = trpc.useUtils()
  const bottomRef = useRef<HTMLDivElement>(null)
  const conversationDetail =
    trpc.conversations.getAllMessages.useQuery(conversationId)
  const setCurrentUserHasSeen = trpc.conversations.setSeen.useMutation()
  console.log(conversationDetail?.data)
  useEffect(() => {
    setCurrentUserHasSeen.mutateAsync({ conversationId, userId: currentUserId })
  }, [conversationId, currentUserId])

  console.log("hi")
  useEffect(() => {
    pusherClient.subscribe(conversationId)
    bottomRef?.current?.scrollIntoView()

    const messageHandler = async (message: FullMessageType) => {
      console.log(message)
      setCurrentUserHasSeen.mutateAsync({
        conversationId,
        userId: currentUserId,
      })
      // axios.post(`/api/conversations/${conversationId}/seen`);
      await utils.conversations.getAllMessages.cancel()
      utils.conversations.getAllMessages.setData(conversationId, (current) => {
        console.log(current)
        if (!current) return current
        if (find(current?.messages, { id: message.id })) {
          return current
        }
        const newMessages = [...current.messages, message]
        return { ...current, messages: newMessages } as typeof current
      })

      bottomRef?.current?.scrollIntoView()
    }

    const updateMessageHandler = async (newMessage: FullMessageType) => {
      console.log(newMessage)
      await utils.conversations.getAllMessages.cancel()
      utils.conversations.getAllMessages.setData(conversationId, (current) => {
        if (!current) return current
        return {
          ...current,
          messages: current.messages.map((currentMessage) => {
            if (currentMessage.id === newMessage.id) {
              return newMessage
            }
            return currentMessage
          }),
        } as typeof current
      })
    }

    pusherClient.bind("messages:new", messageHandler)
    pusherClient.bind("message:update", updateMessageHandler)

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind("messages:new", messageHandler)
      pusherClient.unbind("message:update", updateMessageHandler)
    }
  }, [conversationId, currentUserId, setCurrentUserHasSeen])

  if (conversationDetail.isFetching) return <p>Loading...</p>
  if (conversationDetail.error) return <p>{conversationDetail.error.message}</p>
  console.log(conversationDetail.data)
  return (
    <div className="h-full overflow-y-auto">
      {conversationDetail.data?.messages?.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "mt-6 flex",
            currentUserId === item.senderId ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "flex",
              currentUserId === item.senderId ? "flex-row" : "flex-row-reverse"
            )}
          >
            {item.images.length > 0 ? (
              <div className="">
                {item.images.map((image, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative m-2 h-32 w-32 rounded-xl p-2",
                      currentUserId === item.senderId
                        ? "bg-sky-500"
                        : "bg-gray-200"
                    )}
                  >
                    <Image
                      src={image!}
                      alt="image"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-xl"
                    />
                  </div>
                ))}
                {item.body && (
                  <div
                    className={cn(
                      "m-2 -mt-6 max-w-[50vw] rounded-xl p-2 px-4 pt-4",
                      currentUserId === item.senderId
                        ? "bg-sky-500"
                        : "bg-gray-200"
                    )}
                  >
                    <p className="text-white">{item.body}</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "m-2 max-w-[50vw] rounded-3xl p-2 px-4",
                  currentUserId === item.senderId ? "bg-sky-500" : "bg-gray-200"
                )}
              >
                <p className="text-white">{item.body}</p>
              </div>
            )}

            <div className="relative -mt-3">
              <div
                className={cn(
                  "absolute -top-2 flex w-full min-w-44 gap-1",
                  currentUserId === item.senderId ? "right-14" : "left-12"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-medium text-gray-600",
                    currentUserId === item.senderId
                      ? "min-w-36 text-right"
                      : "min-w-fit text-left"
                  )}
                >
                  {item.sender.name}
                </p>
                <p className="min-w-14 text-xs text-gray-500">
                  {format(item.createdAt, "p")}
                </p>
              </div>
              <UserAvatar
                image={item.sender.image || "/images/placeholder.jpg"}
                id={item.sender.id}
                size={30}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="pt-1" ref={bottomRef} />
    </div>
  )
}

export default MessageChannel
