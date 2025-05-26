import { cookies } from "next/headers"
import { verifyUser, getUserByUsername } from "./db"
import { createToken, verifyToken, AUTH_COOKIE, type JWTPayload } from "./jwt"

// Función para iniciar sesión
export async function login(
  username: string,
  password: string,
): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const user = await verifyUser(username, password)

    if (!user) {
      return {
        success: false,
        message: "Credenciales inválidas",
      }
    }

    const token = await createToken({
      id: user.id!,
      username: user.username,
      role: user.role,
    })

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      token,
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return {
      success: false,
      message: "Error al iniciar sesión",
    }
  }
}

// Función para cerrar sesión
export function logout(): void {
  const cookieStore = cookies()
  cookieStore.delete(AUTH_COOKIE)
}

// Función para obtener el usuario actual desde la cookie
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE)

  if (!authCookie) {
    return null
  }

  return verifyToken(authCookie.value)
}

// Función para establecer la cookie de autenticación
export function setAuthCookie(token: string): void {
  const cookieStore = cookies()

  // Establecer la cookie con opciones seguras
  cookieStore.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    // Expiración en 24 horas
    maxAge: 60 * 60 * 24,
  })
}

// Función para verificar si un usuario existe y está activo
export async function verifyUserActive(username: string): Promise<boolean> {
  try {
    const user = await getUserByUsername(username)
    return !!user && user.active
  } catch (error) {
    console.error("Error al verificar si el usuario está activo:", error)
    return false
  }
}
