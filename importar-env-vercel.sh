#!/bin/bash

# Script para importar variables de entorno a Vercel
# Uso: ./importar-env-vercel.sh

echo "🚀 Importando variables de entorno a Vercel..."
echo ""

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado."
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar que estás logueado
echo "🔐 Verificando sesión de Vercel..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  No estás logueado en Vercel. Iniciando sesión..."
    vercel login
fi

echo ""
echo "📋 Importando variables desde env-vercel.txt..."
echo ""

# Leer el archivo y agregar cada variable
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Saltar comentarios y líneas vacías
    if [[ $key =~ ^#.*$ ]] || [[ -z "$key" ]]; then
        continue
    fi
    
    # Limpiar espacios
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [ -n "$key" ] && [ -n "$value" ]; then
        echo "➕ Agregando: $key"
        echo "$value" | vercel env add "$key" production preview 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "   ✅ $key agregada correctamente"
        else
            echo "   ⚠️  $key ya existe o hubo un error. Verifica manualmente."
        fi
        echo ""
    fi
done < env-vercel.txt

echo ""
echo "✅ Proceso completado!"
echo ""
echo "📝 IMPORTANTE:"
echo "   1. Verifica que SMTP_PASS tenga tu contraseña de aplicación real"
echo "   2. Ve a Vercel Dashboard y verifica todas las variables"
echo "   3. Haz 'Redeploy' del último despliegue"
echo ""
echo "🔗 Dashboard: https://vercel.com/dashboard"

