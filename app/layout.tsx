import type { Metadata } from "next"
import { Inter } from "next/font/google"

import TRPCProvider from "./_trpc/Provider"
import "./globals.css"
import { auth } from "@/auth"
import { SessionProvider } from "next-auth/react"

import { ToastProvider } from "@/components/provider/toaster-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Messenger",
  description: "Messenger is a simple messaging service",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <TRPCProvider>
        <html lang="en">
          <body className={inter.className}>
            <ToastProvider />
            <div className="h-full">{children}</div>
          </body>
        </html>
      </TRPCProvider>
    </SessionProvider>
  )
}
