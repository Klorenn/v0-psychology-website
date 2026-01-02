# URLs de tu Sitio en Vercel

## 🌐 URLs Principales

### Página Principal
```
https://v0-psychology-website-ryco.vercel.app/
```

### Dashboard (Panel de Administración)
```
https://v0-psychology-website-ryco.vercel.app/dashboard
```

### Login del Dashboard
```
https://v0-psychology-website-ryco.vercel.app/dashboard/login
```

### URL de Callback de Google Calendar
```
https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback
```

---

## 🔐 Credenciales del Dashboard

- **Email:** `ps.msanluis@gmail.com`
- **Contraseña:** `misakki12_`

---

## 📋 Configuración de Google Cloud Console

### Paso 1: Ir a Google Cloud Console
1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Inicia sesión con tu cuenta de Google

### Paso 2: Abrir tu OAuth 2.0 Client ID
- Busca tu cliente con este ID: `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com`
- Haz clic para abrirlo

### Paso 3: Agregar URL de Redireccionamiento
1. En la sección **"Authorized redirect URIs"** (URIs de redireccionamiento autorizados)
2. Haz clic en **"+ ADD URI"** o el botón de agregar
3. Pega EXACTAMENTE esta URL:
   ```
   https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback
   ```
4. **IMPORTANTE:** 
   - Debe ser EXACTAMENTE igual (sin espacios, sin barra final)
   - Debe usar `https://` (no `http://`)
   - La ruta debe ser exactamente `/api/google-calendar/callback`
5. Haz clic en **"SAVE"** o **"Guardar"**

---

## ⚙️ Configurar Variables de Entorno en Vercel

### Paso 1: Ir al Dashboard de Vercel
1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **`v0-psychology-website`**

### Paso 2: Configurar Variables
1. Ve a **Settings** > **Environment Variables**
2. Agrega cada variable una por una (copia y pega los valores exactos):

#### Variables OBLIGATORIAS:

| Nombre | Valor |
|--------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `ps.msanluis@gmail.com` |
| `SMTP_PASS` | `[Tu contraseña de aplicación de Google - 16 caracteres]` |
| `GOOGLE_CLIENT_ID` | `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |
| `NEXT_PUBLIC_BASE_URL` | `https://v0-psychology-website-ryco.vercel.app` |
| `GOOGLE_REDIRECT_URI` | `https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback` |

**⚠️ IMPORTANTE:**
- `SMTP_PASS` debe ser la **contraseña de aplicación** de Google (16 caracteres), NO tu contraseña de Gmail
- Selecciona los entornos: **Production**, **Preview** (y opcionalmente **Development**)
- Haz clic en **"Save"** después de cada variable

3. Haz clic en **"Save"** después de agregar todas

### Paso 3: Redesplegar
1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último despliegue
3. Selecciona **"Redeploy"**
4. Espera a que termine (2-5 minutos)

**📝 Nota:** Si no tienes la contraseña de aplicación de Google (`SMTP_PASS`), consulta el archivo `CONFIGURACION_TUNEL.md` para generarla.

---

## ✅ Verificación

Después de configurar todo:

1. Ve al dashboard: **https://v0-psychology-website-ryco.vercel.app/dashboard/login**
2. Inicia sesión con tus credenciales
3. Ve a la pestaña **"Configuración del Sitio"**
4. Haz clic en **"Vincular con Google"**
5. Deberías ser redirigido a Google sin errores

---

## 📝 Resumen de URLs

- **Sitio:** https://v0-psychology-website-ryco.vercel.app/
- **Dashboard:** https://v0-psychology-website-ryco.vercel.app/dashboard
- **Login:** https://v0-psychology-website-ryco.vercel.app/dashboard/login
- **Google Callback:** https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback

