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

import { pusherClient } from "@/lib/pusher"
import { useCurrentUser } from "@/hooks/use-current-user"
import { trpc } from "@/app/_trpc/client"

import GroupChatModal from "../group/group-dialog"
import UserCard from "./user-card"

const ConversationsMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const utils = trpc.useUtils()
  const id = useAuthUser((state) => state.id)
  const currUser = useCurrentUser()
  console.log(id)
  const router = useRouter()
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
  } = trpc.users.getAllConversations.useInfiniteQuery(
    {
      limit: 5,
      userId: id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )
  const pusherKey = useMemo(() => currUser?.id, [currUser?.id])
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
    if (!pusherKey) return

    pusherClient.subscribe(pusherKey)

    const newHandler = async (conversation: FullConversationType) => {
      console.log(conversation)
      await utils.users.getAllConversations.cancel()
      utils.users.getAllConversations.setInfiniteData(
        {
          userId: id,
          limit: 10,
        },
        // @ts-ignore
        (data) => {
          if (!data) {
            console.log("no data")
            return {
              pages: [],
              pageParams: [],
            }
          }
          if (
            find(data.pages, (page) =>
              page?.items?.find((item) => item.id === conversation.id)
            )
          ) {
            return data
          }
          console.log("hi")
          const newPages = data.pages.map((page, i) => ({
            ...page,
            items:
              i === 0 && page.items
                ? [conversation, ...page.items]
                : page.items,
          }))
          return {
            ...data,
            pages: newPages,
          }
        }
      )
    }

    const removeHandler = async (conversationId: string) => {
      await utils.users.getAllConversations.cancel()
      utils.users.getAllConversations.setInfiniteData(
        {
          userId: id,
          limit: 10,
        },
        (data) => {
          if (!data) {
            console.log("no data")
            return {
              pages: [],
              pageParams: [],
            }
          }
          const newPages = data.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== conversationId),
          }))
          return {
            ...data,
            pages: newPages,
          }
        }
      )
    }

    const updateHandler = async ({
      id,
      messages,
    }: {
      id: string
      messages: Message[]
    }) => {
      await utils.users.getAllConversations.cancel()
      utils.users.getAllConversations.setInfiniteData(
        {
          userId: id,
          limit: 10,
        },
        // @ts-ignore
        (data) => {
          if (!data) {
            console.log("no data")
            return {
              pages: [],
              pageParams: [],
            }
          }
          const newPages = data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === id ? { ...item, messages } : item
            ),
          }))
          return {
            ...data,
            pages: newPages,
          }
        }
      )
    }

    pusherClient.bind("conversation:new", newHandler)
    pusherClient.bind("conversation:remove", removeHandler)
    pusherClient.bind("conversation:update", updateHandler)

    return () => {
      pusherClient.unsubscribe(pusherKey)
      pusherClient.unbind("conversation:new", newHandler)
      pusherClient.unbind("conversation:remove", removeHandler)
      pusherClient.unbind("conversation:update", updateHandler)
    }
  }, [id, pusherKey, utils.users.getAllConversations])
  console.log(data)
  return (
    <div className="h-full w-full pb-12">
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
                        conversation.users.find((user) => id !== user.id)
                          ?.image ||
                        (conversation?.isGroup && "/images/group.png") ||
                        undefined
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
        <div ref={ref} className="z-50 pt-24" />
      </div>
    </div>
  )
}

export default ConversationsMenu
