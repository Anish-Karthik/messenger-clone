import { redirect } from "next/navigation"
import { ClipLoader } from "react-spinners"

import { currentUser } from "@/lib/auth"

export default async function Home() {
  const user = await currentUser()
  if (!user) {
    redirect("/auth/login")
  } else {
    redirect("/conversations")
  }
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <ClipLoader />
    </div>
  )
}
