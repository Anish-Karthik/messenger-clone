"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Conversation, User } from "@prisma/client"
import axios from "axios"
import { format } from "date-fns"
import { Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"

import { useCurrentUser } from "@/hooks/use-current-user"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import Status from "../shared/status"
import UserAvatar from "../shared/user-avatar"
import UserCard from "../shared/user-card"
import { Separator } from "../ui/separator"

const DetailsSheet = ({
  conversationDetail,
  otherUserDetail,
}: {
  conversationDetail?: Conversation & { users: User[] }
  otherUserDetail?: User
}) => {
  const user = useCurrentUser()
  const router = useRouter()
  // const deleteConversation = trpc.conversations.delete.useMutation()
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        //await deleteConversation.mutateAsync(id)
        const res = await axios.delete(`/api/socket/conversations/${id}`, {
          data: {
            currentUserId: user?.id,
          },
        })
        console.log(res)
        toast.success("Conversation deleted")
        router.push("/conversations")
      } catch (error) {
        console.log(error)
        toast.error("Error deleting conversation")
      }
    },
    [router, user?.id]
  )
  return (
    <Sheet>
      <SheetTrigger>
        <p className="-mt-6 pr-1 text-4xl text-blue-500">{"..."}</p>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle></SheetTitle>
          <SheetDescription className="p-5">
            <div className="mt-8 flex flex-col">
              <div className="flex flex-col items-center justify-between gap-3">
                <UserAvatar
                  id={conversationDetail?.isGroup ? "" : otherUserDetail?.id}
                  image={
                    conversationDetail?.isGroup
                      ? "/images/group.png"
                      : otherUserDetail?.image || "/images/placeholder.jpg"
                  }
                />
                <h1 className="text-xl font-semibold">
                  {conversationDetail?.name || otherUserDetail?.name}
                </h1>
                <Status
                  id={
                    conversationDetail?.isGroup
                      ? undefined
                      : otherUserDetail?.id || undefined
                  }
                />
                <button
                  className="mb-6 mt-4"
                  onClick={() =>
                    handleDeleteConversation(conversationDetail!.id)
                  }
                >
                  <div className="rounded-full bg-gray-100 p-3 hover:opacity-80">
                    <Trash2Icon size={20} />
                  </div>
                  <div>
                    <p className="mt-3 text-sm font-extralight text-gray-800">
                      {"Delete"}
                    </p>
                  </div>
                </button>
              </div>
              {conversationDetail?.isGroup ? (
                <div className="mt-2 flex flex-col items-center gap-2">
                  {/* <div className="mt-2 flex items-center gap-3">
                    <Button className="w-full" variant="secondary">
                      {"Add Participants"}
                    </Button>
                    <Button className="w-full" variant="destructive">
                      {"Leave Group"}
                    </Button>
                  </div> */}
                  <div className=" overflow-y-auto">
                    {conversationDetail?.users.map((user) => (
                      <UserCard
                        key={user.id}
                        id={user.id}
                        name={user.name ?? ""}
                        message={user.email!}
                        image={user.image || undefined}
                        isSeen
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex w-full flex-col items-center gap-6">
                  <div className="flex w-full flex-col gap-1 overflow-x-clip">
                    <p className="text-left text-sm font-medium text-gray-500">
                      {"Email"}
                    </p>
                    <p className="truncate text-left text-sm font-light text-black">
                      {otherUserDetail?.email}
                    </p>
                  </div>
                  <Separator className="w-full" />
                  <div className="flex w-full flex-col gap-1 overflow-x-clip">
                    <p className="text-left text-sm font-medium text-gray-500">
                      {"Joined"}
                    </p>
                    <p className="truncate text-left text-sm font-light text-black">
                      {format(conversationDetail?.createdAt!, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default DetailsSheet
