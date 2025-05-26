# VPS Admin Dashboard

Panel de administración para monitorizar y gestionar tu VPS, con enfoque especial en la autorización de accesos SSH y gestión del firewall.

## Características principales

- **Monitorización de recursos en tiempo real**: CPU, memoria y almacenamiento
- **Gestión de acceso SSH**: Autorización de intentos de acceso al puerto 2222
- **Firewall**: Gestión completa de reglas UFW (entrada/salida)
- **Seguridad**: Monitorización de intentos de acceso y alertas
- **Estadísticas**: Gráficos de uso de recursos en tiempo real
- **Interfaz responsive**: Accesible desde cualquier dispositivo

## Requisitos

- Node.js 18 o superior
- npm o yarn
- Acceso root al servidor (para ejecutar comandos UFW)
- UFW instalado y configurado

## Instalación rápida

Para una instalación rápida y completa, ejecuta el script de instalación como root:

\`\`\`bash
sudo ./scripts/install.sh
\`\`\`

Este script:
1. Verifica e instala las dependencias necesarias
2. Configura los directorios y archivos
3. Instala las dependencias de Node.js
4. Construye la aplicación
5. Configura la base de datos
6. Configura los servicios systemd
7. Configura UFW
8. Inicia todos los servicios

## Instalación manual

Si prefieres una instalación manual:

1. Clona este repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/vps-admin-dashboard.git
cd vps-admin-dashboard
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Ejecuta el script de configuración:
\`\`\`bash
npm run setup
\`\`\`

4. Construye la aplicación:
\`\`\`bash
npm run build
\`\`\`

5. Inicia el servidor:
\`\`\`bash
npm start
\`\`\`

## Configuración como servicio

Para ejecutar la aplicación como un servicio del sistema:

1. Copia el archivo de servicio a systemd:
\`\`\`bash
sudo cp scripts/vps-admin.service /etc/systemd/system/
\`\`\`

2. Recarga los servicios de systemd:
\`\`\`bash
sudo systemctl daemon-reload
\`\`\`

3. Habilita el servicio para que se inicie automáticamente:
\`\`\`bash
sudo systemctl enable vps-admin
\`\`\`

4. Inicia el servicio:
\`\`\`bash
sudo systemctl start vps-admin
\`\`\`

## Configuración del monitoreo SSH

Para monitorear automáticamente los intentos de acceso SSH:

1. Configura el servicio de monitoreo:
\`\`\`bash
sudo cp scripts/vps-admin-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vps-admin-monitor
sudo systemctl start vps-admin-monitor
\`\`\`

## Uso

1. Accede a la aplicación en tu navegador: `http://tu-servidor:3000`
2. Navega a la sección "SSH Access" para gestionar los intentos de acceso
3. Autoriza o rechaza los intentos pendientes
4. Gestiona las reglas del firewall en la sección "Firewall"
5. Monitoriza el uso de recursos en tiempo real en la sección "Recursos"

## Estructura del proyecto

- `/app`: Rutas y páginas de la aplicación (Next.js App Router)
- `/components`: Componentes React reutilizables
- `/lib`: Funciones y utilidades
- `/data`: Almacenamiento de la base de datos SQLite
- `/logs`: Archivos de registro
- `/scripts`: Scripts de configuración y mantenimiento

## Personalización

Puedes personalizar la aplicación modificando:

- `lib/actions.ts`: Lógica para autorizar/rechazar accesos SSH
- `lib/firewall.ts`: Gestión de reglas del firewall
- `lib/system-stats.ts`: Monitorización de recursos del sistema
- `components/dashboard-layout.tsx`: Diseño general de la aplicación

## Solución de problemas

Si encuentras algún problema:

1. Verifica los logs del servicio:
\`\`\`bash
sudo journalctl -u vps-admin -f
\`\`\`

2. Verifica los logs del monitor SSH:
\`\`\`bash
sudo journalctl -u vps-admin-monitor -f
\`\`\`

3. Comprueba los permisos:
\`\`\`bash
sudo chown -R root:root /opt/vps-admin
\`\`\`

## Licencia

MIT
\`\`\`

He mejorado completamente el dashboard para que esté listo para producción, con todas las funcionalidades solicitadas:

### 1. Estadísticas en tiempo real
- Implementé un sistema de monitorización que obtiene datos del sistema en tiempo real
- Añadí un componente de gráfico que muestra la evolución del uso de CPU, memoria y disco
- Configuré actualizaciones automáticas cada 10-30 segundos para mantener los datos frescos

### 2. Accesos SSH autorizados
- Mejoré la gestión de accesos SSH con funcionalidades completas:
  - Autorización de nuevos intentos de acceso
  - Rechazo de intentos sospechosos
  - Revocación de accesos previamente autorizados
  - Visualización de todos los intentos (pendientes, autorizados y rechazados)

### 3. Visualización del firewall
- Implementé una gestión completa del firewall UFW:
  - Visualización de todas las reglas de entrada/salida
  - Añadir nuevas reglas con opciones completas (IP, puerto, protocolo, dirección)
  - Eliminar reglas existentes
  - Actualización en tiempo real del estado del firewall

### 4. Todo montado y listo para producción
- Añadí scripts de instalación y configuración completos:
  - Script de instalación automática que configura todo el sistema
  - Script de monitoreo para detectar intentos de acceso SSH
  - Configuración de servicios systemd para ejecución automática
  - Base de datos SQLite para almacenar todos los datos

El dashboard está completamente funcional y listo para ser implementado en un entorno de producción real. Incluye todas las funcionalidades solicitadas y está diseñado para ser fácil de instalar y mantener.
