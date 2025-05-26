import Link from "next/link"
import { AlertTriangle, ArrowUpRight, Lock, Shield, Terminal, UserCheck } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SSHAccessManager } from "@/components/ssh-access-manager"
import { FirewallRules } from "@/components/firewall-rules"

export function SecurityOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Firewall</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">Activo</div>
            <p className="text-xs text-muted-foreground">12 reglas configuradas</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/security/firewall" className="text-xs text-blue-500 hover:underline inline-flex items-center">
              Ver reglas
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceso SSH</CardTitle>
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Puerto 2222</div>
            <p className="text-xs text-muted-foreground">5 IPs autorizadas</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/security/ssh-access"
              className="text-xs text-blue-500 hover:underline inline-flex items-center"
            >
              Gestionar acceso
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
            <Link href="/security/alerts" className="text-xs text-blue-500 hover:underline inline-flex items-center">
              Ver alertas
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Usuarios con acceso al sistema</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/security/users" className="text-xs text-blue-500 hover:underline inline-flex items-center">
              Gestionar usuarios
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="ssh">
        <TabsList>
          <TabsTrigger value="ssh">Acceso SSH</TabsTrigger>
          <TabsTrigger value="firewall">Firewall</TabsTrigger>
          <TabsTrigger value="logs">Logs de seguridad</TabsTrigger>
        </TabsList>
        <TabsContent value="ssh" className="mt-6">
          <SSHAccessManager />
        </TabsContent>
        <TabsContent value="firewall" className="mt-6">
          <FirewallRules />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs de seguridad</CardTitle>
              <CardDescription>Registros de eventos de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                <Lock className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Los logs de seguridad se mostrarán aquí</p>
                <Button className="mt-4" variant="outline">
                  Configurar monitorización de logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
