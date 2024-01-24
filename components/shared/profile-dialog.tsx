"use client"

import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as z from "zod"

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

const ProfileDialog = ({ id }: { id: string }) => {
  const userData = trpc.users.getById.useQuery(id)
  const updateUserData = trpc.users.update.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  console.log(userData.data)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateUserData.mutateAsync({
      id,
      name: values.name,
    })
    toast.success("Profile updated")
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  if (userData.data?.name) {
    form.setValue("name", userData.data.name)
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
              defaultValue={userData.data?.name || ""}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    {userData.isLoading ? (
                      <>Loading</>
                    ) : (
                      <Input placeholder="Name" {...field} autoComplete="no" />
                    )}
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
