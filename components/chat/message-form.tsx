import React from "react"
import { ImageIcon, SendHorizonalIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface MessageFormProps extends React.HTMLAttributes<HTMLButtonElement> {
  // add your custom props here
  image?: string
  name?: string
  status?: string
}

const MessageForm: React.FC<MessageFormProps> = ({ ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t p-3  shadow-sm",
        props.className
      )}
    >
      <div className="">
        <ImageIcon className="text-blue-400" height={30} width={30} />
      </div>
      <div className="w-full">
        <input
          type="text"
          className="w-full rounded-full bg-gray-100 p-2 outline-none"
          placeholder="Type a message"
        />
      </div>
      <div className="rounded-full bg-blue-400 p-[0.4rem]">
        <SendHorizonalIcon className="text-white" />
      </div>
    </div>
  )
}

export default MessageForm
