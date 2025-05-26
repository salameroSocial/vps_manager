#!/bin/bash
# Script de instalación para el VPS Admin Dashboard

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes de estado
print_status() {
  echo -e "${GREEN}[+] $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
  echo -e "${RED}[-] $1${NC}"
}

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then
  print_error "Este script debe ejecutarse como root"
  exit 1
fi

# Verificar dependencias
print_status "Verificando dependencias..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js no está instalado"
  print_status "Instalando Node.js..."
  
  # Instalar Node.js
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
  
  if ! command -v node &> /dev/null; then
    print_error "No se pudo instalar Node.js. Por favor, instálalo manualmente."
    exit 1
  fi
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
  print_error "npm no está instalado"
  print_status "Instalando npm..."
  
  # Instalar npm
  apt-get install -y npm
  
  if ! command -v npm &> /dev/null; then
    print_error "No se pudo instalar npm. Por favor, instálalo manualmente."
    exit 1
  fi
fi

# Verificar UFW
if ! command -v ufw &> /dev/null; then
  print_warning "UFW no está instalado. Se instalará ahora."
  apt-get install -y ufw
  
  if ! command -v ufw &> /dev/null; then
    print_error "No se pudo instalar UFW. Por favor, instálalo manualmente."
    exit 1
  fi
fi

# Crear directorios necesarios
print_status "Creando directorios..."
mkdir -p /opt/vps-admin
mkdir -p /opt/vps-admin/data
mkdir -p /opt/vps-admin/logs

# Copiar archivos
print_status "Copiando archivos..."
cp -r ./* /opt/vps-admin/

# Instalar dependencias
print_status "Instalando dependencias..."
cd /opt/vps-admin
npm install

# Construir la aplicación
print_status "Construyendo la aplicación..."
npm run build

# Configurar la base de datos
print_status "Configurando la base de datos..."
npm run setup

# Configurar el servicio systemd
print_status "Configurando el servicio systemd..."
cat > /etc/systemd/system/vps-admin.service << EOF
[Unit]
Description=VPS Admin Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/vps-admin
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Configurar el servicio de monitoreo
print_status "Configurando el servicio de monitoreo..."
cat > /etc/systemd/system/vps-admin-monitor.service << EOF
[Unit]
Description=VPS Admin SSH Monitor
After=network.target vps-admin.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/vps-admin
ExecStart=/bin/bash /opt/vps-admin/scripts/monitor.sh monitor
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Hacer ejecutables los scripts
chmod +x /opt/vps-admin/scripts/*.sh

# Recargar systemd
systemctl daemon-reload

# Habilitar y iniciar los servicios
print_status "Habilitando e iniciando los servicios..."
systemctl enable vps-admin
systemctl start vps-admin
systemctl enable vps-admin-monitor
systemctl start vps-admin-monitor

# Configurar UFW si no está ya configurado
print_status "Configurando UFW..."
ufw allow 3000/tcp
ufw allow 2222/tcp

# Verificar si UFW está activo
if ! ufw status | grep -q "Status: active"; then
  print_warning "UFW no está activo. Se activará ahora."
  ufw --force enable
fi

print_status "Instalación completada con éxito!"
print_status "El dashboard está disponible en: http://$(hostname -I | awk '{print $1}'):3000"
print_status "Para acceder desde fuera, asegúrate de abrir el puerto 3000 en tu firewall."
