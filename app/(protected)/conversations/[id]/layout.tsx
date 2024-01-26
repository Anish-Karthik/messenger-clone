import React from "react"

import MessageForm from "@/components/chat/message-form"
import TopCard from "@/components/chat/top-card"

const layout = ({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) => {
  console.log(params)
  return (
    <div className="relative h-full">
      <TopCard className="absolute inset-x-0 top-0" />
      <div className="absolute inset-x-0 inset-y-16">
        {children}
        {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
          <div key={item} className="flex justify-end overflow-y-auto max-h-[90%]">
            <div className="bg-gray-200 rounded-lg p-2 m-2">
              <p className="text-gray-500">Hello</p>
            </div>
          </div>
        ))} */}
      </div>
      <MessageForm className="absolute inset-x-0 bottom-0" />
    </div>
  )
}

export default layout
