"use server"

import { revalidatePath } from "next/cache"
import {
  updateAccessAttemptStatus,
  addFirewallRule,
  getAccessAttempts,
  getPendingAccessAttempts,
  getAuthorizedAccessAttempts,
  simulateAccessAttempt,
  getActiveFirewallRules,
} from "./db"
import { getSystemStats, getFirewallStatus, getSSHStats } from "./system-stats"
import { addUFWRule, deleteUFWRule } from "./firewall"

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Función para obtener estadísticas del sistema
export async function getSystemStatistics() {
  try {
    const stats = await getSystemStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error("Error al obtener estadísticas del sistema:", error)
    return { success: false, error: String(error) }
  }
}

// Función para obtener estadísticas del firewall
export async function getFirewallStatistics() {
  try {
    const stats = await getFirewallStatus()
    return { success: true, data: stats }
  } catch (error) {
    console.error("Error al obtener estadísticas del firewall:", error)
    return { success: false, error: String(error) }
  }
}

// Función para obtener estadísticas de SSH
export async function getSSHStatistics() {
  try {
    const stats = await getSSHStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error("Error al obtener estadísticas de SSH:", error)
    return { success: false, error: String(error) }
  }
}

// Función para autorizar acceso SSH
export async function authorizeSSHAccess(
  attemptId: number,
  ipAddress: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar la dirección IP para evitar inyección de comandos
    if (!isValidIpAddress(ipAddress)) {
      throw new Error("Dirección IP no válida")
    }

    // En producción, ejecutar el comando UFW
    try {
      await execAsync(`sudo ufw allow from ${ipAddress} to any port 2222`)
      console.log(`Regla UFW creada para ${ipAddress} en el puerto 2222`)
    } catch (error) {
      console.error("Error al ejecutar comando UFW:", error)
      // Si estamos en desarrollo o no tenemos permisos, continuamos sin error fatal
      console.log("Continuando sin ejecutar UFW (posiblemente en entorno de desarrollo)")
    }

    // Registrar la regla en la base de datos
    await addFirewallRule({
      ip: ipAddress,
      port: 2222,
      action: "allow",
      direction: "in",
      protocol: "tcp",
      created_at: new Date().toISOString(),
      created_by: "admin",
      active: true,
      description: "Acceso SSH autorizado",
    })

    // Actualizar el estado del intento de acceso
    await updateAccessAttemptStatus(attemptId, "authorized", "Acceso autorizado manualmente")

    // Revalidar la página para actualizar los datos
    revalidatePath("/security/ssh-access")
    revalidatePath("/")

    return {
      success: true,
      message: `Acceso autorizado para ${ipAddress}`,
    }
  } catch (error) {
    console.error("Error al autorizar el acceso SSH:", error)
    return {
      success: false,
      message: `Error al autorizar el acceso: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para rechazar acceso SSH
export async function rejectSSHAccess(
  attemptId: number,
  ipAddress: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar la dirección IP
    if (!isValidIpAddress(ipAddress)) {
      throw new Error("Dirección IP no válida")
    }

    // Opcionalmente, podríamos añadir una regla de bloqueo explícita
    try {
      await execAsync(`sudo ufw deny from ${ipAddress} to any port 2222`)
      console.log(`Regla UFW de bloqueo creada para ${ipAddress} en el puerto 2222`)

      // Registrar la regla en la base de datos
      await addFirewallRule({
        ip: ipAddress,
        port: 2222,
        action: "deny",
        direction: "in",
        protocol: "tcp",
        created_at: new Date().toISOString(),
        created_by: "admin",
        active: true,
        description: "Acceso SSH rechazado",
      })
    } catch (error) {
      console.error("Error al ejecutar comando UFW para bloqueo:", error)
      console.log("Continuando sin ejecutar UFW (posiblemente en entorno de desarrollo)")
    }

    // Actualizar el estado del intento de acceso
    await updateAccessAttemptStatus(attemptId, "rejected", "Acceso rechazado manualmente")

    // Revalidar la página para actualizar los datos
    revalidatePath("/security/ssh-access")
    revalidatePath("/")

    return {
      success: true,
      message: `Acceso rechazado para ${ipAddress}`,
    }
  } catch (error) {
    console.error("Error al rechazar el acceso SSH:", error)
    return {
      success: false,
      message: `Error al rechazar el acceso: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para revocar acceso SSH
export async function revokeSSHAccess(
  ruleId: number,
  ipAddress: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar la dirección IP
    if (!isValidIpAddress(ipAddress)) {
      throw new Error("Dirección IP no válida")
    }

    // Eliminar la regla UFW
    const result = await deleteUFWRule(ruleId, ipAddress, 2222)

    if (!result.success) {
      throw new Error(result.message)
    }

    // Revalidar la página para actualizar los datos
    revalidatePath("/security/ssh-access")
    revalidatePath("/")

    return {
      success: true,
      message: `Acceso revocado para ${ipAddress}`,
    }
  } catch (error) {
    console.error("Error al revocar el acceso SSH:", error)
    return {
      success: false,
      message: `Error al revocar el acceso: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para añadir una regla de firewall
export async function addFirewallRuleAction(rule: {
  ip: string
  port: string | number
  action: "allow" | "deny"
  direction?: "in" | "out" | "both"
  protocol?: "tcp" | "udp" | "any"
  description?: string
}): Promise<{ success: boolean; message: string; ruleId?: number }> {
  try {
    const result = await addUFWRule({
      ...rule,
      created_by: "admin",
    })

    // Revalidar la página para actualizar los datos
    revalidatePath("/security/firewall")
    revalidatePath("/")

    return result
  } catch (error) {
    console.error("Error al añadir regla de firewall:", error)
    return {
      success: false,
      message: `Error al añadir regla: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para eliminar una regla de firewall
export async function deleteFirewallRuleAction(
  ruleId: number,
  ip: string,
  port: string | number,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await deleteUFWRule(ruleId, ip, port)

    // Revalidar la página para actualizar los datos
    revalidatePath("/security/firewall")
    revalidatePath("/")

    return result
  } catch (error) {
    console.error("Error al eliminar regla de firewall:", error)
    return {
      success: false,
      message: `Error al eliminar regla: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para obtener todos los intentos de acceso
export async function getSSHAccessAttempts() {
  try {
    return await getAccessAttempts()
  } catch (error) {
    console.error("Error al obtener intentos de acceso:", error)
    return []
  }
}

// Función para obtener intentos de acceso pendientes
export async function getPendingSSHAccessAttempts() {
  try {
    return await getPendingAccessAttempts()
  } catch (error) {
    console.error("Error al obtener intentos de acceso pendientes:", error)
    return []
  }
}

// Función para obtener intentos de acceso autorizados
export async function getAuthorizedSSHAccessAttempts() {
  try {
    return await getAuthorizedAccessAttempts()
  } catch (error) {
    console.error("Error al obtener intentos de acceso autorizados:", error)
    return []
  }
}

// Función para obtener reglas de firewall activas
export async function getActiveUFWRules() {
  try {
    return await getActiveFirewallRules()
  } catch (error) {
    console.error("Error al obtener reglas de firewall activas:", error)
    return []
  }
}

// Función para simular un intento de acceso (para desarrollo/demostración)
export async function createSimulatedAccessAttempt(ip: string, user: string) {
  try {
    await simulateAccessAttempt(ip, user)
    revalidatePath("/security/ssh-access")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al simular intento de acceso:", error)
    return { success: false }
  }
}

// Función auxiliar para validar direcciones IP
function isValidIpAddress(ip: string): boolean {
  // Expresión regular para validar direcciones IPv4
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

  if (!ipv4Regex.test(ip)) {
    return false
  }

  // Verificar que cada octeto esté en el rango correcto
  const octets = ip.split(".")
  for (const octet of octets) {
    const num = Number.parseInt(octet, 10)
    if (num < 0 || num > 255) {
      return false
    }
  }

  return true
}
