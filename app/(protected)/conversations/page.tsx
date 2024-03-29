import SideBarContent from "@/components/navigation/side-bar-content"

const page = () => {
  return (
    <section className="flex h-full w-full items-center">
      <div className="flex h-full w-full items-center justify-center bg-gray-100 max-lg:hidden">
        <h1 className="mt-2 text-2xl font-semibold">
          Select a chat or start a new conversation
        </h1>
      </div>
      <SideBarContent className="h-full w-full lg:hidden" />
    </section>
  )
}

export default page
