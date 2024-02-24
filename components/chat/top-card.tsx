import Image from "next/image"
import Link from "next/link"
import { Conversation, User } from "@prisma/client"
import { ArrowLeft, CircleEllipsisIcon, MenuIcon } from "lucide-react"
import { FaEllipsisH } from "react-icons/fa"

import { cn } from "@/lib/utils"

import Status from "../shared/status"
import UserAvatar from "../shared/user-avatar"
import { SocketIndicator } from "../socket-indicator"
import { Button } from "../ui/button"
import DetailsSheet from "./details-sheet"

const TopCard = ({
  className,
  currentUserId,
  conversationDetail,
}: {
  className?: string
  currentUserId: string
  conversationDetail: Conversation & { users: User[] }
}) => {
  const otherUserDetail = conversationDetail.users.find(
    (user) => user.id !== currentUserId
  )
  console.log("load")
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b p-3 px-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-lg max-lg:-ml-4">
        <Link href={"/conversations"} className="lg:hidden">
          <Button variant={"ghost"}>
            <ArrowLeft size={24} className="-mx-2" />
          </Button>
        </Link>
        <UserAvatar
          id={conversationDetail.isGroup ? "" : otherUserDetail?.id}
          image={
            conversationDetail.isGroup
              ? "/images/group.png"
              : otherUserDetail?.image || "/images/placeholder.jpg"
          }
        />
        <div className="flex w-full flex-col overflow-x-clip">
          <h1 className="text-md text-left font-normal">
            {conversationDetail.name || otherUserDetail?.name}
          </h1>
          <Status
            id={
              conversationDetail.isGroup
                ? undefined
                : otherUserDetail?.id || undefined
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SocketIndicator />
        {conversationDetail.isGroup ? (
          <DetailsSheet conversationDetail={conversationDetail} />
        ) : (
          <DetailsSheet
            conversationDetail={conversationDetail}
            otherUserDetail={otherUserDetail}
          />
        )}
      </div>
    </div>
  )
}

export default TopCard
