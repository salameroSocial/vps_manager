import { type NextRequest, NextResponse } from "next/server"
import { updateUser } from "@/lib/db"
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

    const { active } = await request.json()

    // Validar datos
    if (active === undefined) {
      return NextResponse.json({ success: false, message: "El estado es requerido" }, { status: 400 })
    }

    // No permitir desactivar al usuario actual
    if (userId === currentUser.id && !active) {
      return NextResponse.json({ success: false, message: "No puedes desactivar tu propio usuario" }, { status: 400 })
    }

    // Actualizar estado
    const success = await updateUser(userId, { active })

    if (!success) {
      return NextResponse.json(
        { success: false, message: "No se pudo actualizar el estado del usuario" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar estado del usuario:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
