import { NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST() {
  try {
    // Cerrar sesión (eliminar cookie)
    logout()

    return NextResponse.json({ success: true, message: "Sesión cerrada correctamente" })
  } catch (error) {
    console.error("Error en la ruta de logout:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
