"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { FullMessageType } from "@/types"
import axios from "axios"
import { format } from "date-fns"
import { useInView } from "react-intersection-observer"

import { cn } from "@/lib/utils"
import { trpc } from "@/app/_trpc/client"

import { useSocket } from "../provider/socket-provider"
import UserAvatar from "../shared/user-avatar"
import { Skeleton } from "../ui/skeleton"

const MessageChannel = ({
  currentUserId,
  conversationId,
}: {
  currentUserId: string
  conversationId: string
}) => {
  const { inView, ref } = useInView()
  const { isConnected, socket } = useSocket()
  const utils = trpc.useUtils()
  const bottomRef = useRef<HTMLDivElement>(null)
  const preTopRef = useRef<HTMLDivElement>(null)
  const {
    data: conversationMessages,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
  } = trpc.conversations.getAllMessages.useInfiniteQuery(
    {
      conversationId,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      gcTime: 4000,
      refetchInterval: isConnected ? false : 1000,
    }
  )

  useEffect(() => {
    console.log(inView)
    if (inView && hasNextPage) {
      console.log("hi")
      preTopRef?.current?.scrollIntoView()
      fetchNextPage()
    }
  }, [
    inView,
    hasNextPage,
    fetchNextPage,
    fetchPreviousPage,
    ref,
    hasPreviousPage,
  ])

  console.log(conversationMessages)
  useEffect(() => {
    axios.post(`/api/socket/conversations/${conversationId}/seen`, {
      currentUserId,
    })
  }, [conversationId, currentUserId])

  console.log("hi")
  useEffect(() => {
    // bottomRef?.current?.scrollIntoView()
    if (!socket) return
    const messageHandler = async (message: FullMessageType) => {
      console.log(message)
      axios.post(`/api/socket/conversations/${conversationId}/seen`, {
        currentUserId,
      })
      // await utils.conversations.getAllMessages.invalidate()
      await utils.conversations.getAllMessages.cancel()
      // setData(conversationId, (current) => {
      //   console.log(current)
      //   if (!current) return current
      //   if (find(current?.messages, { id: message.id })) {
      //     return current
      //   }
      //   const newMessages = [...current.messages, message]
      //   return { ...current, messages: newMessages } as typeof current
      // })
      utils.conversations.getAllMessages.setInfiniteData(
        { limit: 20, conversationId },
        (data) => {
          console.log(data)
          if (!data) {
            return {
              pages: [],
              pageParams: [],
            }
          }
          console.log(data.pages)
          const firstPage = data.pages[0]
          if (!firstPage) {
            return data
          }
          console.log(firstPage.items)
          const newMessages = [{ ...message }, ...firstPage.items]
          console.log(newMessages)
          const res = [
            { ...firstPage, items: newMessages as typeof firstPage.items },
            ...data.pages.slice(1, data.pages.length),
          ]
          // right shift last item in eacch page to nextpage
          console.log(res)
          for (let i = 0; i < res.length - 1; i++) {
            const tmp = res[i].items.pop()
            console.log(res[i].items.length)
            res[i + 1].items.push(tmp!)
          }
          const lastMessageRemoved = res[res.length - 1].items.pop()
          console.log(data.pageParams)
          data.pageParams[data.pageParams.length - 1] = lastMessageRemoved!.id
          return {
            pages: res,
            pageParams: data.pageParams,
          }
        }
      )
      // fetchPreviousPage()
      bottomRef?.current?.scrollIntoView()
    }

    const updateMessageHandler = async (newMessage: FullMessageType) => {
      console.log(newMessage)
    }
    socket.on(`conversation:${conversationId}:messages`, messageHandler)
    socket.on(
      `conversation:${conversationId}:messages:update`,
      updateMessageHandler
    )
    return () => {
      socket.off(`conversation:${conversationId}:messages`, messageHandler)
      socket.off(
        `conversation:${conversationId}:messages:update`,
        updateMessageHandler
      )
    }
  }, [
    conversationId,
    currentUserId,
    socket,
    utils.conversations.getAllMessages,
  ])
  if (isLoading) {
    return (
      <div className="relative h-full w-full overflow-y-auto">
        <div className="-mt-1 h-1 w-full" ref={ref} />
        {/* <div className="mt-1 w-full h-1" ref={preTopRef} /> */}
        {[0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((_, i) => (
          <div
            className={cn(
              "my-3 flex min-w-full items-center space-x-4",
              i % 2 && "flex-row-reverse"
            )}
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-[300px] rounded-3xl max-lg:w-[60%]" />
          </div>
        ))}
        <div className="h-1 w-full bg-green-300 pt-1" ref={bottomRef} />
      </div>
    )
  }

  if (error) return <p>{error.message}</p>
  console.log(conversationMessages)
  return (
    <div className="relative h-full w-full overflow-y-auto">
      <div className="-mt-1 h-1 w-full" ref={ref} />
      <div className="mt-1 h-1 w-full" ref={preTopRef} />
      {(isFetchingNextPage || isLoading) &&
        [0, 0, 0, 0].map((_, i) => (
          <div
            className={cn(
              "my-3 flex min-w-full items-center space-x-4",
              i % 2 && "flex-row-reverse"
            )}
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-[300px] rounded-3xl max-lg:w-[60%]" />
          </div>
        ))}
      {conversationMessages?.pages?.toReversed().flatMap((page, i) => (
        <div
          key={i}
          className="flex flex-col gap-1"
          // ref={data.pages.length - 1 === i ? ref : undefined}
        >
          {page.items.toReversed().map((item, j) => (
            <div
              key={item.id}
              className={cn(
                "mt-6 flex",
                currentUserId === item.senderId
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex",
                  currentUserId === item.senderId
                    ? "flex-row"
                    : "flex-row-reverse",
                  // i === 0 && j === 0 && "bg-red-200"
                )}
                // ref={i === 0 && j === 0 ? preTopRef: null}
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
                      currentUserId === item.senderId
                        ? "bg-sky-500"
                        : "bg-gray-200"
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
        </div>
      ))}

      <div className="h-1  w-full pt-1" ref={bottomRef} />
    </div>
  )
}

export default MessageChannel
