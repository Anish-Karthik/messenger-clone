"use client"

import UserCard from "./user-card"

const UsersMenu = () => {
  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <div className="h-[90%] overflow-y-auto">
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((x) => (
            <UserCard key={x} name="User Name" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UsersMenu
