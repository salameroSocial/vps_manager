#!/bin/bash
# Script para monitorear intentos de acceso SSH y actualizar la base de datos

# Configuración
LOG_FILE="/var/log/auth.log"
API_ENDPOINT="http://localhost:3000/api/ssh-monitor"
INTERVAL=60  # Intervalo en segundos

# Función para monitorear el log
monitor_log() {
  echo "Iniciando monitoreo de $LOG_FILE..."
  
  # Verificar si el archivo de log existe
  if [ ! -f "$LOG_FILE" ]; then
    echo "Error: Archivo de log $LOG_FILE no encontrado"
    exit 1
  fi
  
  # Bucle infinito para monitoreo continuo
  while true; do
    # Llamar al endpoint de monitoreo
    echo "Llamando al endpoint de monitoreo..."
    curl -s "$API_ENDPOINT" > /dev/null
    
    # Esperar el intervalo configurado
    echo "Esperando $INTERVAL segundos..."
    sleep $INTERVAL
  done
}

# Función para simular intentos (solo para desarrollo/demostración)
simulate_attempts() {
  echo "Iniciando simulación de intentos de acceso..."
  
  # Bucle infinito para simulación continua
  while true; do
    # Generar una IP aleatoria
    IP="192.168.$((RANDOM % 255)).$((RANDOM % 255))"
    
    # Llamar al endpoint de simulación
    echo "Simulando intento desde $IP..."
    curl -s "$API_ENDPOINT?simulate=true" > /dev/null
    
    # Esperar un intervalo aleatorio entre 30 y 120 segundos
    WAIT=$((30 + RANDOM % 90))
    echo "Esperando $WAIT segundos..."
    sleep $WAIT
  done
}

# Función principal
main() {
  case "$1" in
    monitor)
      monitor_log
      ;;
    simulate)
      simulate_attempts
      ;;
    *)
      echo "Uso: $0 {monitor|simulate}"
      echo "  monitor  - Monitorea el archivo de log y actualiza la base de datos"
      echo "  simulate - Simula intentos de acceso aleatorios (solo para desarrollo)"
      exit 1
      ;;
  esac
}

# Ejecutar la función principal con los argumentos proporcionados
main "$@"
