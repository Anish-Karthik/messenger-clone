import Image from "next/image"
import { format } from "date-fns"

import { currentUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { serverClient } from "@/app/_trpc/serverClient"

const page = async ({ params }: { params: { id: string } }) => {
  const conversationDetail = await serverClient.conversations.getAllMessages(
    params.id
  )
  const user = await currentUser()
  return (
    <div className="h-full overflow-y-auto">
      {conversationDetail!.messages?.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "mt-6 flex",
            user!.id === item.senderId ? "justify-end" : "justify-start"
          )}
        >
          {item.images.length > 0 ? (
            <div className="">
              {item.images.map((image, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative m-2 h-32 w-32 rounded-xl p-2",
                    user!.id === item.senderId ? "bg-sky-500" : "bg-gray-200"
                  )}
                >
                  <Image
                    src={image!}
                    alt="image"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-xl"
                  />
                </div>
              ))}
              {item.body && (
                <div
                  className={cn(
                    "m-2 -mt-6 max-w-[50vw] rounded-xl p-2 px-4 pt-4",
                    user!.id === item.senderId ? "bg-sky-500" : "bg-gray-200"
                  )}
                >
                  <p className="text-white">{item.body}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "m-2 max-w-[50vw] rounded-3xl p-2 px-4",
                user!.id === item.senderId ? "bg-sky-500" : "bg-gray-200"
              )}
            >
              <p className="text-white">{item.body}</p>
            </div>
          )}
          <div className="relative -mt-3">
            <div className="absolute -top-2 right-12 flex w-full min-w-44 gap-1">
              <p className="min-w-36 text-right text-xs font-medium text-gray-600">
                {item.sender.name}
              </p>
              <p className="min-w-12 text-xs text-gray-500">
                {format(item.createdAt, "p")}
              </p>
            </div>
            <Image
              src={item.sender.image || "/images/placeholder.jpg"}
              alt="image"
              height={30}
              width={30}
              className="rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default page
