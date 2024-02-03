"use client"

import React, { useMemo } from "react"
import { useActiveList } from "@/store/zustand"

const Status = ({ id }: { id?: string }) => {
  const { members } = useActiveList()
  const isActive = useMemo(() => members.includes(id || ""), [members, id])
  if (!id) return null
  return (
    <p className="text-md -mt-1 truncate text-left font-light text-gray-500">
      {isActive ? "Active" : "Offline"}
    </p>
  )
}

export default Status
