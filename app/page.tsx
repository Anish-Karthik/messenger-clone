import { redirect } from "next/navigation"

import { currentUser } from "@/lib/auth"

export default async function Home() {
  const user = await currentUser()
  if (!user) {
    redirect("/auth/login")
  } else {
    redirect("/conversations")
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
  )
}
