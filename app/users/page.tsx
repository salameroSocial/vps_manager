import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los usuarios que tienen acceso al dashboard</p>
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  )
}
