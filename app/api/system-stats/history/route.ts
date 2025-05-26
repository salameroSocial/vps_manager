import { NextResponse } from "next/server"
import { getSystemStats } from "@/lib/db"

// Esta ruta proporciona el historial de estadísticas del sistema
export async function GET() {
  try {
    // Obtener estadísticas históricas de la base de datos
    const stats = await getSystemStats(60) // Últimas 60 entradas

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Error al obtener historial de estadísticas:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener historial de estadísticas", error: String(error) },
      { status: 500 },
    )
  }
}
