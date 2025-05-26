#!/usr/bin/env node
/**
 * Script para configurar el entorno de producción
 *
 * Este script:
 * 1. Crea la estructura de directorios necesaria
 * 2. Configura la base de datos SQLite
 * 3. Configura el servicio de monitoreo SSH
 * 4. Configura el servicio systemd para ejecutar la aplicación
 */

import fs from "fs"
import path from "path"
import { getDb, initializeDefaultAdmin } from "../lib/db"

// Directorios necesarios
const DATA_DIR = path.join(process.cwd(), "data")
const LOGS_DIR = path.join(process.cwd(), "logs")

// Crear directorios si no existen
console.log("Creando estructura de directorios...")
;[DATA_DIR, LOGS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Directorio creado: ${dir}`)
  }
})

// Inicializar la base de datos
console.log("Inicializando base de datos...")
async function setupDatabase() {
  try {
    const db = await getDb()
    console.log("Base de datos inicializada correctamente")

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
          ('192.168.1.10', 2222, 'allow', '${new Date(Date.now() - 3600000).toISOString()}', 'admin', 1)
      `)

      console.log("Datos de ejemplo insertados correctamente")
    }

    // Inicializar usuario administrador por defecto
    await initializeDefaultAdmin()

    await db.close()
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    process.exit(1)
  }
}

// Configurar el servicio de monitoreo SSH
console.log("Configurando servicio de monitoreo SSH...")
const cronJobContent = `
# Monitoreo de intentos de acceso SSH cada 5 minutos
*/5 * * * * curl -s http://localhost:3000/api/ssh-monitor > /dev/null 2>&1
`

const cronJobPath = path.join(process.cwd(), "ssh-monitor-cron")
fs.writeFileSync(cronJobPath, cronJobContent)
console.log(`Archivo de cron creado: ${cronJobPath}`)
console.log("Para instalarlo, ejecuta: crontab ssh-monitor-cron")

// Crear archivo de servicio systemd
console.log("Creando archivo de servicio systemd...")
const systemdServiceContent = `
[Unit]
Description=VPS Admin Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${process.cwd()}
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=JWT_SECRET=your-secure-jwt-secret-key-change-this-in-production

[Install]
WantedBy=multi-user.target
`

const systemdServicePath = path.join(process.cwd(), "vps-admin.service")
fs.writeFileSync(systemdServicePath, systemdServiceContent)
console.log(`Archivo de servicio systemd creado: ${systemdServicePath}`)
console.log("Para instalarlo, ejecuta:")
console.log("  sudo cp vps-admin.service /etc/systemd/system/")
console.log("  sudo systemctl daemon-reload")
console.log("  sudo systemctl enable vps-admin")
console.log("  sudo systemctl start vps-admin")

// Ejecutar la configuración de la base de datos
setupDatabase()
  .then(() => {
    console.log("\nConfiguración completada con éxito!")
    console.log("\nPara iniciar la aplicación en modo producción:")
    console.log("  npm run build")
    console.log("  npm start")
    console.log("\nO utiliza el servicio systemd configurado anteriormente.")
    console.log("\nCredenciales por defecto:")
    console.log("  Usuario: admin")
    console.log("  Contraseña: admin123")
    console.log("\nIMPORTANTE: Cambia la contraseña por defecto después del primer inicio de sesión.")
  })
  .catch((error) => {
    console.error("Error durante la configuración:", error)
  })
