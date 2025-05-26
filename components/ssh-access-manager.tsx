"use client"

import { useState, useEffect } from "react"
import { Check, Clock, Filter, Search, Shield, X, RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  authorizeSSHAccess,
  rejectSSHAccess,
  getSSHAccessAttempts,
  createSimulatedAccessAttempt,
  revokeSSHAccess,
} from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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

export function SSHAccessManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthorizing, setIsAuthorizing] = useState<number | null>(null)
  const [isRejecting, setIsRejecting] = useState<number | null>(null)
  const [isRevoking, setIsRevoking] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessAttempts, setAccessAttempts] = useState<AccessAttempt[]>([])
  const [simulateIp, setSimulateIp] = useState("192.168.1.100")
  const [simulateUser, setSimulateUser] = useState("admin")
  const [isSimulating, setIsSimulating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Cargar los intentos de acceso
  useEffect(() => {
    async function loadAccessAttempts() {
      setIsLoading(true)
      try {
        const attempts = await getSSHAccessAttempts()
        setAccessAttempts(attempts)
      } catch (error) {
        console.error("Error al cargar intentos de acceso:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los intentos de acceso",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAccessAttempts()

    // Configurar actualización periódica cada 30 segundos
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 30000)

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

  const handleRevoke = async (attempt: AccessAttempt) => {
    try {
      setIsRevoking(attempt.id)

      const result = await revokeSSHAccess(attempt.id, attempt.ip)

      if (result.success) {
        toast({
          title: "Acceso revocado",
          description: `Se ha revocado el acceso para ${attempt.ip}`,
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
      console.error("Error al revocar el acceso:", error)
      toast({
        title: "Error",
        description: "Error al revocar el acceso. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsRevoking(null)
    }
  }

  const handleSimulateAttempt = async () => {
    try {
      setIsSimulating(true)

      const result = await createSimulatedAccessAttempt(simulateIp, simulateUser)

      if (result.success) {
        toast({
          title: "Intento simulado",
          description: `Se ha simulado un intento de acceso desde ${simulateIp}`,
        })
        // Actualizar la lista de intentos
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: "No se pudo simular el intento de acceso",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al simular intento:", error)
      toast({
        title: "Error",
        description: "Error al simular el intento de acceso",
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const filteredAttempts = accessAttempts.filter(
    (attempt) => attempt.ip.includes(searchQuery) || attempt.user.includes(searchQuery),
  )

  const pendingAttempts = filteredAttempts.filter((attempt) => attempt.status === "pending")
  const authorizedAttempts = filteredAttempts.filter((attempt) => attempt.status === "authorized")
  const rejectedAttempts = filteredAttempts.filter((attempt) => attempt.status === "rejected")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Gestión de Acceso SSH</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">Simular intento</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Simular intento de acceso SSH</DialogTitle>
                  <DialogDescription>Esto creará un intento de acceso simulado para pruebas.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ip" className="text-right">
                      Dirección IP
                    </Label>
                    <Input
                      id="ip"
                      value={simulateIp}
                      onChange={(e) => setSimulateIp(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user" className="text-right">
                      Usuario
                    </Label>
                    <Input
                      id="user"
                      value={simulateUser}
                      onChange={(e) => setSimulateUser(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSimulateAttempt} disabled={isSimulating}>
                    {isSimulating ? "Simulando..." : "Simular intento"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardDescription>Autoriza o rechaza intentos de acceso SSH al puerto 2222</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por IP o usuario..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filtrar</span>
          </Button>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pendientes
              {pendingAttempts.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingAttempts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="authorized">Autorizados</TabsTrigger>
            <TabsTrigger value="rejected">Rechazados</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Cargando intentos de acceso...</p>
              </div>
            ) : pendingAttempts.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">No hay intentos de acceso pendientes</p>
              </div>
            ) : (
              pendingAttempts.map((attempt) => (
                <div key={attempt.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{attempt.ip}</p>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-amber-500 border-amber-200 bg-amber-50"
                      >
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Usuario:</span> {attempt.user}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Puerto:</span> {attempt.port}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fecha:</span>{" "}
                        {new Date(attempt.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Hace:</span> {attempt.timeAgo}
                      </div>
                    </div>
                    {attempt.details && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Detalles:</span> {attempt.details}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3"
                      onClick={() => handleReject(attempt)}
                      disabled={isRejecting === attempt.id || isAuthorizing === attempt.id}
                    >
                      {isRejecting === attempt.id ? (
                        <span>Rechazando...</span>
                      ) : (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => handleAuthorize(attempt)}
                      disabled={isRejecting === attempt.id || isAuthorizing === attempt.id}
                    >
                      {isAuthorizing === attempt.id ? (
                        <span>Autorizando...</span>
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Autorizar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="authorized" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Cargando intentos de acceso...</p>
              </div>
            ) : authorizedAttempts.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">No hay intentos de acceso autorizados</p>
              </div>
            ) : (
              authorizedAttempts.map((attempt) => (
                <div key={attempt.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{attempt.ip}</p>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-emerald-500 border-emerald-200 bg-emerald-50"
                      >
                        <Check className="h-3 w-3" />
                        Autorizado
                      </Badge>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Usuario:</span> {attempt.user}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Puerto:</span> {attempt.port}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fecha:</span>{" "}
                        {new Date(attempt.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Hace:</span> {attempt.timeAgo}
                      </div>
                    </div>
                    {attempt.details && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Detalles:</span> {attempt.details}
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(attempt)}
                      disabled={isRevoking === attempt.id}
                    >
                      {isRevoking === attempt.id ? "Revocando..." : "Revocar acceso"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Cargando intentos de acceso...</p>
              </div>
            ) : rejectedAttempts.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">No hay intentos de acceso rechazados</p>
              </div>
            ) : (
              rejectedAttempts.map((attempt) => (
                <div key={attempt.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{attempt.ip}</p>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-red-500 border-red-200 bg-red-50"
                      >
                        <X className="h-3 w-3" />
                        Rechazado
                      </Badge>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Usuario:</span> {attempt.user}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Puerto:</span> {attempt.port}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fecha:</span>{" "}
                        {new Date(attempt.timestamp).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Hace:</span> {attempt.timeAgo}
                      </div>
                    </div>
                    {attempt.details && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Detalles:</span> {attempt.details}
                      </div>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => handleAuthorize(attempt)}>
                      Autorizar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
