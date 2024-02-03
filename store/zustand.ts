import { ExtendedUser } from "@/next-auth"
// import { User } from 'prisma/prisma-client'
import { User } from "next-auth/types"
import { create } from "zustand"

type UserAuthStore = ExtendedUser & {
  updateName: (name: string) => void
  updateImage: (image: string) => void
  update: (user: Partial<User>) => void
}

export const useAuthUser = create<UserAuthStore>((set) => ({
  id: "",
  name: "",
  image: "",
  email: "",
  isOAuth: false,
  updateName: (name) => set((prev) => ({ ...prev, name })),
  updateImage: (image) => set({ image }),
  update: (user) => set(user),
}))

interface ActiveListStore {
  members: string[]
  add: (id: string) => void
  remove: (id: string) => void
  set: (ids: string[]) => void
}

export const useActiveList = create<ActiveListStore>((set) => ({
  members: [],
  add: (id) => set((prev) => ({ members: [...prev.members, id] })),
  remove: (id) =>
    set((prev) => ({ members: prev.members.filter((m) => m !== id) })),
  set: (ids) => set({ members: ids }),
}))
