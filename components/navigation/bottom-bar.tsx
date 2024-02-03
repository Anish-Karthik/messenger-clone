"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logout } from "@/actions/logout"

import { cn } from "@/lib/utils"

const BottomBar = () => {
  const pathname = usePathname()!
  const router = useRouter()

  const notShow = useMemo(() => {
    return pathname.split("/").filter((x) => x !== "").length > 1
  }, [pathname])

  return (
    <div
      className={cn(
        "fixed -inset-x-2 -bottom-0 flex h-16 items-center justify-between border lg:hidden",
        notShow && "hidden"
      )}
    >
      <Link
        href={"/conversations"}
        className={cn(
          "flex h-full w-full items-center justify-center p-3 opacity-60 hover:bg-slate-200 hover:opacity-100",
          pathname.includes("/conversations") && "bg-slate-100"
        )}
      >
        <Image src="/conversations.svg" alt="msg" width={25} height={25} />
      </Link>
      <Link
        href={"/users"}
        className={cn(
          "flex h-full w-full items-center justify-center p-3 opacity-60 hover:bg-slate-200 hover:opacity-100",
          pathname.includes("/users") && "bg-slate-100"
        )}
      >
        <Image src="/users.svg" alt="msg" width={25} height={25} />
      </Link>
      <button
        onClick={() => {
          logout()
          router.push("/auth/login")
        }}
        className={cn(
          "flex h-full w-full items-center justify-center p-3 opacity-60 hover:bg-slate-200 hover:opacity-100",
          pathname.includes("/auth") && "bg-slate-100"
        )}
      >
        <Image src="/logout.svg" alt="msg" width={25} height={25} />
      </button>
    </div>
  )
}

export default BottomBar
