#!/bin/bash

# Script para iniciar ngrok automáticamente y actualizar .env.local

PORT=3000
ENV_FILE=".env.local"

echo "🚀 Iniciando ngrok en puerto $PORT..."

# Verificar si ngrok está configurado
if ! ngrok config check > /dev/null 2>&1; then
    echo "❌ ngrok no está configurado. Ejecuta primero: ./setup-ngrok.sh"
    exit 1
fi

# Iniciar ngrok en background
ngrok http $PORT --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Esperando que ngrok se inicie..."
sleep 5

# Obtener la URL pública
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ No se pudo obtener la URL de ngrok"
    echo "Revisa los logs: cat /tmp/ngrok.log"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ Túnel creado exitosamente!"
echo "🌐 URL pública: $NGROK_URL"
echo ""

# Actualizar .env.local
if [ -f "$ENV_FILE" ]; then
    # Actualizar GOOGLE_REDIRECT_URI
    if grep -q "GOOGLE_REDIRECT_URI=" "$ENV_FILE"; then
        sed -i '' "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${NGROK_URL}/api/google-calendar/callback|" "$ENV_FILE"
    else
        echo "GOOGLE_REDIRECT_URI=${NGROK_URL}/api/google-calendar/callback" >> "$ENV_FILE"
    fi
    
    # Actualizar NEXT_PUBLIC_BASE_URL
    if grep -q "NEXT_PUBLIC_BASE_URL=" "$ENV_FILE"; then
        sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${NGROK_URL}|" "$ENV_FILE"
    else
        echo "NEXT_PUBLIC_BASE_URL=${NGROK_URL}" >> "$ENV_FILE"
    fi
    
    echo "✅ .env.local actualizado con la nueva URL"
    echo ""
    echo "📝 Actualiza también en Google Cloud Console:"
    echo "   Authorized redirect URIs: ${NGROK_URL}/api/google-calendar/callback"
    echo ""
else
    echo "⚠️  No se encontró .env.local"
fi

echo ""
echo "🔄 Para detener el túnel, presiona Ctrl+C o ejecuta: kill $NGROK_PID"
echo ""

# Mantener el proceso corriendo
wait $NGROK_PID
