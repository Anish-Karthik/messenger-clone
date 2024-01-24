import { redirect } from "next/navigation"

import { currentUser } from "@/lib/auth"
import BottomBar from "@/components/navigation/bottom-bar"
import SideBar from "@/components/navigation/side-bar"
import SideBarContent from "@/components/navigation/side-bar-content"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return (
    <html lang="en">
      <main>
        <SideBar user={user} />
        <div className="max-lg:hidden">
          <SideBarContent />
        </div>
        <div className="h-full max-lg:w-full lg:absolute lg:inset-y-0 lg:left-[25rem] lg:right-0">
          {children}
        </div>
        <BottomBar />
      </main>
    </html>
  )
}
