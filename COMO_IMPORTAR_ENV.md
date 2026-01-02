# 📥 Cómo Importar el Archivo .env en Vercel

## 🚀 Opción 1: Usar Vercel CLI (Más Rápido)

Si tienes Vercel CLI instalado, puedes importar directamente:

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Iniciar sesión
vercel login

# 3. Navegar a tu proyecto
cd /Users/paukoh/v0-psychology-website

# 4. Importar variables desde .env.vercel
vercel env pull .env.vercel
# Luego agrega cada variable:
vercel env add SMTP_HOST production preview
vercel env add SMTP_PORT production preview
vercel env add SMTP_USER production preview
vercel env add SMTP_PASS production preview
vercel env add GOOGLE_CLIENT_ID production preview
vercel env add GOOGLE_CLIENT_SECRET production preview
vercel env add NEXT_PUBLIC_BASE_URL production preview
vercel env add GOOGLE_REDIRECT_URI production preview
```

**Nota:** Vercel CLI te pedirá el valor de cada variable. Puedes copiarlo desde `.env.vercel`.

---

## 🖱️ Opción 2: Importar Manualmente en Vercel (Recomendado)

### Paso 1: Abrir el archivo .env.vercel

Abre el archivo `.env.vercel` en este proyecto. Contiene todas las variables listas.

### Paso 2: Ir a Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **`v0-psychology-website`**
3. Ve a: **Settings** > **Environment Variables**

### Paso 3: Agregar Variables

Para cada línea en `.env.vercel` (excepto comentarios):

1. Haz clic en **"Add New"**
2. **Key:** Copia el nombre de la variable (ej: `GOOGLE_CLIENT_ID`)
3. **Value:** Copia el valor (ej: `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com`)
4. **Environments:** Selecciona:
   - ✅ **Production**
   - ✅ **Preview**
5. Haz clic en **"Save"**

### Paso 4: Reemplazar SMTP_PASS

**⚠️ IMPORTANTE:** Para `SMTP_PASS`, reemplaza `REEMPLAZA_CON_TU_CONTRASEÑA_DE_APLICACIÓN_DE_GOOGLE` con tu contraseña de aplicación real de Google (16 caracteres).

---

## 📋 Variables en .env.vercel

El archivo contiene estas variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=REEMPLAZA_CON_TU_CONTRASEÑA_DE_APLICACIÓN_DE_GOOGLE

GOOGLE_CLIENT_ID=953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

NEXT_PUBLIC_BASE_URL=https://v0-psychology-website-ryco.vercel.app
GOOGLE_REDIRECT_URI=https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback
```

---

## ✅ Después de Importar

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último despliegue
3. Selecciona **"Redeploy"**
4. Espera 2-5 minutos

---

## 🔄 Actualizar .env.local Local

Si quieres usar estos valores localmente también:

```bash
# Copiar .env.vercel a .env.local
cp .env.vercel .env.local

# Luego edita .env.local y reemplaza SMTP_PASS con tu contraseña real
```

---

## 🆘 Problemas Comunes

### "No puedo editar .env.local"

El archivo `.env.local` está protegido por `.gitignore` (por seguridad). Puedes:
- Editar manualmente el archivo en tu editor
- O usar el comando: `cp .env.vercel .env.local`

### "Vercel CLI no funciona"

Usa la **Opción 2** (importar manualmente desde la interfaz web de Vercel).

