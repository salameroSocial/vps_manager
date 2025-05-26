"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Clock, RefreshCw, X } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSSHAccessAttempts, authorizeSSHAccess, rejectSSHAccess } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"

interface RecentAccessAttemptsProps {
  className?: string
}

interface AccessAttempt {
  id: number
  ip: string
  user: string
  timestamp: string
  status: "pending" | "authorized" | "rejected"
  port: number
  timeAgo: string
  details?: string
}

export function RecentAccessAttempts({ className }: RecentAccessAttemptsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [attempts, setAttempts] = useState<AccessAttempt[]>([])
  const [isAuthorizing, setIsAuthorizing] = useState<number | null>(null)
  const [isRejecting, setIsRejecting] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function loadAttempts() {
      setIsLoading(true)
      try {
        const data = await getSSHAccessAttempts()
        // Mostrar solo los 4 intentos más recientes
        setAttempts(data.slice(0, 4))
      } catch (error) {
        console.error("Error al cargar intentos de acceso:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los intentos de acceso recientes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAttempts()

    // Configurar actualización periódica cada 15 segundos
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 15000)

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleAuthorize = async (attempt: AccessAttempt) => {
    try {
      setIsAuthorizing(attempt.id)

      const result = await authorizeSSHAccess(attempt.id, attempt.ip)

      if (result.success) {
        toast({
          title: "Acceso autorizado",
          description: `Se ha autorizado el acceso para ${attempt.ip}`,
        })
        // Actualizar la lista de intentos
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al autorizar el acceso:", error)
      toast({
        title: "Error",
        description: "Error al autorizar el acceso. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsAuthorizing(null)
    }
  }

  const handleReject = async (attempt: AccessAttempt) => {
    try {
      setIsRejecting(attempt.id)

      const result = await rejectSSHAccess(attempt.id, attempt.ip)

      if (result.success) {
        toast({
          title: "Acceso rechazado",
          description: `Se ha rechazado el acceso para ${attempt.ip}`,
        })
        // Actualizar la lista de intentos
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al rechazar el acceso:", error)
      toast({
        title: "Error",
        description: "Error al rechazar el acceso. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(null)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Intentos de acceso recientes</CardTitle>
          <CardDescription>Intentos de acceso SSH al puerto 2222</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando intentos de acceso...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">No hay intentos de acceso recientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className={
                  attempt.status === "pending"
                    ? "grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border p-3"
                    : "grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border p-3"
                }
              >
                <div>
                  <p className="font-medium">{attempt.ip}</p>
                  <p className="text-xs text-muted-foreground">Usuario: {attempt.user}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Puerto {attempt.port}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Hace {attempt.timeAgo}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  {attempt.status === "pending" && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-amber-500 border-amber-200 bg-amber-50"
                    >
                      <Clock className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                  {attempt.status === "authorized" && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-emerald-500 border-emerald-200 bg-emerald-50"
                    >
                      <Check className="h-3 w-3" />
                      Autorizado
                    </Badge>
                  )}
                  {attempt.status === "rejected" && (
                    <Badge variant="outline" className="flex items-center gap-1 text-red-500 border-red-200 bg-red-50">
                      <X className="h-3 w-3" />
                      Rechazado
                    </Badge>
                  )}
                </div>
                {attempt.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleReject(attempt)}
                      disabled={isRejecting === attempt.id || isAuthorizing === attempt.id}
                    >
                      {isRejecting === attempt.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="sr-only">Rechazar</span>
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAuthorize(attempt)}
                      disabled={isRejecting === attempt.id || isAuthorizing === attempt.id}
                    >
                      {isAuthorizing === attempt.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="sr-only">Autorizar</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/security/ssh-access">Ver todos los intentos</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
