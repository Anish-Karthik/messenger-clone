"use client"

import React, { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import {
  ImageIcon,
  PlusCircleIcon,
  SendHorizonalIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/utils/uploadthing"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/app/_trpc/client"

import { Button } from "../ui/button"

interface MessageFormProps extends React.HTMLAttributes<HTMLButtonElement> {
  senderId: string
  conversationId: string
}

const formSchema = z.object({
  message: z.string(),
  files: z.array(z.string().url()).nullable(),
})

const MessageForm: React.FC<MessageFormProps> = ({
  senderId,
  conversationId,
  ...props
}) => {
  const user = useCurrentUser()
  const [files, setFiles] = useState<File[]>([])
  const { startUpload } = useUploadThing("multipleFileUploader")
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      files: [],
    },
  })
  const { isSubmitting, isValid } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      form.setValue("message", "", { shouldValidate: true })
      form.reset()
      const tmp = files
      setFiles([])
      const start = performance.now()
      console.log(start)
      const imgRes = files.length > 0 ? await startUpload(files) : null
      if (imgRes && imgRes[0]?.url) {
        values.files = imgRes.map((img) => img.url)
      }
      const message = await axios.post("/api/socket/messages", {
        message: values.message,
        images: values.files || [],
        conversationId,
        senderId,
        currentUserId: user?.id,
      })
      const end = performance.now()
      console.log(end - start)
      console.log(message)

      toast.success("Message sent")
    } catch (error) {
      console.log(error)
      console.error(error)
      toast.error("something went wrong")
    }
    console.log(values)
  }
  console.log(form.getValues())
  console.log(isValid)
  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    appendTo: boolean
  ) {
    e.preventDefault()
    const fileReader = new FileReader()

    if (e.target?.files && e.target.files.length > 0) {
      const file = e.target?.files[0]
      if (appendTo) {
        setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
      } else {
        setFiles(Array.from(e.target.files || []))
      }
      if (!file.type.includes("image")) return
      fileReader.readAsDataURL(file)
    }
  }

  console.log(files)
  console.log(form.getValues("files"))
  console.log(isValid)
  return (
    <div className={cn("relative border-t p-4 shadow-sm", props.className)}>
      {files.length > 0 && (
        <div className="absolute bottom-[4.4rem] left-8 z-50 h-fit w-64 rounded-md bg-slate-200 px-12 sm:max-w-sm">
          <Carousel className="w-full max-w-xs ">
            <CarouselContent>
              {files.map((file, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <div className="mb-1 flex justify-end">
                      <Button
                        variant={"ghost"}
                        onClick={() => {
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                          setFiles((prev) => [...prev])
                        }}
                      >
                        <Trash2Icon className="-mx-4" />
                      </Button>
                    </div>
                    <Card className="mb-2 !p-0">
                      <CardContent className="flex aspect-square items-end justify-center !p-0">
                        {
                          <Image
                            key={file.name}
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={200}
                            height={200}
                            className=""
                          />
                        }
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-4"
        >
          {files.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFiles([])}
              className="-mr-3 text-red-400"
            >
              <XCircleIcon className="-mx-2" />
            </Button>
          )}
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="file-input">
                  {files.length > 0 ? (
                    <div className="rounded-full bg-sky-500 p-1 py-[0.3rem] text-white hover:opacity-70">
                      <PlusCircleIcon />
                    </div>
                  ) : (
                    <ImageIcon
                      className="text-blue-400"
                      height={30}
                      width={30}
                    />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    multiple={true}
                    className="hidden"
                    name={field.name}
                    onChange={(e) => handleImageChange(e, files.length > 0)}
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
