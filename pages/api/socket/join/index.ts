import { NextApiRequest } from "next"
import { NextApiResponseServerIo } from "@/types"

import { db } from "@/lib/db"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {
    const body = req.body
    console.log(body)
    console.log(req)
    const { currentUserId } = body
    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    res?.socket?.server?.io?.emit("user:join", currentUserId)
  } catch (error) {
    console.log(error)
    return
  }
}
