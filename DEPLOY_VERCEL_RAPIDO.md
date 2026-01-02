# 🚀 Despliegue Rápido en Vercel

## ✅ Tu proyecto ya está en GitHub

**Repositorio:** `https://github.com/Klorenn/v0-psychology-website.git`

---

## 📋 Paso 1: Ir a Vercel

1. Ve a: **https://vercel.com/new**
2. Inicia sesión con GitHub (recomendado) o crea una cuenta
3. Haz clic en **"Import Git Repository"**
4. Selecciona: **`Klorenn/v0-psychology-website`**

---

## 📋 Paso 2: Configurar Variables de Entorno

**ANTES de hacer clic en "Deploy"**, configura estas variables:

### Variables OBLIGATORIAS (SMTP):

En la sección "Environment Variables", agrega:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = ps.msanluis@gmail.com
SMTP_PASS = tu_contraseña_de_aplicación_de_16_caracteres
```

### Variables de Google Calendar (si las tienes):

```
GOOGLE_CLIENT_ID = 953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

**NOTA:** Las variables `NEXT_PUBLIC_BASE_URL` y `GOOGLE_REDIRECT_URI` las configurarás DESPUÉS del primer despliegue.

---

## 📋 Paso 3: Primer Despliegue

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos
3. Vercel te dará una URL como: `https://v0-psychology-website.vercel.app`
4. **¡COPIA ESTA URL!** La necesitarás en el siguiente paso

---

## 📋 Paso 4: Configurar URLs (DESPUÉS del primer despliegue)

1. Ve a tu proyecto en Vercel: **https://vercel.com/kl0rens-projects/v0-psychology-website**
2. Ve a **Settings** > **Environment Variables**
3. Agrega estas dos variables (reemplaza con tu URL real):

```
NEXT_PUBLIC_BASE_URL = https://tu-url-de-vercel.vercel.app
GOOGLE_REDIRECT_URI = https://tu-url-de-vercel.vercel.app/api/google-calendar/callback
```

4. Haz clic en **"Save"**
5. Ve a **Deployments**
6. Haz clic en los **3 puntos** del último despliegue
7. Selecciona **"Redeploy"** para aplicar los cambios

---

## 📋 Paso 5: Actualizar Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Abre tu OAuth 2.0 Client ID
3. En **"Authorized redirect URIs"**, agrega:

```
https://tu-url-de-vercel.vercel.app/api/google-calendar/callback
```

(Reemplaza con tu URL real de Vercel)

4. Haz clic en **"Save"**

---

## ✅ ¡Listo!

Ahora tienes:
- ✅ URL fija y estable
- ✅ HTTPS automático
- ✅ Sin necesidad de túneles
- ✅ Google Calendar funcionando

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas `git push`, Vercel desplegará automáticamente los cambios.

---

## 📝 Resumen de Variables en Vercel

Configura estas variables en Vercel (Settings > Environment Variables):

**Obligatorias:**
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_PORT` = 587
- `SMTP_USER` = ps.msanluis@gmail.com
- `SMTP_PASS` = tu_contraseña_de_aplicación

**Después del primer despliegue:**
- `NEXT_PUBLIC_BASE_URL` = https://tu-url-de-vercel.vercel.app
- `GOOGLE_REDIRECT_URI` = https://tu-url-de-vercel.vercel.app/api/google-calendar/callback

**Opcionales (Google Calendar):**
- `GOOGLE_CLIENT_ID` = 953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
- `GOOGLE_CLIENT_SECRET` = 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

---

## ⚠️ Nota sobre Archivos

Vercel tiene sistema de archivos de solo lectura. Los archivos en `/data` (citas, configuración, tokens) se perderán en cada despliegue.

**Para producción, considera:**
- Base de datos (Vercel Postgres, MongoDB) para citas y configuración
- Almacenamiento (Vercel Blob, AWS S3) para comprobantes

Por ahora, funciona para desarrollo y pruebas.

