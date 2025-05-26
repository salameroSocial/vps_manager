"use client"

import type React from "react"
import Link from "next/link"
import {
  Activity,
  BarChart3,
  Cpu,
  Database,
  HardDrive,
  Home,
  Lock,
  LogOut,
  Settings,
  Shield,
  Terminal,
  User,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [username, setUsername] = useState("Admin")
  const [userRole, setUserRole] = useState("admin")

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    async function verifyAuth() {
      try {
        const response = await fetch("/api/auth/verify")
        const data = await response.json()

        if (!data.authenticated) {
          // Si no está autenticado, redirigir al login
          router.push("/login")
          return
        }

        // Actualizar información del usuario
        if (data.user) {
          setUsername(data.user.username)
          setUserRole(data.user.role)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        // En caso de error, redirigir al login por seguridad
        router.push("/login")
      }
    }

    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        })

        // Redirigir a la página de login
        router.push("/login")
        router.refresh()
      } else {
        throw new Error("Error al cerrar sesión")
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex items-center gap-2 px-4 py-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">VPS Admin</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/resources"}>
                  <Link href="/resources">
                    <Cpu className="h-4 w-4" />
                    <span>Recursos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/storage"}>
                  <Link href="/storage">
                    <HardDrive className="h-4 w-4" />
                    <span>Almacenamiento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/database"}>
                  <Link href="/database">
                    <Database className="h-4 w-4" />
                    <span>Base de datos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/security")}>
                  <Link href="/security">
                    <Lock className="h-4 w-4" />
                    <span>Seguridad</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/security/ssh-access"}>
                  <Link href="/security/ssh-access">
                    <Terminal className="h-4 w-4" />
                    <span>Acceso SSH</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/logs"}>
                  <Link href="/logs">
                    <Activity className="h-4 w-4" />
                    <span>Logs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/analytics"}>
                  <Link href="/analytics">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analíticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {userRole === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/users"}>
                    <Link href="/users">
                      <User className="h-4 w-4" />
                      <span>Usuarios</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-interface.png" alt={username} />
                  <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">
                    {userRole === "admin" ? "Administrador" : "Visualizador"}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                "Cerrando sesión..."
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </>
              )}
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
