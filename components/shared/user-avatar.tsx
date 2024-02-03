"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import { useActiveList } from "@/store/zustand"

import { cn } from "@/lib/utils"

const UserAvatar = ({
  image,
  id,
  size,
}: {
  image?: string
  id?: string
  size?: number
}) => {
  const { members } = useActiveList()
  const isActive = useMemo(() => members.includes(id || ""), [members, id])
  return (
    <div className={cn("relative", !size ?? "h-12 min-w-12")}>
      <Image
        src={image || "/images/placeholder.jpg"}
        alt="user"
        height={size || 45}
        width={size || 45}
        className="rounded-full bg-gray-200/70"
      />
      {isActive ? (
        <span
          className="
            absolute 
            right-0 
            top-0 
            block 
            h-2 
            w-2 
            rounded-full 
            bg-green-500
            ring-2 
            ring-white 
            md:h-3 
            md:w-3
          "
        />
      ) : null}
    </div>
  )
}

export default UserAvatar
