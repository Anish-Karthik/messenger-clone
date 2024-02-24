import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Hello")

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  return res.status(200).json({ message: "hello" })
}
