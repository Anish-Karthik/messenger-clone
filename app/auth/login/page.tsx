import { LoginForm } from "@/components/auth/login-form"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

const LoginPage = async () => {
  const user = await currentUser()
  if (user) {
    redirect("/conversations")
  }
  return <LoginForm />
}

export default LoginPage
