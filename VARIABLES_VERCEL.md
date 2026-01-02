# Variables de Entorno para Vercel

## 📋 Lista Completa de Variables

Copia y pega estas variables en Vercel (Settings > Environment Variables):

### 🔴 OBLIGATORIAS (para que funcione básico)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación_de_16_caracteres
```

### 🟡 CONFIGURAR DESPUÉS DEL PRIMER DESPLIEGUE

**IMPORTANTE:** Configura estas DESPUÉS de obtener tu URL de Vercel:

```
NEXT_PUBLIC_BASE_URL=https://tu-proyecto.vercel.app
GOOGLE_REDIRECT_URI=https://tu-proyecto.vercel.app/api/google-calendar/callback
```

(Reemplaza `tu-proyecto.vercel.app` con tu URL real de Vercel)

### 🟢 OPCIONALES (para Google Calendar)

```
GOOGLE_CLIENT_ID=953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

---

## 📝 Instrucciones Paso a Paso

### Paso 1: Primer Despliegue

1. Ve a https://vercel.com/new
2. Conecta tu repositorio
3. Configura SOLO las variables obligatorias (SMTP)
4. Haz clic en "Deploy"
5. Espera a que termine
6. **Copia la URL que te da Vercel** (ej: `https://v0-psychology-website.vercel.app`)

### Paso 2: Configurar URLs

1. Ve a Settings > Environment Variables
2. Agrega:
   - `NEXT_PUBLIC_BASE_URL` = tu URL de Vercel
   - `GOOGLE_REDIRECT_URI` = tu URL de Vercel + `/api/google-calendar/callback`
3. Agrega las variables de Google Calendar (si las tienes)
4. Haz clic en "Save"
5. Ve a Deployments > 3 puntos del último > "Redeploy"

### Paso 3: Actualizar Google Cloud Console

1. Ve a https://console.cloud.google.com/apis/credentials
2. Abre tu OAuth 2.0 Client ID
3. En "Authorized redirect URIs", agrega:
   ```
   https://tu-proyecto.vercel.app/api/google-calendar/callback
   ```
4. Guarda

---

## ✅ Verificación

Después de configurar todo:

1. Ve a tu URL de Vercel
2. Prueba el dashboard: `/dashboard/login`
3. Prueba vincular Google Calendar

---

## ⚠️ Nota Importante sobre Archivos

Vercel tiene sistema de archivos de solo lectura. Los archivos en `/data` se perderán en cada despliegue.

**Solución temporal:** Funciona para desarrollo, pero para producción considera:
- Base de datos (Vercel Postgres, MongoDB)
- Almacenamiento (Vercel Blob, AWS S3) para comprobantes

