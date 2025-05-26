import { NextResponse } from "next/server"
import { getSystemStats } from "@/lib/system-stats"
import { addSystemStat } from "@/lib/db"

// Esta ruta proporciona estadísticas del sistema en tiempo real
export async function GET() {
  try {
    // Obtener estadísticas del sistema (simuladas)
    const stats = await getSystemStats()

    // Guardar las estadísticas en la base de datos para histórico
    try {
      await addSystemStat({
        timestamp: new Date().toISOString(),
        cpu_usage: stats.cpu.usage,
        memory_usage: stats.memory.usagePercentage,
        disk_usage: stats.disk.usagePercentage,
        network_rx: stats.network.rx,
        network_tx: stats.network.tx,
        connections: stats.network.connections,
      })
    } catch (dbError) {
      console.error("Error al guardar estadísticas en la base de datos:", dbError)
      // Continuamos aunque falle el guardado en la base de datos
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Error al obtener estadísticas del sistema:", error)
    return NextResponse.json(
      { success: false, message: "Error al obtener estadísticas del sistema", error: String(error) },
      { status: 500 },
    )
  }
}
