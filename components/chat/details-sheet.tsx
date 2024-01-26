"use client"

import React from "react"
import Image from "next/image"
import { Conversation, User } from "@prisma/client"
import { format } from "date-fns"
import { Trash2Icon } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import UserCard from "../shared/user-card"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"

const DetailsSheet = ({
  conversationDetail,
  otherUserDetail,
}: {
  conversationDetail?: Conversation & { users: User[] }
  otherUserDetail?: User
}) => {
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
                <div className="h-12 min-w-12">
                  <Image
                    src={otherUserDetail?.image || "/images/placeholder.jpg"}
                    alt="user"
                    height={45}
                    width={45}
                    className="rounded-full"
                  />
                </div>
                <h1 className="text-xl font-semibold">
                  {conversationDetail?.name || otherUserDetail?.name}
                </h1>
                <p className="text-md -mt-3 truncate text-left font-light text-gray-500">
                  {"Offline"}
                </p>
                <button className="mb-6 mt-4">
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
