"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ImageIcon, SendHorizonalIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/utils/uploadthing"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface MessageFormProps extends React.HTMLAttributes<HTMLButtonElement> {
  // add your custom props here
}
const formSchema = z.object({
  message: z.string(),
  files: z.array(z.string().url()).nullable(),
})

const MessageForm: React.FC<MessageFormProps> = ({ ...props }) => {
  const [files, setFiles] = useState<File[]>([])
  const { startUpload } = useUploadThing("multipleFileUploader")
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })
  const { isSubmitting, isValid } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const imgRes = await startUpload(files)
      if (imgRes && imgRes[0].url) {
        values.files = imgRes.map((img) => img.url)
      }
      // sumbit form
      // toast.success("Message sent")
    } catch (error) {
      console.error(error)
      toast.error("something went wrong")
    }
    console.log(values)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    const fileReader = new FileReader()

    if (e.target?.files && e.target.files.length > 0) {
      const file = e.target?.files[0]
      setFiles(Array.from(e.target.files))
      if (!file.type.includes("image")) return

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ""
        console.log(imageDataUrl)
      }

      fileReader.readAsDataURL(file)
    }
  }
  console.log(files)
  console.log(form.getValues("files"))
  console.log(isValid)
  return (
    <div className={cn("border-t p-4 shadow-sm", props.className)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-4"
        >
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="file-input">
                  <ImageIcon className="text-blue-400" height={30} width={30} />
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    multiple={true}
                    className="hidden"
                    name={field.name}
                    onChange={(e) => handleImageChange(e)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="w-full">
                {/* <FormLabel htmlFor="file-input">
                  <ImageIcon className="text-blue-400" height={30} width={30} />
                </FormLabel> */}
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Write a message"
                    className="text-md w-full rounded-full border-none bg-neutral-100 px-4 py-3 font-light text-black focus-visible:!ring-transparent"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            className="rounded-full bg-blue-400 p-[0.4rem]"
            disabled={!files.length && !form.getValues("message").length}
          >
            <SendHorizonalIcon className="text-white" />
          </button>
        </form>
      </Form>
    </div>
  )
}

export default MessageForm
