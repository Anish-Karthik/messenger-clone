"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useActiveList, useAuthUser } from "@/store/zustand"
import { FullConversationType } from "@/types"
import { Message } from "@prisma/client"
import axios from "axios"
import { format } from "date-fns"
import { debounce } from "lodash"
import { useInView } from "react-intersection-observer"
import { io } from "socket.io-client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { trpc } from "@/app/_trpc/client"

import GroupChatModal from "../group/group-dialog"
import { useSocket } from "../provider/socket-provider"
import { Skeleton } from "../ui/skeleton"
import UserCard from "./user-card"

const ConversationsMenu = () => {
  const { add, remove } = useActiveList()
  const { socket } = useSocket()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const utils = trpc.useUtils()
  const id = useAuthUser((state) => state.id)
  const currUser = useCurrentUser()
  const router = useRouter()
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    fetchPreviousPage,
  } = trpc.users.getAllConversations.useInfiniteQuery(
    {
      limit: 20,
      userId: id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      gcTime: 4000,
    }
  )
  const { inView, ref } = useInView()
  console.log(inView)
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    } else if (!hasNextPage) {
      fetchPreviousPage()
    }
  }, [inView, hasNextPage, fetchNextPage, fetchPreviousPage, ref])

  useEffect(() => {
    if (!socket) return
    if (!currUser) return
    console.log(socket)

    socket?.on("user:join", (userId: string) => {
      add(userId)
      console.log(userId)
    })
    socket?.on("user:leave", (userId: string) => {
      remove(userId)
      console.log(userId)
    })

    return () => {
      socket?.off("user:join")
      socket?.off("user:leave")
    }
  }, [add, currUser, remove, socket])

  useEffect(() => {
    if (!socket) return

    const newHandler = async (conversation: FullConversationType) => {
      console.log(conversation)
      await utils.users.getAllConversations.invalidate()
    }

    const removeHandler = async (conversationId: string) => {
      console.log("remove", conversationId)
      await utils.users.getAllConversations.invalidate()
    }

    const updateHandler = async ({
      id,
      messages,
    }: {
      id: string
      messages: Message[]
    }) => {
      await utils.users.getAllConversations.invalidate()
    }
    socket.on(`conversation:user:${currUser?.id}:new`, newHandler)
    socket.on(`conversation:user:${currUser?.id}:remove`, removeHandler)
    socket.on(`conversation:user:${currUser?.id}:update`, updateHandler)
    return () => {
      socket.off(`conversation:user:${currUser?.id}:new`, newHandler)
      socket.off(`conversation:user:${currUser?.id}:remove`, removeHandler)
      socket.off(`conversation:user:${currUser?.id}:update`, updateHandler)
    }
  }, [currUser?.id, id, socket, utils.users.getAllConversations])
  console.log(data)
  return (
    <div className="h-full w-full pb-2 max-lg:pb-20">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <GroupChatModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 rounded-full bg-slate-100 px-[6px] hover:opacity-80"
        >
          <Image
            src={"/create-group.svg"}
            alt="create-group"
            width={20}
            height={20}
          />
        </button>
      </div>
      <div className="h-[90%] overflow-y-auto">
        {data &&
          data.pages?.flatMap((page, i) => (
            <div
              key={i}
              className="flex flex-col gap-1"
              // ref={data.pages.length - 1 === i ? ref : undefined}
            >
              {page.items?.map((conversation) => {
                return (
                  <button
                    key={conversation.id}
                    onClick={() =>
                      router.push(`/conversations/${conversation.id}`)
                    }
                  >
                    <UserCard
                      key={conversation.id}
                      id={
                        conversation.isGroup
                          ? conversation.id
                          : conversation.users.find(
                              (user) => currUser?.id !== user.id
                            )!.id
                      }
                      name={
                        conversation.name ??
                        conversation.users.find(
                          (user) => currUser?.id !== user.id
                        )?.name ??
                        ""
                      }
                      lastMessageTime={format(
                        new Date(conversation.lastMessageAt),
                        "p"
                      )}
                      message={
                        conversation.messages.length > 0
                          ? `${
                              conversation.messages[0].senderId === currUser?.id
                                ? "you: "
                                : conversation.messages[0]?.sender?.name +
                                    ": " || ""
                            }${conversation.messages[0].body}` ?? ""
                          : "Started a conversation"
                      }
                      image={
                        conversation.isGroup ||
                        conversation.name ||
                        conversation.userIds.length > 2
                          ? "/images/group.png"
                          : conversation.users.find(
                              (user) => currUser?.id !== user.id
                            )?.image || "/images/placeholder.jpg"
                      }
                      isSeen={
                        conversation.messages[0]?.seenIds?.includes(
                          currUser?.id || ""
                        ) ||
                        !(conversation.messages.length > 0) ||
                        false
                      }
                    />
                  </button>
                )
              })}
            </div>
          ))}
        {(isFetchingNextPage || isLoading) &&
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((_, i) => (
            <div className="my-3 flex items-center space-x-4 max-lg:w-full">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 max-lg:w-full">
                <Skeleton className="h-4 w-[200px] max-lg:w-full" />
                <Skeleton className="h-4 w-[160px] max-lg:w-full" />
              </div>
            </div>
          ))}
        <div ref={ref} className="z-50 " />
      </div>
    </div>
  )
}

export default ConversationsMenu
