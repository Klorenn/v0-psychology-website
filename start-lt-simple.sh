#!/bin/bash
# Versión simplificada que muestra la URL y espera que la copies manualmente

PORT=${1:-3000}

echo "🚀 Iniciando localtunnel en puerto $PORT..."
echo ""
echo "📋 Cuando aparezca la URL (ej: https://abc123.loca.lt), cópiala"
echo "   y ejecuta el script update-env.sh con esa URL"
echo ""
echo "⏳ Iniciando..."
echo ""

npx --yes localtunnel --port $PORT
