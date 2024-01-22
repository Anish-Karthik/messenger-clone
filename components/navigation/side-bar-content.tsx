"use client"

import React, { useMemo } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const SideBarContent = () => {
  const pathname = usePathname()

  const notShow = useMemo(() => {
    return pathname.split("/").filter((x) => x !== "").length > 1
  }, [pathname])

  return (
    <div
      className={cn(
        "absolute inset-y-0 ml-20 w-80 p-6 max-lg:!m-0 max-lg:w-full max-lg:appearance-none max-lg:pb-16 ",
        notShow && "hidden"
      )}
    >
      {pathname === "/conversations" && <div>Conversation</div>}
      {pathname === "/users" && <div>Users</div>}
    </div>
  )
}

export default SideBarContent
