import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, AUTH_COOKIE } from "./lib/jwt"

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login", "/api/auth/login"]

export async function middleware(request: NextRequest) {
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar si hay una cookie de autenticación
  const authCookie = request.cookies.get(AUTH_COOKIE)

  if (!authCookie) {
    // Redirigir a la página de login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Verificar el token JWT (esto funciona en Edge Runtime)
    const payload = await verifyToken(authCookie.value)

    if (!payload) {
      // Token inválido, redirigir a la página de login
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Token válido, permitir acceso
    return NextResponse.next()
  } catch (error) {
    // Error al verificar el token, redirigir a la página de login
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// Configurar las rutas que deben ser protegidas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api/auth/* (rutas de autenticación)
     * 2. /login (página de login)
     * 3. /_next (archivos estáticos de Next.js)
     * 4. /favicon.ico, /robots.txt, etc.
     */
    "/((?!api/auth|login|_next|favicon.ico|robots.txt).*)",
  ],
}
