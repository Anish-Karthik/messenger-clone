import React from "react"
import { ClipLoader } from "react-spinners"

import { Skeleton } from "@/components/ui/skeleton"

const loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <ClipLoader />
    </div>
  )
}

export default loading
