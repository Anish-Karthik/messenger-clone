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
  return (
    <html lang="en">
      <main>
        <SideBar />
        <SideBarContent />
        <div className="absolute inset-y-0 left-[25rem] right-0 h-full">
          {children}
        </div>
        <BottomBar />
      </main>
    </html>
  )
}
