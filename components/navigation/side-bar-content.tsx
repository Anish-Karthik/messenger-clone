"use client"

import React, { useMemo } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import ConversationsMenu from "../shared/conversations-menu"
import UsersMenu from "../shared/users-menu"

const SideBarContent = ({ className }: { className?: string }) => {
  const pathname = usePathname()!

  const notShow = useMemo(() => {
    return pathname.split("/").filter((x) => x !== "").length > 1
  }, [pathname])

  return (
    <div
      className={cn(
        "px-5 pt-4 lg:border-r",
        notShow && "max-lg:hidden",
        className
      )}
    >
      {pathname.includes("/conversations") && <ConversationsMenu />}
      {pathname.includes("/users") && <UsersMenu />}
    </div>
  )
}

export default SideBarContent
