import { Server as NetServer, Socket } from "net"
import { NextApiResponse } from "next"
import { Conversation, Message, User } from "@prisma/client"
import { Server as SocketIOServer } from "socket.io"

export type FullMessageType = Message & {
  sender: User
  seen: User[]
}

export type FullConversationType = Conversation & {
  users: User[]
  messages: FullMessageType[]
}

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}
