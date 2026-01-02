#!/bin/bash

# Script para mantener el túnel activo y reiniciarlo automáticamente si se cae

PORT=3000
ENV_FILE=".env.local"
LOG_FILE="/tmp/localtunnel-output.log"

echo "🚀 Iniciando túnel estable para puerto $PORT..."
echo ""

# Función para iniciar el túnel
start_tunnel() {
    echo "⏳ Iniciando nuevo túnel..."
    rm -f "$LOG_FILE"
    
    npx --yes localtunnel --port $PORT > "$LOG_FILE" 2>&1 &
    LT_PID=$!
    
    # Esperar a que se genere la URL
    for i in {1..25}; do
        sleep 1
        TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.loca\.lt' "$LOG_FILE" 2>/dev/null | head -1)
        if [ -n "$TUNNEL_URL" ]; then
            echo "✅ Túnel creado: $TUNNEL_URL"
            return 0
        fi
    done
    
    echo "❌ No se pudo obtener la URL del túnel"
    return 1
}

# Función para actualizar .env.local
update_env() {
    local TUNNEL_URL=$1
    
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${ENV_FILE}.backup"
        
        # Actualizar GOOGLE_REDIRECT_URI
        if grep -q "GOOGLE_REDIRECT_URI=" "$ENV_FILE"; then
            sed -i '' "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback|" "$ENV_FILE"
        else
            echo "GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback" >> "$ENV_FILE"
        fi
        
        # Actualizar NEXT_PUBLIC_BASE_URL
        if grep -q "NEXT_PUBLIC_BASE_URL=" "$ENV_FILE"; then
            sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}|" "$ENV_FILE"
        else
            echo "NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}" >> "$ENV_FILE"
        fi
        
        echo "✅ .env.local actualizado"
    fi
}

# Función para verificar que el túnel funciona
check_tunnel() {
    local TUNNEL_URL=$1
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TUNNEL_URL" --max-time 5 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        return 0
    else
        return 1
    fi
}

# Iniciar el túnel por primera vez
if start_tunnel; then
    TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.loca\.lt' "$LOG_FILE" 2>/dev/null | head -1)
    update_env "$TUNNEL_URL"
    
    echo ""
    echo "🌐 URL del túnel: $TUNNEL_URL"
    echo "📝 IMPORTANTE: Actualiza en Google Cloud Console:"
    echo "   ${TUNNEL_URL}/api/google-calendar/callback"
    echo ""
    echo "🔄 Monitoreando el túnel (Ctrl+C para detener)..."
    echo ""
    
    # Monitorear y reiniciar si es necesario
    while true; do
        sleep 30
        
        if ! check_tunnel "$TUNNEL_URL"; then
            echo "⚠️  Túnel desconectado, reiniciando..."
            pkill -f localtunnel 2>/dev/null
            sleep 3
            
            if start_tunnel; then
                TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.loca\.lt' "$LOG_FILE" 2>/dev/null | head -1)
                update_env "$TUNNEL_URL"
                echo "✅ Túnel reiniciado: $TUNNEL_URL"
                echo "📝 Actualiza Google Cloud Console con la nueva URL"
            fi
        fi
    done
else
    echo "❌ Error al iniciar el túnel"
    exit 1
fi

