"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/store/zustand"
import { FullConversationType } from "@/types"
import { Message } from "@prisma/client"
import { format } from "date-fns"
import { find } from "lodash"
import { useInView } from "react-intersection-observer"

// import { pusherClient } from "@/lib/pusher"
import { useCurrentUser } from "@/hooks/use-current-user"
import { trpc } from "@/app/_trpc/client"

import GroupChatModal from "../group/group-dialog"
import { useSocket } from "../provider/socket-provider"
import { Skeleton } from "../ui/skeleton"
import UserCard from "./user-card"

const ConversationsMenu = () => {
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
  // const pusherKey = useMemo(() => currUser?.id, [currUser?.id])
  const { inView, ref } = useInView()
  console.log(inView)
  useEffect(() => {
    console.log(inView)
    console.log(hasNextPage)
    if (inView && hasNextPage) {
      fetchNextPage()
    } else if (!hasNextPage) {
      fetchPreviousPage()
    }
  }, [inView, hasNextPage, fetchNextPage, fetchPreviousPage, ref])

  useEffect(() => {
    // if (!pusherKey) return

    // pusherClient.subscribe(pusherKey)
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
    <div className="h-full w-full">
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
      <div className="h-[95%] overflow-y-auto">
        {data &&
          data.pages?.flatMap((page, i) => (
            <div
              key={i}
              className="flex flex-col gap-1"
              // ref={data.pages.length - 1 === i ? ref : undefined}
            >
              {page.items?.map((conversation) => {
                console.log(conversation.messages)
                console.log(conversation.lastMessageAt)
                console.log(conversation.createdAt)
                console.log(
                  new Date(conversation.lastMessageAt) >
                    new Date(conversation.createdAt)
                )
                return (
                  <button
                    key={conversation.id}
                    onClick={() =>
                      router.push(`/conversations/${conversation.id}`)
                    }
                  >
                    <UserCard
                      key={conversation.id}
                      id={conversation.id}
                      name={
                        conversation.name ??
                        conversation.users.find((user) => id !== user.id)
                          ?.name ??
                        ""
                      }
                      lastMessageTime={format(
                        new Date(conversation.lastMessageAt),
                        "p"
                      )}
                      message={
                        conversation.messages.length > 0
                          ? `${
                              conversation.messages[0].senderId === id
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
                          : conversation.users.find((user) => id !== user.id)
                              ?.image || "/images/placeholder.jpg"
                      }
                      isSeen={
                        conversation.messages[0]?.seenIds?.includes(id) ||
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
          new Array(10).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        <div ref={ref} className="z-50 " />
      </div>
    </div>
  )
}

export default ConversationsMenu
