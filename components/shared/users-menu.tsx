"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useInView } from "react-intersection-observer"

import { useAuthUser } from "@/lib/store/zustand"
import { trpc } from "@/app/_trpc/client"

import UserCard from "./user-card"

const UsersMenu = () => {
  const utils = trpc.useUtils()
  const router = useRouter()
  const id = useAuthUser((state) => state.id)
  console.log(id)
  const createOrGetConversations = trpc.conversations.create.useMutation()
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
  } = trpc.users.getAll.useInfiniteQuery(
    {
      limit: 10,
      id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )
  const { inView, ref } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    } else if (!hasNextPage) {
      fetchPreviousPage()
    }
  }, [inView, hasNextPage, fetchNextPage, fetchPreviousPage])

  const onClick = async (otherUserId: string) => {
    const conversation = await createOrGetConversations.mutateAsync({
      users: [id, otherUserId],
    })
    router.push(`/conversations/${conversation.id}`)
  }
  if (createOrGetConversations.isPending)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent/25 ">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md bg-white p-4 shadow-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600"></div>
          <p className="text-gray-600">Creating conversation...</p>
        </div>
      </div>
    )
  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">People</h1>
      </div>

      <div className="h-[90%] overflow-y-auto">
        {data &&
          data.pages?.flatMap((page, i) => (
            <div
              key={i}
              className="flex flex-col gap-1"
              ref={data.pages.length - 1 === i ? ref : undefined}
            >
              {page.items.map((user) => (
                <button
                  key={user.id}
                  onClick={async () => await onClick(user.id)}
                >
                  <UserCard key={user.id} id={user.id} name={user.name ?? ""} />
                </button>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}

export default UsersMenu
