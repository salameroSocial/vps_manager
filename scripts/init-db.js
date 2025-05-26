#!/usr/bin/env node
/**
 * Script para inicializar la base de datos y crear el usuario admin
 * Versión JavaScript puro que no requiere TypeScript
 */

const sqlite3 = require("sqlite3").verbose()
const { open } = require("sqlite")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

// Asegurarse de que el directorio de datos existe
const DATA_DIR = path.join(process.cwd(), "data")
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const DB_PATH = path.join(DATA_DIR, "vps-admin.db")

async function initializeDatabase() {
  console.log("Inicializando base de datos...")
  try {
    // Abrir la conexión a la base de datos
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
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

    console.log("Tablas creadas correctamente")

    // Verificar si el usuario admin ya existe
    const adminUser = await db.get("SELECT * FROM users WHERE username = ?", ["admin"])

    if (!adminUser) {
      console.log("Creando usuario administrador por defecto...")

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash("admin123", 10)

      // Insertar el usuario admin
      await db.run("INSERT INTO users (username, password, role, created_at, active) VALUES (?, ?, ?, ?, ?)", [
        "admin",
        hashedPassword,
        "admin",
        new Date().toISOString(),
        1,
      ])

      console.log("Usuario admin creado con éxito (usuario: admin, contraseña: admin123)")
    } else {
      console.log("El usuario admin ya existe")
    }

    // Insertar algunos datos de ejemplo si la tabla está vacía
    const count = await db.get("SELECT COUNT(*) as count FROM access_attempts")
    if (count.count === 0) {
      console.log("Insertando datos de ejemplo...")

      // Insertar algunos intentos de acceso de ejemplo
      await db.run(`
        INSERT INTO access_attempts (ip, user, port, timestamp, status, details)
        VALUES 
          ('192.168.1.10', 'admin', 2222, '${new Date(Date.now() - 3600000).toISOString()}', 'authorized', 'Acceso autorizado manualmente'),
          ('203.0.113.42', 'root', 2222, '${new Date(Date.now() - 1800000).toISOString()}', 'pending', 'Intento de acceso detectado')
      `)

      // Insertar algunas reglas de firewall de ejemplo
      await db.run(`
        INSERT INTO firewall_rules (ip, port, action, created_at, created_by, active)
        VALUES 
          ('192.168.1.10', '2222', 'allow', '${new Date(Date.now() - 3600000).toISOString()}', 'admin', 1)
      `)

      console.log("Datos de ejemplo insertados correctamente")
    }

    await db.close()
    console.log("Inicialización completada con éxito")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    process.exit(1)
  }
}

// Ejecutar la inicialización
initializeDatabase()
