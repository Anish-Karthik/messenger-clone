"use client"

import React from "react"

import useActiveChannel from "@/hooks/use-active-channel"

const ActiveStatus = () => {
  useActiveChannel()
  return <div>ActiveStatus</div>
}

export default ActiveStatus
