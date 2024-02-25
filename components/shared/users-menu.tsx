"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/store/zustand"
import axios from "axios"
import { Conversation } from "prisma/prisma-client"
import toast from "react-hot-toast"
import { useInView } from "react-intersection-observer"

import { trpc } from "@/app/_trpc/client"

import { Skeleton } from "../ui/skeleton"
import UserCard from "./user-card"

const UsersMenu = () => {
  const utils = trpc.useUtils()
  const router = useRouter()
  const id = useAuthUser((state) => state.id)
  console.log(id)

  const {
    data,
    isLoading,
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
    try {
      const conversation = await axios.post("/api/socket/conversations", {
        userId: otherUserId,
        currentUserId: id,
      })
      console.log(conversation)
      // @ts-ignore
      router.push(`/conversations/${conversation.data.id}`)
    } catch (error) {
      toast.error("Something went wrong")
    }
  }
  return (
    <div className="h-full w-full">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">People</h1>
      </div>

      <div className="h-[95%] overflow-y-auto">
        {data &&
          data.pages?.flatMap((page, i) => (
            <div
              key={i}
              className="flex flex-col gap-1"
              // ref={data.pages.length - 1 === i ? ref : undefined}
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
        <div ref={ref} className="" />
      </div>
    </div>
  )
}

export default UsersMenu
