#!/bin/bash

# Script para iniciar localtunnel y actualizar .env.local automáticamente

PORT=${1:-3000}
ENV_FILE=".env.local"

echo "🚀 Iniciando localtunnel en puerto $PORT..."
echo "⏳ Esto puede tomar unos segundos..."
echo ""

# Iniciar localtunnel y capturar la URL
LT_OUTPUT=$(npx --yes localtunnel --port $PORT 2>&1) &
LT_PID=$!

# Esperar a que localtunnel genere la URL
sleep 8

# Intentar obtener la URL de diferentes formas
TUNNEL_URL=""

# Método 1: Buscar en la salida del proceso
if [ -f "/proc/$LT_PID/fd/1" ]; then
    TUNNEL_URL=$(cat /proc/$LT_PID/fd/1 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
fi

# Método 2: Buscar en logs temporales
TUNNEL_URL=$(echo "$LT_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)

# Método 3: Usar la API de localtunnel si está disponible
if [ -z "$TUNNEL_URL" ]; then
    TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [ -z "$TUNNEL_URL" ]; then
    echo "⚠️  No se pudo obtener la URL automáticamente"
    echo ""
    echo "Por favor, copia la URL que aparece arriba (algo como: https://abc123.loca.lt)"
    echo "y ejecuta manualmente:"
    echo ""
    echo "  sed -i '' 's|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=TU_URL/api/google-calendar/callback|' .env.local"
    echo "  sed -i '' 's|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=TU_URL|' .env.local"
    echo ""
    echo "Presiona Ctrl+C para detener localtunnel"
    wait $LT_PID
    exit 1
fi

echo "✅ Túnel creado exitosamente!"
echo "🌐 URL pública: $TUNNEL_URL"
echo ""

# Actualizar .env.local
if [ -f "$ENV_FILE" ]; then
    # Backup del archivo original
    cp "$ENV_FILE" "${ENV_FILE}.backup"
    
    # Actualizar GOOGLE_REDIRECT_URI
    if grep -q "GOOGLE_REDIRECT_URI=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback|" "$ENV_FILE"
        else
            sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback|" "$ENV_FILE"
        fi
    else
        echo "GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback" >> "$ENV_FILE"
    fi
    
    # Actualizar NEXT_PUBLIC_BASE_URL
    if grep -q "NEXT_PUBLIC_BASE_URL=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}|" "$ENV_FILE"
        else
            sed -i "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}|" "$ENV_FILE"
        fi
    else
        echo "NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}" >> "$ENV_FILE"
    fi
    
    echo "✅ .env.local actualizado automáticamente"
    echo ""
    echo "📝 IMPORTANTE: Actualiza también en Google Cloud Console:"
    echo "   1. Ve a: https://console.cloud.google.com/apis/credentials"
    echo "   2. Abre tu OAuth 2.0 Client ID"
    echo "   3. En 'Authorized redirect URIs', agrega:"
    echo "      ${TUNNEL_URL}/api/google-calendar/callback"
    echo ""
else
    echo "⚠️  No se encontró .env.local"
fi

echo ""
echo "🔄 El túnel está activo. Para detenerlo, presiona Ctrl+C"
echo "📋 URL del túnel: $TUNNEL_URL"
echo ""

# Mantener el proceso corriendo y mostrar la salida
wait $LT_PID

