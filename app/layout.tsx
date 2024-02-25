import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { auth } from "@/auth"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { SessionProvider } from "next-auth/react"
import { extractRouterConfig } from "uploadthing/server"

import TRPCProvider from "./_trpc/Provider"
import "./globals.css"
import { SocketProvider } from "@/components/provider/socket-provider"
import { ToastProvider } from "@/components/provider/toaster-provider"
import { ourFileRouter } from "@/app/api/uploadthing/core"

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
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
            />
            <SocketProvider>
              <div className="h-full">{children}</div>
            </SocketProvider>
          </body>
        </html>
      </TRPCProvider>
    </SessionProvider>
  )
}
