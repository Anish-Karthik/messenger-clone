"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useInView } from "react-intersection-observer"

import { useAuthUser } from "@/lib/store/zustand"
import { trpc } from "@/app/_trpc/client"

import UserCard from "./user-card"

const ConversationsMenu = () => {
  const utils = trpc.useUtils()
  const id = useAuthUser((state) => state.id)
  console.log(id)
  const router = useRouter()
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    trpc.users.getAllConversations.useInfiniteQuery(
      {
        limit: 10,
        userId: id,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  const { inView, ref } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])
  return (
    <div className="h-full w-full">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button className="rounded-full bg-slate-100 p-2 hover:opacity-70">
          <Image
            src="/create-group.svg"
            alt="create group"
            width={20}
            height={20}
            className="opacity-70"
          />
        </button>
      </div>
      <div className="h-[90%] overflow-y-auto">
        {data &&
          data.pages?.flatMap((page, i) => (
            <div
              key={i}
              className="flex flex-col gap-1"
              ref={data.pages.length - 1 === i ? ref : undefined}
            >
              {page.items?.map((conversation) => (
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
                      conversation.users.find((user) => id !== user.id)?.name ??
                      ""
                    }
                    lastMessageTime={format(
                      new Date(conversation.lastMessageAt),
                      "p"
                    )}
                    message={
                      conversation.messagesIds.length > 0
                        ? conversation.messages[0].body ?? ""
                        : "Started a conversation"
                    }
                    image={
                      conversation.users.find((user) => id !== user.id)
                        ?.image || undefined
                    }
                    isSeen={
                      conversation.messages[0]?.seenIds?.includes(id) ?? false
                    }
                  />
                </button>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}

export default ConversationsMenu

// const createOrGetConversations = trpc.conversations.create.useMutation()

// const onClick = async (otherUserId: string) => {
//   const conversation = await createOrGetConversations.mutateAsync({
//     users: [id, otherUserId],
//   })
//   router.push(`/conversations/${conversation.id}`)
// }
// if (createOrGetConversations.isPending)
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent/25 ">
//       <div className="flex flex-col items-center justify-center space-y-4 rounded-md bg-white p-4 shadow-lg">
//         <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600"></div>
//         <p className="text-gray-600">Creating conversation...</p>
//       </div>
//     </div>
//   )
