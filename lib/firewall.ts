// Módulo para gestionar el firewall UFW
// Nota: Este archivo solo debe ser importado desde el servidor
import { addFirewallRule, getFirewallRules, updateFirewallRule } from "./db"

export interface FirewallRule {
  id?: number
  ip: string
  port: number | string
  action: "allow" | "deny"
  direction?: "in" | "out" | "both"
  protocol?: "tcp" | "udp" | "any"
  created_at: string
  created_by?: string
  active: boolean
  description?: string
}

// Función para obtener el estado actual del firewall
export async function getFirewallStatus(): Promise<{ active: boolean; rules: FirewallRule[] }> {
  try {
    // En un entorno real, verificaríamos si UFW está activo
    // Pero para desarrollo, asumimos que está activo
    const active = true

    // Obtener las reglas de la base de datos
    const rules = await getFirewallRules()

    return { active, rules }
  } catch (error) {
    console.error("Error al obtener el estado del firewall:", error)
    throw error
  }
}

// Función para obtener las reglas actuales del firewall
export async function getUFWRules(): Promise<string[]> {
  try {
    // En un entorno real, ejecutaríamos el comando UFW
    // Pero para desarrollo, devolvemos un array vacío
    return []
  } catch (error) {
    console.error("Error al obtener las reglas UFW:", error)
    return []
  }
}

// Función para añadir una regla al firewall
export async function addUFWRule(
  rule: Omit<FirewallRule, "id" | "created_at" | "active">,
): Promise<{ success: boolean; message: string; ruleId?: number }> {
  try {
    // Validar la dirección IP
    if (!isValidIpAddress(rule.ip)) {
      throw new Error("Dirección IP no válida")
    }

    // Validar el puerto
    if (rule.port !== "any" && (isNaN(Number(rule.port)) || Number(rule.port) < 1 || Number(rule.port) > 65535)) {
      throw new Error("Puerto no válido")
    }

    // En un entorno real, ejecutaríamos el comando UFW
    // Pero para desarrollo, solo registramos la regla en la base de datos
    console.log(`Simulando creación de regla UFW para ${rule.ip} en el puerto ${rule.port}`)

    // Registrar la regla en la base de datos
    const ruleId = await addFirewallRule({
      ...rule,
      created_at: new Date().toISOString(),
      active: true,
    })

    return {
      success: true,
      message: `Regla añadida correctamente para ${rule.ip}`,
      ruleId,
    }
  } catch (error) {
    console.error("Error al añadir regla UFW:", error)
    return {
      success: false,
      message: `Error al añadir regla: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función para eliminar una regla del firewall
export async function deleteUFWRule(
  ruleId: number,
  ip: string,
  port: number | string,
): Promise<{ success: boolean; message: string }> {
  try {
    // En un entorno real, ejecutaríamos el comando UFW
    // Pero para desarrollo, solo actualizamos la base de datos
    console.log(`Simulando eliminación de regla UFW para ${ip} en el puerto ${port}`)

    // Actualizar la regla en la base de datos (marcarla como inactiva)
    await updateFirewallRule(ruleId, { active: false })

    return {
      success: true,
      message: `Regla eliminada correctamente para ${ip}`,
    }
  } catch (error) {
    console.error("Error al eliminar regla UFW:", error)
    return {
      success: false,
      message: `Error al eliminar regla: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Función auxiliar para validar direcciones IP
export function isValidIpAddress(ip: string): boolean {
  // Expresión regular para validar direcciones IPv4 y CIDR
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/\d{1,2})?$/

  if (!ipv4Regex.test(ip)) {
    return false
  }

  // Si es una notación CIDR, validamos la máscara
  if (ip.includes("/")) {
    const parts = ip.split("/")
    const mask = Number.parseInt(parts[1])
    if (isNaN(mask) || mask < 0 || mask > 32) {
      return false
    }
  }

  // Verificar que cada octeto esté en el rango correcto
  const octets = ip.split("/")[0].split(".")
  for (const octet of octets) {
    const num = Number.parseInt(octet, 10)
    if (num < 0 || num > 255) {
      return false
    }
  }

  return true
}
