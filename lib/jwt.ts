// Este archivo contiene solo funciones relacionadas con JWT
// No importa nada relacionado con SQLite o base de datos
import { jwtVerify, SignJWT } from "jose"

// Clave secreta para firmar los tokens JWT
// En producción, usar una clave segura y almacenarla en variables de entorno
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!")

// Duración del token (24 horas)
const TOKEN_EXPIRY = "24h"

// Nombre de la cookie
export const AUTH_COOKIE = "vps_admin_auth"

// Interfaz para el payload del token
export interface JWTPayload {
  id: number
  username: string
  role: string
  exp?: number
}

// Función para crear un token JWT
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

// Función para verificar un token JWT
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error("Error al verificar el token:", error)
    return null
  }
}
