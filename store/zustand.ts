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
  isActive: (id: string) => boolean
}

export const useActiveList = create<ActiveListStore>((set, get) => ({
  members: [],
  add: (id) =>
    set((prev) => {
      if (!prev.members.includes(id)) {
        return { members: [...prev.members, id] }
      }
      return prev
    }),
  remove: (id) =>
    set((prev) => ({ members: prev.members.filter((m) => m !== id) })),
  set: (ids) => set({ members: ids }),
  isActive: (id) => get().members.includes(id),
}))
