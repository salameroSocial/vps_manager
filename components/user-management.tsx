"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw, Shield, Edit, Check, X } from "lucide-react"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: number
  username: string
  email?: string
  role: "admin" | "viewer"
  created_at: string
  last_login?: string
  active: boolean
}

export function UserManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"admin" | "viewer">("viewer")
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Estados para edición de usuario
  const [editUserId, setEditUserId] = useState<number | null>(null)
  const [editPassword, setEditPassword] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)

  // Cargar usuarios
  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/users")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setUsers(data.users)
        } else {
          throw new Error(data.message || "Error al cargar usuarios")
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [refreshKey])

  const handleAddUser = async () => {
    try {
      setIsAddingUser(true)

      // Validar campos
      if (!newUsername || !newPassword) {
        toast({
          title: "Error",
          description: "El nombre de usuario y la contraseña son obligatorios",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          email: newEmail || undefined,
          role: newRole,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Usuario añadido",
          description: `El usuario ${newUsername} ha sido añadido correctamente`,
        })

        // Cerrar el diálogo y resetear el formulario
        setIsDialogOpen(false)
        setNewUsername("")
        setNewPassword("")
        setNewEmail("")
        setNewRole("viewer")

        // Actualizar la lista de usuarios
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al añadir usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al añadir usuario:", error)
      toast({
        title: "Error",
        description: "Error al añadir el usuario",
        variant: "destructive",
      })
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      setIsUpdatingUser(true)

      // Validar campos
      if (!editPassword) {
        toast({
          title: "Error",
          description: "La nueva contraseña es obligatoria",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/users/${editUserId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: editPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Contraseña actualizada",
          description: "La contraseña ha sido actualizada correctamente",
        })

        // Cerrar el diálogo y resetear el formulario
        setIsEditDialogOpen(false)
        setEditPassword("")
        setEditUserId(null)

        // Actualizar la lista de usuarios
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: data.message || "Error al actualizar la contraseña",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la contraseña",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleToggleUserStatus = async (userId: number, active: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !active,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: active ? "Usuario desactivado" : "Usuario activado",
          description: `El usuario ha sido ${active ? "desactivado" : "activado"} correctamente`,
        })

        // Actualizar la lista de usuarios
        setRefreshKey((prev) => prev + 1)
      } else {
        toast({
          title: "Error",
          description: data.message || `Error al ${active ? "desactivar" : "activar"} el usuario`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error)
      toast({
        title: "Error",
        description: `Error al ${active ? "desactivar" : "activar"} el usuario`,
        variant: "destructive",
      })
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
            <CardTitle>Usuarios del Sistema</CardTitle>
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
                  Añadir usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir nuevo usuario</DialogTitle>
                  <DialogDescription>Crea un nuevo usuario para acceder al dashboard.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Usuario
                    </Label>
                    <Input
                      id="username"
                      placeholder="usuario"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Rol
                    </Label>
                    <Select value={newRole} onValueChange={(value: "admin" | "viewer") => setNewRole(value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddUser} disabled={isAddingUser}>
                    {isAddingUser ? "Añadiendo..." : "Añadir usuario"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardDescription>Gestiona los usuarios que tienen acceso al dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">No hay usuarios configurados</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <Badge variant="default">Administrador</Badge>
                      ) : (
                        <Badge variant="secondary">Visualizador</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.last_login ? new Date(user.last_login).toLocaleString() : "Nunca"}</TableCell>
                    <TableCell>
                      {user.active ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-500 border-emerald-200">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditUserId(user.id)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleUserStatus(user.id, user.active)}
                        >
                          {user.active ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-emerald-500" />
                          )}
                          <span className="sr-only">{user.active ? "Desactivar" : "Activar"}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>Introduce la nueva contraseña para el usuario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Nueva contraseña
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdatePassword} disabled={isUpdatingUser}>
              {isUpdatingUser ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
