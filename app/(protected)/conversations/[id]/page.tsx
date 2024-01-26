import React from "react"

const page = () => {
  return (
    <div className="h-full overflow-y-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((item) => (
        <div key={item} className="flex justify-end ">
          <div className="m-2 rounded-lg bg-gray-200 p-2">
            <p className="text-gray-500">Hello</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default page
