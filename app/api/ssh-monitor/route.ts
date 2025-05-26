import { type NextRequest, NextResponse } from "next/server"
import { monitorSSHLog, simulateAccessAttempt } from "@/lib/ssh-monitor"

// Esta ruta se puede llamar periódicamente para monitorear los logs SSH
export async function GET(request: NextRequest) {
  try {
    // Verificar si es una solicitud de simulación
    const simulate = request.nextUrl.searchParams.get("simulate")

    if (simulate === "true") {
      // Generar un intento de acceso simulado con IP aleatoria
      const randomOctet = () => Math.floor(Math.random() * 255)
      const ip = `192.168.${randomOctet()}.${randomOctet()}`
      const users = ["root", "admin", "ubuntu", "user"]
      const user = users[Math.floor(Math.random() * users.length)]

      await simulateAccessAttempt(ip, user)
      return NextResponse.json({ success: true, message: "Intento simulado creado" })
    }

    // Monitorear los logs SSH
    await monitorSSHLog()
    return NextResponse.json({ success: true, message: "Monitoreo completado" })
  } catch (error) {
    console.error("Error en el monitoreo SSH:", error)
    return NextResponse.json(
      { success: false, message: "Error en el monitoreo SSH", error: String(error) },
      { status: 500 },
    )
  }
}
