import { useEffect, useState } from "react"
import { useActiveList } from "@/store/zustand"
import { Channel, Members } from "pusher-js"

import { pusherClient } from "@/lib/pusher"

const useActiveChannel = () => {
  const { set, add, remove } = useActiveList()
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)

  useEffect(() => {
    let channel = activeChannel
    if (!channel) {
      channel = pusherClient.subscribe("presence-messenger")
      setActiveChannel(channel)
    }
    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const initialMembers: string[] = []
      members.each((member: Record<string, any>) =>
        initialMembers.push(member.id)
      )
      set(initialMembers)
    })

    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      add(member.id)
    })

    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      remove(member.id)
    })

    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe("presence-messenger")
        setActiveChannel(null)
      }
    }
  }, [activeChannel, add, remove, set])
}

export default useActiveChannel

// import { useEffect, useState } from "react"
// import { useActiveList } from "@/store/zustand"
// import { Channel, Members } from "pusher-js"
// import { pusherClient } from "@/lib/pusher"
// import { useSocket } from "@/components/provider/socket-provider"
// import { io, Socket } from "socket.io-client"

// const useActiveChannel = () => {
//   const { set, add, remove } = useActiveList()
//   const [activeChannel, setActiveChannel] = useState<Socket | null>(null)

//   useEffect(() => {
//     let socket = activeChannel
//     if (!socket) {
//       socket = io("http://localhost:3000")
//       setActiveChannel(socket)
//     }

//     socket.on("connect", () => {
//       socket?.emit("join", "presence-messenger")
//     })

//     socket.on("pusher:subscription_succeeded", (members: string[]) => {
//       set(members)
//     })

//     socket.on("pusher:member_added", (member: string) => {
//       add(member)
//     })

//     socket.on("pusher:member_removed", (member: string) => {
//       remove(member)
//     })

//     return () => {
//       if (activeChannel) {
//         socket?.disconnect()
//         setActiveChannel(null)
//       }
//     }
//   }, [activeChannel, add, remove, set])
// }

// export default useActiveChannel
