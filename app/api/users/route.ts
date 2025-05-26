import { type NextRequest, NextResponse } from "next/server"
import { createUser, getAllUsers } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Obtener todos los usuarios
export async function GET() {
  try {
    // Verificar si el usuario actual es administrador
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para realizar esta acción" },
        { status: 403 },
      )
    }

    const users = await getAllUsers()

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

// Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Verificar si el usuario actual es administrador
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para realizar esta acción" },
        { status: 403 },
      )
    }

    const { username, password, email, role } = await request.json()

    // Validar datos
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    // Crear usuario
    const userId = await createUser({
      username,
      password,
      email,
      role: role || "viewer",
      active: true,
    })

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error("Error al crear usuario:", error)

    // Verificar si es un error de usuario duplicado
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ success: false, message: "El nombre de usuario ya existe" }, { status: 409 })
    }

    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
