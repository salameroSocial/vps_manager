// Módulo para obtener estadísticas del sistema en tiempo real
// Nota: Este archivo solo debe ser importado desde el servidor

// Tipos para las estadísticas del sistema
export interface SystemStats {
  cpu: {
    usage: number
    cores: number
    model: string
    speed: number
  }
  memory: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usagePercentage: number
  }
  network: {
    rx: number
    tx: number
    connections: number
  }
  uptime: {
    system: number
    formatted: string
  }
  loadAverage: number[]
}

// Esta función solo debe llamarse desde el servidor (API routes o Server Components)
export async function getSystemStats(): Promise<SystemStats> {
  // En un entorno de servidor real, aquí usaríamos child_process, os, fs
  // Pero para que funcione en el cliente, simulamos los datos

  // Simulamos datos para desarrollo
  return {
    cpu: {
      usage: Math.random() * 100,
      cores: 4,
      model: "Intel(R) Core(TM) i7",
      speed: 2800,
    },
    memory: {
      total: 16 * 1024 * 1024 * 1024, // 16GB
      used: Math.random() * 8 * 1024 * 1024 * 1024, // 0-8GB
      free: 8 * 1024 * 1024 * 1024, // 8GB
      usagePercentage: Math.random() * 100,
    },
    disk: {
      total: 500 * 1024 * 1024 * 1024, // 500GB
      used: Math.random() * 250 * 1024 * 1024 * 1024, // 0-250GB
      free: 250 * 1024 * 1024 * 1024, // 250GB
      usagePercentage: Math.random() * 100,
    },
    network: {
      rx: Math.random() * 1024 * 1024 * 10, // 0-10MB
      tx: Math.random() * 1024 * 1024 * 5, // 0-5MB
      connections: Math.floor(Math.random() * 20), // 0-20 conexiones
    },
    uptime: {
      system: 60 * 60 * 24 * Math.floor(Math.random() * 30), // 0-30 días
      formatted: "10d 5h 30m",
    },
    loadAverage: [Math.random() * 2, Math.random() * 1.5, Math.random() * 1],
  }
}

// Función para obtener estadísticas de firewall
export async function getFirewallStats() {
  // Simulamos datos para desarrollo
  return {
    status: "active",
    totalRules: 12,
    blockedConnections: 156,
    lastUpdated: new Date().toISOString(),
    topBlockedIPs: [
      { ip: "45.227.255.207", count: 23 },
      { ip: "185.180.143.49", count: 18 },
      { ip: "193.35.18.187", count: 15 },
      { ip: "45.155.205.233", count: 12 },
      { ip: "89.248.165.74", count: 9 },
    ],
  }
}

// Función para obtener estadísticas de SSH
export async function getSSHStats() {
  // Simulamos datos para desarrollo
  return {
    totalAttempts: 278,
    authorizedIPs: 5,
    failedAttempts: 273,
    lastAttempt: new Date().toISOString(),
    topUsernames: [
      { username: "root", count: 156 },
      { username: "admin", count: 67 },
      { username: "ubuntu", count: 34 },
      { username: "user", count: 12 },
      { username: "test", count: 9 },
    ],
  }
}

// Función para formatear bytes a una unidad legible
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
