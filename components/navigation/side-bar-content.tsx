"use client"

import React, { useMemo } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import ConversationsMenu from "../shared/conversations-menu"
import UsersMenu from "../shared/users-menu"

const SideBarContent = () => {
  const pathname = usePathname()

  const notShow = useMemo(() => {
    return pathname.split("/").filter((x) => x !== "").length > 1
  }, [pathname])

  return (
    <div
      className={cn(
        "absolute inset-y-0 ml-20 w-80 px-5 py-4 max-lg:inset-x-0 max-lg:!m-0 max-lg:w-full max-lg:pb-16 lg:border-r",
        notShow && "max-lg:hidden"
      )}
    >
      {pathname.includes("/conversations") && <ConversationsMenu />}
      {pathname.includes("/users") && <UsersMenu />}
    </div>
  )
}

export default SideBarContent
