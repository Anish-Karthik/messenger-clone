import { sendmail } from "./mail/mailer"
import { createMailTemplate } from "./mail/template"

const domain = process.env.NEXT_PUBLIC_APP_URL

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  await sendmail({
    to: [email],
    subject: "Reset your password",
    html: createMailTemplate({
      appName: "Messenger Clone",
      url: domain!,
      actionUrl: resetLink,
      action: "Reset Password",
    }),
  })
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`

  await sendmail({
    to: [email],
    subject: "Confirm your email",
    html: createMailTemplate({
      appName: "Messenger Clone",
      url: domain!,
      actionUrl: confirmLink,
      action: "Confirm Email",
    }),
  })
}
