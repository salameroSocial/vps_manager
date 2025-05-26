"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SystemStat {
  id: number
  timestamp: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_rx: number
  network_tx: number
  connections: number
}

interface ChartData {
  name: string
  cpu: number
  memoria: number
  disco: number
}

export function SystemStatsChart() {
  const [stats, setStats] = useState<SystemStat[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/system-stats/history")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setStats(data.data)

          // Transformar los datos para el gráfico
          const formattedData = data.data
            .map((stat: SystemStat) => ({
              name: new Date(stat.timestamp).toLocaleTimeString(),
              cpu: stat.cpu_usage,
              memoria: stat.memory_usage,
              disco: stat.disk_usage,
            }))
            .reverse()

          setChartData(formattedData)
          setError(null)
        } else {
          throw new Error(data.message || "Error desconocido")
        }
      } catch (err) {
        console.error("Error al obtener estadísticas:", err)
        setError("No se pudieron cargar las estadísticas del sistema")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Configurar actualización periódica cada 30 segundos
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 30000)

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Estadísticas del sistema</CardTitle>
          <CardDescription>Uso de recursos en tiempo real</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && chartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando estadísticas...</p>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" activeDot={{ r: 8 }} name="CPU %" />
                <Line type="monotone" dataKey="memoria" stroke="#82ca9d" name="Memoria %" />
                <Line type="monotone" dataKey="disco" stroke="#ffc658" name="Disco %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
