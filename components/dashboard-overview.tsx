import { Activity, AlertTriangle, ArrowUpRight, Clock, Server, Shield } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResourceUsageCard } from "@/components/resource-usage-card"
import { RecentAccessAttempts } from "@/components/recent-access-attempts"

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Monitoriza y gestiona tu VPS desde un solo lugar.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/security/ssh-access">
              <Shield className="mr-2 h-4 w-4" />
              Gestionar acceso SSH
            </Link>
          </Button>
          <Button asChild>
            <Link href="/security">
              <Activity className="mr-2 h-4 w-4" />
              Ver actividad
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del servidor</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">Activo</div>
            <p className="text-xs text-muted-foreground">Tiempo de actividad: 24 días, 3 horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intentos de acceso</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 en las últimas 24 horas</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/security/ssh-access"
              className="text-xs text-blue-500 hover:underline inline-flex items-center"
            >
              Ver intentos pendientes
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">2</div>
            <p className="text-xs text-muted-foreground">Alertas de seguridad activas</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/security" className="text-xs text-blue-500 hover:underline inline-flex items-center">
              Ver alertas
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último acceso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoy</div>
            <p className="text-xs text-muted-foreground">10:23 AM desde 192.168.1.1</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ResourceUsageCard className="md:col-span-2 lg:col-span-3" />
        <RecentAccessAttempts className="md:col-span-2 lg:col-span-4" />
      </div>
    </div>
  )
}
