#!/bin/bash
# Script para iniciar ngrok con dominio personalizado (si está configurado)
# o con dominio aleatorio (gratis)

PORT=${1:-3000}

echo "🚀 Iniciando túnel ngrok en puerto $PORT..."
echo ""
echo "Opciones:"
echo "1. Túnel básico (gratis, dominio aleatorio): ngrok http $PORT"
echo "2. Túnel con dominio personalizado: ngrok http $PORT --domain=psmariasanluis.com"
echo ""

# Verificar si tiene authtoken configurado
if ngrok config check > /dev/null 2>&1; then
    echo "✅ ngrok está configurado"
    echo ""
    echo "Para usar dominio personalizado, necesitas:"
    echo "- Tener el dominio psmariasanluis.com registrado"
    echo "- Plan de ngrok que permita dominios personalizados"
    echo "- Configurar DNS del dominio"
    echo ""
    echo "Iniciando túnel básico (gratis)..."
    ngrok http $PORT
else
    echo "⚠️  ngrok no está autenticado"
    echo ""
    echo "Para configurar ngrok:"
    echo "1. Crea una cuenta en https://dashboard.ngrok.com/"
    echo "2. Copia tu authtoken"
    echo "3. Ejecuta: ngrok config add-authtoken TU_TOKEN"
    echo ""
    echo "Iniciando túnel sin autenticación (limitado)..."
    ngrok http $PORT
fi
