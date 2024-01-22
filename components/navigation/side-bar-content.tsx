"use client"

import React from "react"
import { usePathname } from "next/navigation"

const SideBarContent = () => {
  const pathname = usePathname()
  return (
    <div className="absolute inset-y-0 ml-20 w-80 p-6 max-sm:hidden">
      {pathname === "/conversations" && <div>Conversation</div>}
      {pathname === "/users" && <div>Users</div>}
    </div>
  )
}

export default SideBarContent
