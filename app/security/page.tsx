import { DashboardLayout } from "@/components/dashboard-layout"
import { SecurityOverview } from "@/components/security-overview"

export default function SecurityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seguridad</h2>
          <p className="text-muted-foreground">Monitoriza y gestiona la seguridad de tu VPS</p>
        </div>

        <SecurityOverview />
      </div>
    </DashboardLayout>
  )
}
