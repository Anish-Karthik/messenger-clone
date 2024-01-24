import { ExtendedUser } from "@/next-auth"
// import { User } from 'prisma/prisma-client'
import { User } from "next-auth/types"
import { create } from "zustand"

type UserAuthStore = ExtendedUser & {
  updateName: (name: string) => void
  updateImage: (image: string) => void
  update: (user: User) => void
}

export const useAuthUser = create<UserAuthStore>((set) => ({
  id: "",
  name: "",
  image: "",
  email: "",
  isOAuth: false,
  updateName: (name) => set({ name }),
  updateImage: (image) => set({ image }),
  update: (user) => set(user),
}))
