"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useActiveList } from "@/store/zustand"

import { cn } from "@/lib/utils"

import UserAvatar from "./user-avatar"

const UserCard = ({
  id,
  image,
  name,
  message,
  lastMessageTime,
  isSeen = false,
}: {
  id: string
  name: string
  image?: string
  message?: string
  lastMessageTime?: string
  isSeen?: boolean
}) => {
  const pathname = usePathname()!
  const conversationId = useMemo(() => pathname.split("/")?.pop(), [pathname])
  return (
    <Link
      href={`conversations/${id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg p-3",
        conversationId === id ? "bg-gray-200/70" : "hover:bg-gray-100"
      )}
    >
      <UserAvatar image={image} id={id} />
      <div className="flex w-full flex-col gap-1 overflow-x-clip">
        <div className="flex justify-between">
          <h1 className="text-left text-sm font-semibold">{name}</h1>
          {lastMessageTime && (
            <p className="text-right text-sm font-light text-gray-400">
              {lastMessageTime}
            </p>
          )}
        </div>
        <p
          className={cn(
            "truncate text-left text-sm",
            isSeen ? "text-gray-500" : "font-semibold"
          )}
        >
          {message}
        </p>
      </div>
    </Link>
  )
}

export default UserCard
