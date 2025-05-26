import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { verifyUserActive } from "@/lib/auth"

// Esta ruta verifica si el usuario está autenticado y si su cuenta está activa
export async function GET() {
  try {
    // Obtener el usuario actual del token
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ authenticated: false, message: "No autenticado" }, { status: 401 })
    }

    // Verificar si el usuario existe y está activo en la base de datos
    const isActive = await verifyUserActive(currentUser.username)

    if (!isActive) {
      return NextResponse.json({ authenticated: false, message: "Usuario no encontrado o inactivo" }, { status: 401 })
    }

    // Usuario autenticado y activo
    return NextResponse.json({
      authenticated: true,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
      },
    })
  } catch (error) {
    console.error("Error al verificar autenticación:", error)
    return NextResponse.json({ authenticated: false, message: "Error al verificar autenticación" }, { status: 500 })
  }
}
