"use client"

import { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "next-auth"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as z from "zod"

import { isBase64Image } from "@/lib/utils"
import { useUploadThing } from "@/lib/utils/uploadthing"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { trpc } from "@/app/_trpc/client"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  image: z.string().url(),
})

const ProfileDialog = ({ user }: { user: User }) => {
  const [files, setFiles] = useState<File[]>([])
  const { startUpload } = useUploadThing("multipleFileUploader")
  const updateUserData = trpc.users.update.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name ?? "",
      image: user.image ?? "",
    },
  })

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    e.preventDefault()
    const fileReader = new FileReader()

    if (e.target?.files && e.target.files.length > 0) {
      const file = e.target?.files[0]
      setFiles(Array.from(e.target.files))

      if (!file.type.includes("image")) return

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ""
        onChange(imageDataUrl)
      }

      fileReader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const blob = values.image

    const hasImageChanged = isBase64Image(blob)

    if (hasImageChanged) {
      const imgRes = await startUpload(files)

      if (imgRes && imgRes[0].url) {
        values.image = imgRes[0].url
      }
    }
    await updateUserData.mutateAsync({
      id: user.id,
      name: values.name,
      image: values.image,
    })
    toast.success("Profile updated")
    console.log(values)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={user.image ?? "/images/placeholder.jpg"}
          alt="msg"
          width={45}
          height={45}
          className="rounded-full hover:opacity-70"
        />
      </DialogTrigger>
      <DialogContent className={"flex flex-col gap-3"}>
        <DialogHeader className={"flex flex-col gap-6 sm:max-w-md"}>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Edit your public information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3 space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} autoComplete="no" />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    <div>
                      <Image
                        src={field.value || "/images/placeholder.jpg"}
                        alt="Photo"
                        width={45}
                        height={45}
                        className="rounded-full hover:opacity-70"
                      />
                    </div>
                    <label
                      htmlFor="photo-input"
                      className="rounded-md bg-gray-200 p-1 px-3 hover:opacity-80"
                    >
                      Upload
                    </label>
                    <FormControl>
                      <Input
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        name={field.name}
                        onChange={(e) => handleImageChange(e, field.onChange)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <DialogFooter className="-mt-2 flex justify-end">
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="reset" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" className="bg-sky-500">
                    Save
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileDialog
