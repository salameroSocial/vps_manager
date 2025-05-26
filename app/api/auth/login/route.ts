import { type NextRequest, NextResponse } from "next/server"
import { login, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validar datos
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    // Intentar iniciar sesión
    const result = await login(username, password)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 })
    }

    // Establecer cookie de autenticación
    setAuthCookie(result.token!)

    return NextResponse.json({ success: true, message: "Inicio de sesión exitoso" })
  } catch (error) {
    console.error("Error en la ruta de login:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
