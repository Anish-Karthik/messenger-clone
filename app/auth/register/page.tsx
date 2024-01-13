import { auth } from "@/auth"

import { RegisterForm } from "@/components/auth/register-form"

const RegisterPage = async () => {
  const session = await auth()

  console.log(session)
  return <RegisterForm />
}

export default RegisterPage
