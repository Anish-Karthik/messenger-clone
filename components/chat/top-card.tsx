import React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

interface TopCardProps extends React.HTMLAttributes<HTMLButtonElement> {
  // add your custom props here
  image?: string
  name?: string
  status?: string
}

const TopCard: React.FC<TopCardProps> = ({
  status,
  image,
  name = "Anish Karthik",
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b p-3 px-6 shadow-sm",
        props.className
      )}
    >
      <div className="flex items-center gap-3 rounded-lg">
        <div className="h-12 min-w-12">
          <Image
            src={image || "/images/placeholder.jpg"}
            alt="user"
            height={45}
            width={45}
            className="rounded-full"
          />
        </div>
        <div className="flex w-full flex-col overflow-x-clip">
          <h1 className="text-md text-left font-normal">{name}</h1>
          <p className="text-md -mt-1 truncate text-left font-light text-gray-500">
            {status || "Offline"}
          </p>
        </div>
      </div>
      <div></div>
    </div>
  )
}

export default TopCard
