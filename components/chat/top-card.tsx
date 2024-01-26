"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Conversation, User } from "@prisma/client"

import { useAuthUser } from "@/lib/store/zustand"
import { cn } from "@/lib/utils"
import { trpc } from "@/app/_trpc/client"

const TopCard = ({ className }: { className?: string }) => {
  const params = useParams()
  const currentUserId = useAuthUser((user) => user.id)
  const conversationDetail = trpc.conversations.getById.useQuery(
    params.id as string
  )
  const otherUserDetail = useMemo(
    () =>
      conversationDetail?.data?.users.find((user) => user.id !== currentUserId),
    [conversationDetail, currentUserId]
  )
  console.log("load")
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b p-3 px-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-lg">
        <div className="h-12 min-w-12">
          <Image
            src={otherUserDetail?.image || "/images/placeholder.jpg"}
            alt="user"
            height={45}
            width={45}
            className="rounded-full"
          />
        </div>
        <div className="flex w-full flex-col overflow-x-clip">
          <h1 className="text-md text-left font-normal">
            {conversationDetail?.data?.name || otherUserDetail?.name}
          </h1>
          <p className="text-md -mt-1 truncate text-left font-light text-gray-500">
            {"Offline"}
          </p>
        </div>
      </div>
      <div></div>
    </div>
  )
}

export default TopCard
