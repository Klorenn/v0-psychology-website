#!/bin/bash

# Script para inicializar Git y preparar para GitHub

echo "🚀 Inicializando Git y preparando para GitHub..."
echo ""

# Verificar si ya es un repo de Git
if [ -d ".git" ]; then
    echo "⚠️  Ya existe un repositorio Git"
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Inicializar Git
echo "📦 Inicializando repositorio Git..."
git init

# Agregar todos los archivos
echo "📝 Agregando archivos..."
git add .

# Verificar qué se va a commitear
echo ""
echo "📋 Archivos que se van a commitear:"
git status --short

echo ""
read -p "¿Hacer commit inicial? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: Sistema completo de gestión de citas con Google Calendar y Resend
    
    - Dashboard administrativo completo
    - Integración Google Calendar (OAuth 2.0)
    - Envío automático de emails con Resend
    - Sistema de reseñas/testimonios
    - Editor visual de página
    - Autenticación JWT segura
    - Documentación completa"
    
    echo "✅ Commit inicial creado"
fi

# Crear rama main
git branch -M main

echo ""
echo "✅ Git inicializado correctamente"
echo ""
echo "📤 Próximos pasos:"
echo "   1. Crea un repositorio en GitHub llamado: psychology-system-quotes"
echo "   2. Ejecuta: git remote add origin https://github.com/TU_USUARIO/psychology-system-quotes.git"
echo "   3. Ejecuta: git push -u origin main"
echo ""
echo "🔧 Para crear un patch:"
echo "   git format-patch -1 HEAD --stdout > initial-commit.patch"

