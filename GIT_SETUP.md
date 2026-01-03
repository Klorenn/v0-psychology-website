# Guía de Setup de Git y GitHub

Esta guía te ayudará a inicializar Git, crear el repositorio en GitHub y generar un patch.

## 🚀 Inicializar Git

### Paso 1: Inicializar repositorio local

```bash
cd /Users/paukoh/v0-psychology-website
git init
```

### Paso 2: Agregar archivos

```bash
# Agregar todos los archivos (excepto los ignorados en .gitignore)
git add .

# Verificar qué se va a commitear
git status
```

### Paso 3: Primer commit

```bash
git commit -m "Initial commit: Sistema completo de gestión de citas con Google Calendar y Resend"
```

## 📤 Crear Repositorio en GitHub

### Opción A: Desde GitHub Web

1. Ve a [GitHub](https://github.com)
2. Haz clic en "New repository"
3. Configura:
   - **Name**: `psychology-appointment-system` (o el nombre que prefieras)
   - **Description**: "Sistema completo de gestión de citas con integración de Google Calendar y Resend"
   - **Visibility**: Private (recomendado) o Public
   - **NO** inicialices con README, .gitignore o licencia (ya los tenemos)
4. Haz clic en "Create repository"

### Opción B: Desde la línea de comandos

```bash
# Instala GitHub CLI si no lo tienes
# brew install gh  # macOS
# o descarga desde: https://cli.github.com

# Autentica
gh auth login

# Crea el repositorio
gh repo create psychology-system-quotes \
  --private \
  --description "Sistema completo de gestión de citas con integración de Google Calendar y Resend" \
  --source=. \
  --remote=origin \
  --push
```

## 🔗 Conectar con GitHub

Si creaste el repo desde la web:

```bash
# Agrega el remote
git remote add origin https://github.com/TU_USUARIO/psychology-system-quotes.git

# O con SSH
git remote add origin git@github.com:TU_USUARIO/psychology-system-quotes.git

# Verifica
git remote -v
```

## 📤 Subir código a GitHub

```bash
# Asegúrate de estar en la rama main
git branch -M main

# Sube el código
git push -u origin main
```

## 🔖 Crear un Tag (Release)

Para marcar una versión estable:

```bash
# Crear tag
git tag -a v1.0.0 -m "Versión inicial: Sistema completo funcional"

# Subir tag a GitHub
git push origin v1.0.0
```

## 📦 Crear un Git Patch

Un patch es útil para compartir cambios específicos o aplicar en otro proyecto.

### Crear patch del último commit

```bash
git format-patch -1 HEAD --stdout > initial-commit.patch
```

### Crear patch de múltiples commits

```bash
# Patch de los últimos 5 commits
git format-patch -5 HEAD --stdout > last-5-commits.patch

# Patch desde un commit específico
git format-patch COMMIT_HASH --stdout > changes.patch
```

### Crear patch de cambios no commiteados

```bash
# Patch de cambios en staging
git diff --cached > staged-changes.patch

# Patch de todos los cambios (staged + unstaged)
git diff > all-changes.patch
```

### Aplicar un patch

```bash
# Aplicar patch
git apply initial-commit.patch

# O con am (apply mailbox, preserva commit info)
git am initial-commit.patch
```

## 📝 Comandos Útiles

### Ver historial

```bash
git log --oneline
git log --graph --oneline --all
```

### Ver diferencias

```bash
# Cambios no staged
git diff

# Cambios staged
git diff --cached

# Comparar con commit anterior
git diff HEAD~1
```

### Deshacer cambios

```bash
# Descartar cambios en un archivo
git checkout -- archivo.ts

# Descartar todos los cambios
git checkout -- .

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer último commit (descarta cambios)
git reset --hard HEAD~1
```

## 🔒 Seguridad

### ⚠️ IMPORTANTE: Nunca commitees

- `.env.local` (ya está en .gitignore)
- Credenciales reales
- API keys
- Passwords
- Tokens de acceso

### Verificar antes de commitear

```bash
# Ver qué se va a commitear
git status

# Ver diferencias
git diff --cached
```

## 📋 Checklist antes de hacer push

- [ ] `.env.local` NO está en el commit (verificar con `git status`)
- [ ] Todas las variables sensibles están en `.env.example`
- [ ] README.md está actualizado
- [ ] SETUP.md tiene instrucciones claras
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Los tests pasan (si los hay)
- [ ] El código compila sin errores

## 🎯 Workflow Recomendado

```bash
# 1. Hacer cambios
# ... editar archivos ...

# 2. Ver qué cambió
git status
git diff

# 3. Agregar cambios
git add .

# 4. Commitear
git commit -m "Descripción clara del cambio"

# 5. Subir a GitHub
git push origin main
```

## 🐛 Solución de Problemas

### Error: "remote origin already exists"

```bash
# Ver remotes actuales
git remote -v

# Cambiar URL del remote
git remote set-url origin NUEVA_URL

# O eliminar y agregar de nuevo
git remote remove origin
git remote add origin NUEVA_URL
```

### Error: "failed to push some refs"

```bash
# Primero hacer pull
git pull origin main --rebase

# Luego push
git push origin main
```

### Deshacer último push (cuidado!)

```bash
# Solo si es necesario y estás seguro
git reset --hard HEAD~1
git push origin main --force
```

## 📚 Recursos

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [GitHub CLI](https://cli.github.com)

