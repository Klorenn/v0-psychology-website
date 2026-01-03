#!/bin/bash

# Script para crear un Git patch

echo "📦 Creando Git patch..."
echo ""

# Verificar si es un repo de Git
if [ ! -d ".git" ]; then
    echo "❌ Error: No es un repositorio Git"
    echo "   Ejecuta primero: git init"
    exit 1
fi

# Verificar si hay commits
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "❌ Error: No hay commits en el repositorio"
    echo "   Ejecuta primero: git commit"
    exit 1
fi

# Opciones
echo "Selecciona el tipo de patch:"
echo "1) Último commit"
echo "2) Últimos 5 commits"
echo "3) Todos los commits"
echo "4) Cambios no commiteados (staged)"
echo "5) Todos los cambios (staged + unstaged)"
echo ""
read -p "Opción (1-5): " option

case $option in
    1)
        echo "📝 Creando patch del último commit..."
        git format-patch -1 HEAD --stdout > initial-commit.patch
        echo "✅ Patch creado: initial-commit.patch"
        ;;
    2)
        echo "📝 Creando patch de los últimos 5 commits..."
        git format-patch -5 HEAD --stdout > last-5-commits.patch
        echo "✅ Patch creado: last-5-commits.patch"
        ;;
    3)
        echo "📝 Creando patch de todos los commits..."
        FIRST_COMMIT=$(git rev-list --max-parents=0 HEAD)
        git format-patch $FIRST_COMMIT..HEAD --stdout > all-commits.patch
        echo "✅ Patch creado: all-commits.patch"
        ;;
    4)
        echo "📝 Creando patch de cambios staged..."
        git diff --cached > staged-changes.patch
        echo "✅ Patch creado: staged-changes.patch"
        ;;
    5)
        echo "📝 Creando patch de todos los cambios..."
        git diff > all-changes.patch
        echo "✅ Patch creado: all-changes.patch"
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "📋 Para aplicar el patch en otro proyecto:"
echo "   git apply <nombre-del-patch>.patch"
echo ""
echo "   O con am (preserva info de commit):"
echo "   git am <nombre-del-patch>.patch"

