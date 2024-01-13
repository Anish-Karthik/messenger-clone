"use client"

import Image from "next/image"

import { trpc } from "@/app/_trpc/client"

import { trpc } from "@/app/_trpc/client"

export default function Home() {
  const test = trpc.test.useQuery()
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {test.data ? (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-4xl font-bold">
            Welcome to <a href="https://trpc.io">trpc</a>!
          </h1>
          <p className="text-center text-xl">
            This is a <a href="https://nextjs.org">Next.js</a> app with{" "}
            <a href="https://trpc.io">trpc</a> and{" "}
            <a href="https://tailwindcss.com">Tailwind CSS</a>!
          </p>
          <div className="mt-12 flex flex-col items-center justify-center">
            <Image src="/trpc.svg" alt="trpc" width={200} height={200} />
            <h2 className="mt-4 text-center text-2xl font-bold">
              {test.data.message}
            </h2>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-4xl font-bold">
            Welcome to <a href="https://trpc.io">trpc</a>!
          </h1>
          <p className="text-center text-xl">
            This is a <a href="https://nextjs.org">Next.js</a> app with{" "}
            <a href="https://trpc.io">trpc</a> and{" "}
            <a href="https://tailwindcss.com">Tailwind CSS</a>!
          </p>
          <div className="mt-12 flex flex-col items-center justify-center">
            <Image src="/trpc.svg" alt="trpc" width={200} height={200} />
            <h2 className="mt-4 text-center text-2xl font-bold">Loading...</h2>
          </div>
        </div>
      )}
    </main>
  )
}
