// Implementación simple de base de datos usando SQLite para almacenar intentos de acceso
import { Database } from "sqlite3"
import { open } from "sqlite"
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"

// Asegurarse de que el directorio de datos existe
const DATA_DIR = path.join(process.cwd(), "data")
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const DB_PATH = path.join(DATA_DIR, "vps-admin.db")

// Inicializar la base de datos
export async function getDb() {
  const db = await open({
    filename: DB_PATH,
    driver: Database,
  })

  // Crear tablas si no existen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS access_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      user TEXT NOT NULL,
      port INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT
    );
    
    CREATE TABLE IF NOT EXISTS firewall_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      port TEXT NOT NULL,
      action TEXT NOT NULL,
      direction TEXT DEFAULT 'in',
      protocol TEXT DEFAULT 'tcp',
      created_at TEXT NOT NULL,
      created_by TEXT,
      active INTEGER DEFAULT 1,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS system_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      cpu_usage REAL,
      memory_usage REAL,
      disk_usage REAL,
      network_rx INTEGER,
      network_tx INTEGER,
      connections INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL,
      last_login TEXT,
      active INTEGER DEFAULT 1
    );
  `)

  return db
}

// Tipos para TypeScript
export interface AccessAttempt {
  id?: number
  ip: string
  user: string
  port: number
  timestamp: string
  status: "pending" | "authorized" | "rejected"
  details?: string
  timeAgo?: string // Calculado, no almacenado
}

export interface FirewallRule {
  id?: number
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

export interface SystemStat {
  id?: number
  timestamp: string
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_rx: number
  network_tx: number
  connections: number
}

export interface User {
  id?: number
  username: string
  password?: string
  email?: string
  role: "admin" | "viewer"
  created_at: string
  last_login?: string
  active: boolean
}

// Funciones para acceder a los datos
export async function getAccessAttempts(): Promise<AccessAttempt[]> {
  const db = await getDb()
  const attempts = await db.all<AccessAttempt[]>("SELECT * FROM access_attempts ORDER BY timestamp DESC")

  // Calcular el tiempo transcurrido para cada intento
  return attempts.map((attempt) => ({
    ...attempt,
    timeAgo: getTimeAgo(new Date(attempt.timestamp)),
  }))
}

export async function getPendingAccessAttempts(): Promise<AccessAttempt[]> {
  const db = await getDb()
  const attempts = await db.all<AccessAttempt[]>(
    "SELECT * FROM access_attempts WHERE status = ? ORDER BY timestamp DESC",
    ["pending"],
  )

  return attempts.map((attempt) => ({
    ...attempt,
    timeAgo: getTimeAgo(new Date(attempt.timestamp)),
  }))
}

export async function getAuthorizedAccessAttempts(): Promise<AccessAttempt[]> {
  const db = await getDb()
  const attempts = await db.all<AccessAttempt[]>(
    "SELECT * FROM access_attempts WHERE status = ? ORDER BY timestamp DESC",
    ["authorized"],
  )

  return attempts.map((attempt) => ({
    ...attempt,
    timeAgo: getTimeAgo(new Date(attempt.timestamp)),
  }))
}

export async function addAccessAttempt(attempt: Omit<AccessAttempt, "id" | "timeAgo">): Promise<number> {
  const db = await getDb()
  const result = await db.run(
    "INSERT INTO access_attempts (ip, user, port, timestamp, status, details) VALUES (?, ?, ?, ?, ?, ?)",
    [attempt.ip, attempt.user, attempt.port, attempt.timestamp, attempt.status, attempt.details || null],
  )

  return result.lastID || 0
}

export async function updateAccessAttemptStatus(
  id: number,
  status: "authorized" | "rejected",
  details?: string,
): Promise<boolean> {
  const db = await getDb()
  const result = await db.run("UPDATE access_attempts SET status = ?, details = ? WHERE id = ?", [
    status,
    details || null,
    id,
  ])

  return result.changes > 0
}

export async function addFirewallRule(rule: Omit<FirewallRule, "id">): Promise<number> {
  const db = await getDb()
  const result = await db.run(
    "INSERT INTO firewall_rules (ip, port, action, direction, protocol, created_at, created_by, active, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      rule.ip,
      rule.port.toString(),
      rule.action,
      rule.direction || "in",
      rule.protocol || "tcp",
      rule.created_at,
      rule.created_by || null,
      rule.active ? 1 : 0,
      rule.description || null,
    ],
  )

  return result.lastID || 0
}

export async function getFirewallRules(): Promise<FirewallRule[]> {
  const db = await getDb()
  return db.all<FirewallRule[]>("SELECT * FROM firewall_rules ORDER BY created_at DESC")
}

export async function getActiveFirewallRules(): Promise<FirewallRule[]> {
  const db = await getDb()
  return db.all<FirewallRule[]>("SELECT * FROM firewall_rules WHERE active = 1 ORDER BY created_at DESC")
}

export async function updateFirewallRule(id: number, updates: Partial<FirewallRule>): Promise<boolean> {
  const db = await getDb()

  // Construir la consulta dinámicamente basada en los campos a actualizar
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key === "active") {
      fields.push(`${key} = ?`)
      values.push(value ? 1 : 0)
    } else if (value !== undefined) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (fields.length === 0) return false

  // Añadir el ID al final de los valores
  values.push(id)

  const query = `UPDATE firewall_rules SET ${fields.join(", ")} WHERE id = ?`
  const result = await db.run(query, values)

  return result.changes > 0
}

export async function addSystemStat(stat: Omit<SystemStat, "id">): Promise<number> {
  const db = await getDb()
  const result = await db.run(
    "INSERT INTO system_stats (timestamp, cpu_usage, memory_usage, disk_usage, network_rx, network_tx, connections) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      stat.timestamp,
      stat.cpu_usage,
      stat.memory_usage,
      stat.disk_usage,
      stat.network_rx,
      stat.network_tx,
      stat.connections,
    ],
  )

  return result.lastID || 0
}

export async function getSystemStats(limit = 60): Promise<SystemStat[]> {
  const db = await getDb()
  return db.all<SystemStat[]>("SELECT * FROM system_stats ORDER BY timestamp DESC LIMIT ?", [limit])
}

// Funciones para gestionar usuarios
export async function createUser(user: Omit<User, "id" | "created_at">): Promise<number> {
  const db = await getDb()

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(user.password!, 10)

  const result = await db.run(
    "INSERT INTO users (username, password, email, role, created_at, active) VALUES (?, ?, ?, ?, ?, ?)",
    [
      user.username,
      hashedPassword,
      user.email || null,
      user.role || "admin",
      new Date().toISOString(),
      user.active ? 1 : 0,
    ],
  )

  return result.lastID || 0
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const db = await getDb()
  const user = await db.get<User>("SELECT * FROM users WHERE username = ?", [username])

  return user || null
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username)

  if (!user || !user.active) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password!)

  if (!isValid) {
    return null
  }

  // Actualizar último login
  await updateUserLastLogin(user.id!)

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword as User
}

export async function updateUserLastLogin(userId: number): Promise<boolean> {
  const db = await getDb()
  const result = await db.run("UPDATE users SET last_login = ? WHERE id = ?", [new Date().toISOString(), userId])

  return result.changes > 0
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb()
  const users = await db.all<User[]>("SELECT id, username, email, role, created_at, last_login, active FROM users")

  return users
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  const db = await getDb()

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const result = await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId])

  return result.changes > 0
}

export async function updateUser(userId: number, updates: Partial<User>): Promise<boolean> {
  const db = await getDb()

  // Construir la consulta dinámicamente basada en los campos a actualizar
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key === "password") {
      // No actualizar la contraseña aquí, usar updateUserPassword
      return
    }

    if (key === "active") {
      fields.push(`${key} = ?`)
      values.push(value ? 1 : 0)
    } else if (value !== undefined) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (fields.length === 0) return false

  // Añadir el ID al final de los valores
  values.push(userId)

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`
  const result = await db.run(query, values)

  return result.changes > 0
}

// Función auxiliar para calcular el tiempo transcurrido
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs} segundos`
  if (diffMins < 60) return `${diffMins} minutos`
  if (diffHours < 24) return `${diffHours} horas`
  return `${diffDays} días`
}

// Función para simular intentos de acceso (para desarrollo/demostración)
export async function simulateAccessAttempt(ip: string, user: string): Promise<boolean> {
  const timestamp = new Date().toISOString()

  await addAccessAttempt({
    ip,
    user,
    port: 2222,
    timestamp,
    status: "pending",
    details: "Intento de acceso simulado",
  })

  console.log(`Intento de acceso simulado desde ${ip} para el usuario ${user}`)
  return true
}

// Función para inicializar un usuario administrador por defecto
export async function initializeDefaultAdmin(): Promise<void> {
  try {
    const adminExists = await getUserByUsername("admin")

    if (!adminExists) {
      console.log("Creando usuario administrador por defecto...")
      await createUser({
        username: "admin",
        password: "admin123", // En producción, usar una contraseña más segura
        role: "admin",
        active: true,
      })
      console.log("Usuario administrador creado con éxito.")
    }
  } catch (error) {
    console.error("Error al inicializar el usuario administrador:", error)
  }
}
