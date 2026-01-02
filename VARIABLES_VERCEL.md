# 🔐 Variables de Entorno para Vercel

## 📋 Instrucciones Rápidas

1. Ve a tu proyecto en Vercel: **https://vercel.com/dashboard**
2. Selecciona: **`v0-psychology-website`**
3. Ve a: **Settings** > **Environment Variables**
4. Agrega cada variable una por una (copia y pega los valores exactos)
5. Haz clic en **"Save"** después de agregar todas
6. Ve a **Deployments** y haz **"Redeploy"** del último despliegue

---

## ✅ Variables OBLIGATORIAS

### 1. SMTP (Para enviar correos)

| Nombre | Valor |
|--------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `ps.msanluis@gmail.com` |
| `SMTP_PASS` | `[Tu contraseña de aplicación de Google - 16 caracteres]` |

**⚠️ IMPORTANTE:** `SMTP_PASS` debe ser la **contraseña de aplicación** de Google, NO la contraseña de tu cuenta Gmail. Si no la tienes, sigue las instrucciones en `CONFIGURACION_TUNEL.md` para generarla.

---

### 2. Google Calendar (Para sincronizar citas)

| Nombre | Valor |
|--------|-------|
| `GOOGLE_CLIENT_ID` | `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |

---

### 3. URLs (Después del primer despliegue)

| Nombre | Valor |
|--------|-------|
| `NEXT_PUBLIC_BASE_URL` | `https://v0-psychology-website-ryco.vercel.app` |
| `GOOGLE_REDIRECT_URI` | `https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback` |

---

## 📝 Lista Completa para Copiar y Pegar

### Paso 1: Agregar estas variables en Vercel

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=[TU_CONTRASEÑA_DE_APLICACIÓN_DE_GOOGLE]
GOOGLE_CLIENT_ID=953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_BASE_URL=https://v0-psychology-website-ryco.vercel.app
GOOGLE_REDIRECT_URI=https://v0-psychology-website-ryco.vercel.app/api/google-calendar/callback
```

---

## 🔍 Cómo Agregar Variables en Vercel

### Método 1: Desde la Interfaz Web

1. **Ir al Dashboard:**
   - Ve a: https://vercel.com/dashboard
   - Selecciona tu proyecto: `v0-psychology-website`

2. **Abrir Configuración:**
   - Haz clic en **"Settings"** (Configuración)
   - En el menú lateral, haz clic en **"Environment Variables"**

3. **Agregar Variables:**
   - Haz clic en **"Add New"** o **"Agregar nueva"**
   - En **"Key"** (Clave), pega el nombre de la variable (ej: `GOOGLE_CLIENT_ID`)
   - En **"Value"** (Valor), pega el valor correspondiente
   - Selecciona los **entornos** donde aplicará:
     - ✅ **Production** (Producción)
     - ✅ **Preview** (Vista previa)
     - ✅ **Development** (Desarrollo) - opcional
   - Haz clic en **"Save"**

4. **Repetir para cada variable:**
   - Agrega todas las variables de la lista de arriba, una por una

5. **Redesplegar:**
   - Ve a la pestaña **"Deployments"**
   - Haz clic en los **3 puntos** (⋯) del último despliegue
   - Selecciona **"Redeploy"**
   - Espera a que termine (2-5 minutos)

---

## ✅ Verificación

Después de configurar todas las variables y redesplegar:

1. **Verifica que el sitio funciona:**
   - Ve a: https://v0-psychology-website-ryco.vercel.app/
   - Debería cargar sin errores

2. **Verifica el dashboard:**
   - Ve a: https://v0-psychology-website-ryco.vercel.app/dashboard/login
   - Inicia sesión con: `ps.msanluis@gmail.com` / `misakki12_`

3. **Verifica Google Calendar:**
   - En el dashboard, ve a **"Configuración del Sitio"**
   - Haz clic en **"Vincular con Google"**
   - Deberías ser redirigido a Google sin errores

---

## 🆘 Solución de Problemas

### Error: "Google Client ID no configurado"

**Causa:** La variable `GOOGLE_CLIENT_ID` no está configurada o tiene un valor incorrecto.

**Solución:**
1. Ve a **Settings** > **Environment Variables** en Vercel
2. Verifica que `GOOGLE_CLIENT_ID` esté configurada con el valor exacto:
   ```
   953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com
   ```
3. Verifica que esté habilitada para **Production**
4. Haz **Redeploy** del último despliegue

### Error: "SMTP authentication failed"

**Causa:** `SMTP_PASS` no está configurada o es incorrecta.

**Solución:**
1. Verifica que `SMTP_PASS` sea la **contraseña de aplicación** de Google (16 caracteres)
2. NO uses tu contraseña de Gmail normal
3. Si no tienes una contraseña de aplicación, créala siguiendo las instrucciones en `CONFIGURACION_TUNEL.md`

### Las variables no se aplican después de agregarlas

**Solución:**
1. Después de agregar/modificar variables, SIEMPRE haz **Redeploy**
2. Ve a **Deployments** > **3 puntos** > **Redeploy**
3. Espera a que termine el despliegue

---

## 📚 Referencias

- **Dashboard de Vercel:** https://vercel.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Documentación de Vercel:** https://vercel.com/docs/environment-variables
