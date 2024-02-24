"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import axios from "axios"
import { FieldValues, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"

import { useCurrentUser } from "@/hooks/use-current-user"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { trpc } from "@/app/_trpc/client"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import Modal from "./modal"
import Select from "./select"

interface GroupChatModalProps {
  isOpen?: boolean
  onClose: () => void
}
const GroupChatModal: React.FC<GroupChatModalProps> = ({ isOpen, onClose }) => {
  const utils = trpc.useUtils()
  const currUser = useCurrentUser()
  const { data } = trpc.users.getAll.useQuery({
    id: currUser?.id || "",
  })
  const createGroupChat = trpc.conversations.create.useMutation({
    async onSuccess(newData, variables, context) {
      // await utils.users.getAllConversations.cancel()
      // utils.users.getAllConversations.setInfiniteData(
      //   {
      //     userId: currUser!.id,
      //     limit: 10,
      //   },
      //   (data) => {
      //     if (!data) {
      //       console.log("no data")
      //       return {
      //         pages: [],
      //         pageParams: [],
      //       }
      //     }
      //     const newPages = data.pages.map((page, i) => ({
      //       ...page,
      //       items:
      //         i === 0 && page.items ? [newData, ...page.items] : page.items,
      //     }))
      //     return {
      //       ...data,
      //       pages: newPages,
      //     }
      //   }
      // )
    },
  })
  const form = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
  })
  const { isValid, isSubmitting } = form.formState
  const members = form.watch("members")
  async function onSubmit(values: FieldValues) {
    console.log(values)
    // const res = await createGroupChat.mutateAsync({
    //   name: values.name,
    //   users: [...values.members.map((user: any) => user.value), currUser?.id],
    //   isGroup: true,
    // })
    try {
      const res = await axios.post("/api/socket/conversations", {
        name: values.name,
        members: values.members,
        isGroup: true,
        currentUserId: currUser?.id,
      })
      toast.success("Group chat created successfully")
      console.log(res)
      form.reset()
      onClose()
    } catch (error) {
      console.log(error)
      toast.error("Error creating group chat")
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <h2
            className="
                text-base 
                font-semibold 
                leading-7 
                text-gray-900
              "
          >
            Create a group chat
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Create a chat with more than 2 people.
          </p>
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
                  This is conversation group name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-8">
            {data && (
              <div className="mt-10 flex flex-col gap-y-8">
                <Select
                  disabled={form.formState.isLoading}
                  label="Members"
                  options={
                    data?.items.map((user) => ({
                      value: user.id!,
                      label: user.name!,
                    })) || []
                  }
                  onChange={(value) =>
                    form.setValue("members", value, {
                      shouldValidate: true,
                    })
                  }
                  value={members}
                />
              </div>
            )}

            <Separator />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={form.formState.isLoading}
                onClick={() => {
                  form.reset()
                  onClose()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-500"
                disabled={isSubmitting}
              >
                Create
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  )
}

export default GroupChatModal
