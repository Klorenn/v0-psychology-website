#!/bin/bash

echo "🔧 Configurando ngrok..."

# Verificar si necesita authtoken
if ! ngrok config check > /dev/null 2>&1; then
    echo ""
    echo "⚠️  ngrok necesita autenticación"
    echo ""
    echo "Para obtener tu authtoken:"
    echo "1. Ve a https://dashboard.ngrok.com/"
    echo "2. Crea una cuenta (gratis) o inicia sesión"
    echo "3. Ve a: Your Authtoken"
    echo "4. Copia el token"
    echo ""
    read -p "Pega tu authtoken aquí: " AUTHTOKEN
    
    if [ -n "$AUTHTOKEN" ]; then
        ngrok config add-authtoken "$AUTHTOKEN"
        echo "✅ ngrok configurado correctamente"
    else
        echo "❌ No se proporcionó authtoken"
        exit 1
    fi
else
    echo "✅ ngrok ya está configurado"
fi

echo ""
echo "🚀 Iniciando túnel ngrok en puerto 3000..."
echo "📋 La URL aparecerá abajo. Cópiala para actualizar .env.local"
echo ""

ngrok http 3000
