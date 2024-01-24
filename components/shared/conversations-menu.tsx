"use client"

import Image from "next/image"

import UserCard from "./user-card"

const ConversationsMenu = () => {
  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button className="rounded-full bg-slate-100 p-2 hover:opacity-70">
          <Image
            src="/create-group.svg"
            alt="create group"
            width={20}
            height={20}
            className="opacity-70"
          />
        </button>
      </div>
      <div className="h-[90%] overflow-y-auto">
        <div className="flex flex-col gap-1 pr-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((x) => (
            <UserCard
              key={x}
              id={x.toString()}
              name="User Name"
              message="Started a conversation"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConversationsMenu
