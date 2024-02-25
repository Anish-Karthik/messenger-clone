import React from "react"

import { Skeleton } from "@/components/ui/skeleton"

const loading = () => {
  return (
    <div className="flex h-full w-full flex-col gap-3 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4 pl-1">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-5 w-[40px]" />
          {/* <Skeleton className="h-12 w-12 rounded-full" /> */}
        </div>
      </div>
      <div className="flex-1">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="w-full flex-1 space-y-2">
          <Skeleton className="h-12 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  )
}

export default loading
