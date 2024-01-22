import { currentUser } from "@/lib/auth"
import BottomBar from "@/components/navigation/bottom-bar"
import SideBar from "@/components/navigation/side-bar"
import SideBarContent from "@/components/navigation/side-bar-content"
import { ToastProvider } from "@/components/provider/toaster-provider"

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
        <div className="h-full">{children}</div>
        <BottomBar />
      </main>
    </html>
  )
}
