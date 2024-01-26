import { createUploadthing, type FileRouter } from "uploadthing/next"

import { currentUser } from "@/lib/auth"

const f = createUploadthing()

const handleAuth = async () => {
  // This code runs on your server before upload
  const user = await currentUser()

  // If you throw, the user will not be able to upload
  if (!user) throw new Error("Unauthorized")

  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return { userId: user.id }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete")
      // This code RUNS ON YOUR SERVER after upload
      // console.log("Upload complete for userId:", metadata.userId)

      console.log("file url", file.url)

      // // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      // return { uploadedBy: metadata.userId }
    }),
  multipleFileUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 30 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async () => {
      console.log("Upload complete")
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
