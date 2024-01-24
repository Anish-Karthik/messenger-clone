"use client"

import ProfileDialog from "../shared/profile-dialog"

const TopBar = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 flex w-20 flex-col items-center justify-between p-2 py-4 lg:hidden">
      <div className="p-3">
        <h1>Messenger</h1>
      </div>
      {/* <ProfileDialog /> */}
    </div>
  )
}

export default TopBar
