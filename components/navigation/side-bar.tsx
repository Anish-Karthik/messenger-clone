"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logout } from "@/actions/logout"

import { cn } from "@/lib/utils"

import ProfileDialog from "../shared/profile-dialog"

const SideBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <div className="absolute inset-y-0 left-0 flex w-20 flex-col items-center justify-between p-2 py-4">
      <div className="flex flex-col items-center gap-1">
        <Link
          href={"/conversations"}
          className={cn(
            "rounded-md p-3 hover:bg-slate-200",
            pathname.includes("/conversations") && "bg-slate-100"
          )}
        >
          <Image src="/conversations.svg" alt="msg" width={25} height={25} />
        </Link>
        <Link
          href={"/users"}
          className={cn(
            "rounded-md p-3 hover:bg-slate-200",
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
            "rounded-md p-3 hover:bg-slate-200",
            pathname.includes("/auth") && "bg-slate-100"
          )}
        >
          <Image src="/logout.svg" alt="msg" width={25} height={25} />
        </button>
      </div>
      <ProfileDialog />
    </div>
  )
}

export default SideBar