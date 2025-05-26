"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw, Shield, Trash2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { getActiveUFWRules, addFirewallRuleAction, deleteFirewallRuleAction } from "@/lib/actions"

interface FirewallRule {
  id: number
  ip: string
  port: string | number
  action: "allow" | "deny"
  direction?: "in" | "out" | "both"
  protocol?: "tcp" | "udp" | "any"
  created_at: string
  created_by?: string
  active: boolean
  description?: string
}

export function FirewallRules() {
  const [isLoading, setIsLoading] = useState(true)
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([])
  const [newRuleIp, setNewRuleIp] = useState("")
  const [newRulePort, setNewRulePort] = useState("")
  const [newRuleAction, setNewRuleAction] = useState<"allow" | "deny">("allow")
  const [newRuleDirection, setNewRuleDirection] = useState<"in" | "out" | "both">("in")
  const [newRuleProtocol, setNewRuleProtocol] = useState<"tcp" | "udp" | "any">("tcp")
  const [newRuleDescription, setNewRuleDescription] = useState("")
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [isDeletingRule, setIsDeletingRule] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Cargar reglas de firewall
  useEffect(() => {
    async function loadFirewallRules() {
      setIsLoading(true)
      try {
        const rules = await getActiveUFWRules()
        setFirewallRules(rules)
      } catch (error) {
        console.error("Error al cargar reglas de firewall:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las reglas de firewall",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFirewallRules()
  }, [refreshKey])

  const handleAddRule = async () => {
    try {
      setIsAddingRule(true)

      // Validar campos
      if (!newRuleIp) {
        toast({
          title: "Error",
          description: "La dirección IP es obligatoria",
          variant: "destructive",
        })
        return
      }

      if (!newRulePort) {
        toast({
          title: "Error",
          description: "El puerto es obligatorio",
          variant: "destructive",
        })
        return
      }

      const result = await addFirewallRuleAction({
        ip: newRuleIp,
        port: newRulePort,
        action: newRuleAction,
        direction: newRuleDirection,
        protocol: newRuleProtocol,
        description: newRuleDescription || undefined,
      })

      if (result.success) {
        toast({
          title: "Regla añadida",
          description: result.message,
        })

        // Cerrar el diálogo y resetear el formulario
        setIsDialogOpen(false)
        setNewRuleIp("")
        setNewRulePort("")
        setNewRuleAction("allow")
        setNewRuleDirection("in")
        setNewRuleProtocol("tcp")
        setNewRuleDescription("")

        // Actualizar la lista de reglas
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al añadir regla:", error)
      toast({
        title: "Error",
        description: "Error al añadir la regla de firewall",
        variant: "destructive",
      })
    } finally {
      setIsAddingRule(false)
    }
  }

  const handleDeleteRule = async (rule: FirewallRule) => {
    try {
      setIsDeletingRule(rule.id)

      const result = await deleteFirewallRuleAction(rule.id, rule.ip, rule.port)

      if (result.success) {
        toast({
          title: "Regla eliminada",
          description: result.message,
        })

        // Actualizar la lista de reglas
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar regla:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la regla de firewall",
        variant: "destructive",
      })
    } finally {
      setIsDeletingRule(null)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Reglas del Firewall</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir regla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir nueva regla de firewall</DialogTitle>
                  <DialogDescription>Añade una nueva regla para permitir o denegar tráfico.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ip" className="text-right">
                      Dirección IP
                    </Label>
                    <Input
                      id="ip"
                      placeholder="192.168.1.1 o 192.168.1.0/24"
                      value={newRuleIp}
                      onChange={(e) => setNewRuleIp(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="port" className="text-right">
                      Puerto
                    </Label>
                    <Input
                      id="port"
                      placeholder="22, 80, 443, etc. o 'any'"
                      value={newRulePort}
                      onChange={(e) => setNewRulePort(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="action" className="text-right">
                      Acción
                    </Label>
                    <Select value={newRuleAction} onValueChange={(value: "allow" | "deny") => setNewRuleAction(value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona una acción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allow">Permitir</SelectItem>
                        <SelectItem value="deny">Denegar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="direction" className="text-right">
                      Dirección
                    </Label>
                    <Select
                      value={newRuleDirection}
                      onValueChange={(value: "in" | "out" | "both") => setNewRuleDirection(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona una dirección" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entrada</SelectItem>
                        <SelectItem value="out">Salida</SelectItem>
                        <SelectItem value="both">Ambas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="protocol" className="text-right">
                      Protocolo
                    </Label>
                    <Select
                      value={newRuleProtocol}
                      onValueChange={(value: "tcp" | "udp" | "any") => setNewRuleProtocol(value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona un protocolo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                        <SelectItem value="any">Cualquiera</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Input
                      id="description"
                      placeholder="Descripción opcional"
                      value={newRuleDescription}
                      onChange={(e) => setNewRuleDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddRule} disabled={isAddingRule}>
                    {isAddingRule ? "Añadiendo..." : "Añadir regla"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardDescription>Gestiona las reglas del firewall UFW</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex h-32 flex-col items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Cargando reglas del firewall...</p>
            </div>
          ) : firewallRules.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">No hay reglas de firewall configuradas</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 p-4 font-medium border-b">
                <div>Dirección IP</div>
                <div>Puerto</div>
                <div>Acción</div>
                <div>Dirección</div>
                <div>Fecha</div>
                <div></div>
              </div>
              {firewallRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 p-4 items-center border-b last:border-0"
                >
                  <div>{rule.ip}</div>
                  <div>{rule.port}</div>
                  <div>
                    {rule.action === "allow" ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-500 border-emerald-200">
                        Permitir
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">
                        Denegar
                      </Badge>
                    )}
                  </div>
                  <div>
                    {rule.direction === "in" && "Entrada"}
                    {rule.direction === "out" && "Salida"}
                    {rule.direction === "both" && "Ambas"}
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(rule.created_at).toLocaleDateString()}</div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteRule(rule)}
                      disabled={isDeletingRule === rule.id}
                    >
                      {isDeletingRule === rule.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
