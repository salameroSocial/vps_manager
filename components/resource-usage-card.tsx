"use client"

import { useEffect, useState } from "react"
import { Cpu, HardDrive, MemoryStickIcon as Memory, RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatBytes } from "@/lib/system-stats"
import { Button } from "@/components/ui/button"

interface ResourceUsageCardProps {
  className?: string
}

interface SystemStats {
  cpu: {
    usage: number
    cores: number
    model: string
    speed: number
  }
  memory: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
}

export function ResourceUsageCard({ className }: ResourceUsageCardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/system-stats")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
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

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchStats()

    // Configurar actualización periódica cada 10 segundos
    const interval = setInterval(fetchStats, 10000)

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Uso de recursos</CardTitle>
          <CardDescription>Monitorización en tiempo real de los recursos del sistema</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && !stats ? (
          <div className="flex h-32 flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando estadísticas...</p>
          </div>
        ) : error ? (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchStats} className="mt-2">
              Reintentar
            </Button>
          </div>
        ) : stats ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <span className="text-sm font-medium">{stats.cpu.usage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.cpu.usage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.cpu.cores} cores, {stats.cpu.speed} MHz
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memoria</span>
                </div>
                <span className="text-sm font-medium">{stats.memory.usagePercentage}%</span>
              </div>
              <Progress value={stats.memory.usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Almacenamiento</span>
                </div>
                <span className="text-sm font-medium">{stats.disk.usagePercentage}%</span>
              </div>
              <Progress value={stats.disk.usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatBytes(stats.disk.used)} / {formatBytes(stats.disk.total)}
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
