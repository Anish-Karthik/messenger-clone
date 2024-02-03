import Image from "next/image"
import { Conversation, User } from "@prisma/client"
import { CircleEllipsisIcon, MenuIcon } from "lucide-react"
import { FaEllipsisH } from "react-icons/fa"

import { cn } from "@/lib/utils"

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
      <div className="flex items-center gap-3 rounded-lg">
        <div className="h-12 min-w-12">
          <Image
            src={
              conversationDetail.isGroup
                ? "/images/group.png"
                : otherUserDetail?.image || "/images/placeholder.jpg"
            }
            alt="user"
            height={45}
            width={45}
            className="rounded-full"
          />
        </div>
        <div className="flex w-full flex-col overflow-x-clip">
          <h1 className="text-md text-left font-normal">
            {conversationDetail.name || otherUserDetail?.name}
          </h1>
          <p className="text-md -mt-1 truncate text-left font-light text-gray-500">
            {"Offline"}
          </p>
        </div>
      </div>
      <div>
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
