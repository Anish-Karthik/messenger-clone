"use client"

import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

const ProfileDialog = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={"/images/placeholder.jpg"}
          alt="msg"
          width={30}
          height={30}
          className="hover opacity-80"
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
                    <Input placeholder="Name" {...field} />
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
