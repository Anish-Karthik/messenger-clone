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
    return <div>
      Not logged in
    </div>
  }
  return (
    <html lang="en">
      <main>
        <SideBar user={user} />
        <SideBarContent className="absolute inset-y-0 ml-20 w-80 max-lg:hidden" />
        <div className="absolute inset-y-0 max-lg:inset-x-0 max-lg:bottom-16 max-lg:h-full lg:left-[25rem] lg:right-0">
          {children}
        </div>
        <BottomBar />
      </main>
    </html>
  )
}
