import bcrypt from "bcryptjs"

import { db } from "../db"

export async function createUsers(size: number) {
  for (let i = 30; i < 30 + size; i++) {
    const name = `user${i}`
    const email = `test${i}@example.com`
    const password = await bcrypt.hash(`password${i}`, 10)
    await db.user.create({
      data: {
        name,
        email,
        password,
      },
    })
  }
}
