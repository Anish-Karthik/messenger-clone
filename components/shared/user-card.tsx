import React from "react"
import Image from "next/image"

const UserCard = ({
  image,
  name,
  message,
}: {
  image?: string
  name: string
  message?: string
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100">
      <div className="relative h-12 w-14">
        <Image
          src={image || "/images/placeholder.jpg"}
          alt="user"
          height={45}
          width={45}
          className="rounded-full"
        />
      </div>
      <div className="w-full">
        <h1 className="text-md font-semibold">{name}</h1>
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </div>
  )
}

export default UserCard
