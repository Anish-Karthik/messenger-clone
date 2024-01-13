"use server"

import nodemailer from "nodemailer"

const sender = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function sendmail({
  to,
  subject,
  html,
}: {
  to: string[]
  subject?: string
  html?: string
}) {
  const info = await sender.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  })
  console.log("Message sent: %s", info.messageId)
}
