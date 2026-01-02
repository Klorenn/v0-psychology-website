#!/bin/bash

# Script todo-en-uno para iniciar localtunnel y actualizar configuración

PORT=3000
ENV_FILE=".env.local"

echo "🚀 Iniciando localtunnel..."
echo ""

# Iniciar localtunnel en background y capturar output
npx --yes localtunnel --port $PORT > /tmp/lt-url.txt 2>&1 &
LT_PID=$!

echo "⏳ Esperando que localtunnel genere la URL (esto puede tomar 10-15 segundos)..."
echo ""

# Esperar y buscar la URL
for i in {1..15}; do
    sleep 1
    TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.loca\.lt' /tmp/lt-url.txt 2>/dev/null | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
done

if [ -z "$TUNNEL_URL" ]; then
    echo "⚠️  No se pudo obtener la URL automáticamente"
    echo ""
    echo "Por favor, revisa la salida de localtunnel arriba"
    echo "y copia la URL manualmente (algo como: https://abc123.loca.lt)"
    echo ""
    echo "Luego ejecuta:"
    echo "  ./update-env-with-url.sh TU_URL_AQUI"
    echo ""
    wait $LT_PID
    exit 1
fi

echo "✅ Túnel creado!"
echo "🌐 URL: $TUNNEL_URL"
echo ""

# Actualizar .env.local
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup"
    
    # Actualizar GOOGLE_REDIRECT_URI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback|" "$ENV_FILE"
        sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}|" "$ENV_FILE"
    else
        sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback|" "$ENV_FILE"
        sed -i "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}|" "$ENV_FILE"
    fi
    
    echo "✅ .env.local actualizado automáticamente"
    echo ""
    echo "📝 IMPORTANTE - Actualiza en Google Cloud Console:"
    echo "   1. Ve a: https://console.cloud.google.com/apis/credentials"
    echo "   2. Abre tu OAuth 2.0 Client ID"
    echo "   3. En 'Authorized redirect URIs', agrega:"
    echo "      ${TUNNEL_URL}/api/google-calendar/callback"
    echo "   4. Guarda los cambios"
    echo ""
    echo "🔄 El túnel está activo. Para detenerlo: Ctrl+C"
    echo ""
else
    echo "⚠️  No se encontró .env.local"
fi

# Mostrar la salida de localtunnel
tail -f /tmp/lt-url.txt &
TAIL_PID=$!

# Esperar a que el usuario presione Ctrl+C
trap "kill $LT_PID $TAIL_PID 2>/dev/null; exit" INT TERM

wait $LT_PID

