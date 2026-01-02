#!/bin/bash
# Script para actualizar .env.local con la URL del túnel

if [ -z "$1" ]; then
    echo "❌ Uso: ./update-env-with-url.sh https://tu-url.loca.lt"
    exit 1
fi

TUNNEL_URL=$1
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró .env.local"
    exit 1
fi

# Backup
cp "$ENV_FILE" "${ENV_FILE}.backup"

# Actualizar GOOGLE_REDIRECT_URI
sed -i '' "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${TUNNEL_URL}/api/google-calendar/callback|" "$ENV_FILE"

# Actualizar NEXT_PUBLIC_BASE_URL
sed -i '' "s|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=${TUNNEL_URL}|" "$ENV_FILE"

echo "✅ .env.local actualizado con: $TUNNEL_URL"
echo ""
echo "📝 Ahora actualiza en Google Cloud Console:"
echo "   Authorized redirect URIs: ${TUNNEL_URL}/api/google-calendar/callback"
