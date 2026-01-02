#!/bin/bash

# Script simple para iniciar localtunnel
# La URL aparecerá en la terminal - cópiala y úsala

PORT=${1:-3000}

echo "🚀 Iniciando localtunnel en puerto $PORT..."
echo ""
echo "📋 Cuando veas la URL (ej: https://abc123.loca.lt), cópiala"
echo ""
echo "Luego ejecuta:"
echo "  ./update-env-with-url.sh https://tu-url-aqui.loca.lt"
echo ""
echo "Y actualiza en Google Cloud Console la URL de redirect"
echo ""
echo "⏳ Iniciando localtunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx --yes localtunnel --port $PORT

