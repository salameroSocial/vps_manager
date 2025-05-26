import { type NextRequest, NextResponse } from "next/server"
import { updateUserPassword } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar si el usuario actual es administrador
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para realizar esta acción" },
        { status: 403 },
      )
    }

    const userId = Number.parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID de usuario inválido" }, { status: 400 })
    }

    const { password } = await request.json()

    // Validar datos
    if (!password) {
      return NextResponse.json({ success: false, message: "La contraseña es requerida" }, { status: 400 })
    }

    // Actualizar contraseña
    const success = await updateUserPassword(userId, password)

    if (!success) {
      return NextResponse.json({ success: false, message: "No se pudo actualizar la contraseña" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar contraseña:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
