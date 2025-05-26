import { DashboardLayout } from "@/components/dashboard-layout"
import { ResourceUsageCard } from "@/components/resource-usage-card"
import { SystemStatsChart } from "@/components/system-stats-chart"

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recursos del Sistema</h2>
          <p className="text-muted-foreground">Monitoriza el uso de recursos de tu VPS en tiempo real</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ResourceUsageCard className="md:col-span-2 lg:col-span-3" />
        </div>

        <SystemStatsChart />
      </div>
    </DashboardLayout>
  )
}
