"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const UserCard = ({
  id,
  image,
  name,
  message,
}: {
  id: string
  image?: string
  name: string
  message?: string
}) => {
  const pathname = usePathname()
  const conversationId = useMemo(() => pathname.split("/")?.pop(), [pathname])
  return (
    <Link
      href={`conversations/${id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg p-3",
        conversationId === id ? "bg-gray-200/70" : "hover:bg-gray-100"
      )}
    >
      <div className="relative h-12 w-14">
        <Image
          src={image || "/images/placeholder.jpg"}
          alt="user"
          height={45}
          width={45}
          className="rounded-full"
        />
      </div>
      <div className="w-full">
        <h1 className="text-md font-semibold">{name}</h1>
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </Link>
  )
}

export default UserCard
