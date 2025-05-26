import { SSHAccessManager } from "@/components/ssh-access-manager"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SSHAccessPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Acceso SSH</h2>
          <p className="text-muted-foreground">Autoriza o rechaza intentos de acceso SSH al puerto 2222</p>
        </div>

        <SSHAccessManager />
      </div>
    </DashboardLayout>
  )
}
