import { LoginForm } from "@/components/login-form"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  // Verificar si el usuario ya está autenticado
  const user = await getCurrentUser()

  // Si ya está autenticado, redirigir al dashboard
  if (user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">VPS Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Inicia sesión para acceder al panel de administración</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
