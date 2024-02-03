"use client"

import { FullMessageType } from "@/types"
import axios from "axios"
import { format } from "date-fns"
import { find } from "lodash"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { pusherClient } from "@/lib/pusher"
import { cn } from "@/lib/utils"

const MessageChannel = ({
  currentUserId,
  conversationId,
  initialMessages
}: {
  currentUserId: string
  conversationId: string
  initialMessages: FullMessageType[];
}) => {
const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);
  console.log(messages)
  useEffect(() => {
    pusherClient.subscribe(conversationId)
    bottomRef?.current?.scrollIntoView();
    console.log('subscribed')
    const messageHandler = (message: FullMessageType) => {
      console.log('new message')
      axios.post(`/api/conversations/${conversationId}/seen`);

      setMessages((current) => {
        console.log(current)
        if (find(current, { id: message.id })) {
          return current;
        }
        console.log('new message')
        return [...current, message]
      });
      
      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      console.log('update message')
      setMessages((current) => current.map((currentMessage) => {
        console.log(currentMessage.id, newMessage.id)
        if (currentMessage.id === newMessage.id) {
          return newMessage;
        }
        console.log('no update')
        return currentMessage;
      }))
    };
  

    pusherClient.bind('messages:new', messageHandler)
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind('messages:new', messageHandler)
      pusherClient.unbind('message:update', updateMessageHandler)
    }
  }, [conversationId]);

  return (
    <div className="h-full overflow-y-auto">
      {messages.map((item, i) => (
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
                  currentUserId === item.senderId ? "right-12" : "left-12"
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
                <p className="min-w-12 text-xs text-gray-500">
                  {format(item.createdAt, "p")}
                </p>
              </div>
              <Image
                src={item.sender.image || "/images/placeholder.jpg"}
                alt="image"
                height={30}
                width={30}
                className="rounded-full"
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
