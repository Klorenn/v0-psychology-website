#!/bin/bash

# Script simple y confiable para iniciar localtunnel

PORT=3000
ENV_FILE=".env.local"

echo "🚀 Iniciando localtunnel en puerto $PORT..."
echo ""

# Detener cualquier túnel anterior
pkill -f localtunnel 2>/dev/null
sleep 2

# Iniciar localtunnel y capturar la URL
echo "⏳ Esperando que localtunnel genere la URL (15-20 segundos)..."
echo ""

# Ejecutar localtunnel y capturar output
npx --yes localtunnel --port $PORT 2>&1 | tee /tmp/lt-output.log &
LT_PID=$!

# Esperar y buscar la URL
for i in {1..25}; do
    sleep 1
    TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.loca\.lt' /tmp/lt-output.log 2>/dev/null | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
done

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ No se pudo obtener la URL automáticamente"
    echo ""
    echo "Por favor, revisa el archivo /tmp/lt-output.log"
    echo "y busca la URL manualmente (algo como: https://abc123.loca.lt)"
    echo ""
    kill $LT_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ Túnel creado exitosamente!"
echo "🌐 URL pública: $TUNNEL_URL"
echo ""

# Actualizar .env.local
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
    
    echo "✅ .env.local actualizado automáticamente"
    echo ""
    echo "📝 IMPORTANTE - Actualiza en Google Cloud Console:"
    echo "   1. Ve a: https://console.cloud.google.com/apis/credentials"
    echo "   2. Abre tu OAuth 2.0 Client ID"
    echo "   3. En 'Authorized redirect URIs', agrega/actualiza:"
    echo "      ${TUNNEL_URL}/api/google-calendar/callback"
    echo "   4. Guarda los cambios"
    echo ""
else
    echo "⚠️  No se encontró .env.local"
fi

echo ""
echo "🔄 El túnel está activo. Para detenerlo, presiona Ctrl+C"
echo "📋 URL del túnel: $TUNNEL_URL"
echo ""

# Mantener el proceso corriendo
wait $LT_PID

