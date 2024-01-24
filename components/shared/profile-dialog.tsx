"use client"

import { useEffect } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as z from "zod"
import { useShallow } from "zustand/react/shallow"

import { useAuthUser } from "@/lib/store/zustand"
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
})

const ProfileDialog = () => {
  const userState = useAuthUser(useShallow((state) => state))
  const updateUserData = trpc.users.update.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  useEffect(() => {
    form.setValue("name", userState.name!)
  }, [form, userState.name])
  console.log(userState)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateUserData.mutateAsync({
      id: userState.id,
      name: values.name,
    })
    toast.success("Profile updated")
    console.log(values)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={"/images/placeholder.jpg"}
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
            <Separator />
            <DialogFooter className="-mt-2 flex justify-end">
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="reset">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit">Save</Button>
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
