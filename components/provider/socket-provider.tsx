"use client"

import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { io as ClientIO } from "socket.io-client"

import { useCurrentUser } from "@/hooks/use-current-user"

type SocketContextType = {
  socket: any | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useCurrentUser()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      {
        path: "/api/socket/io",
        // addTrailingSlash: false,
      }
    )

    socketInstance.on("connect", () => {
      if (currentUser) {
        axios.post("/api/socket/join", { currentUserId: currentUser.id })
      }
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      if (currentUser) {
        axios.post("/api/socket/leave", { currentUserId: currentUser.id })
      }
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
