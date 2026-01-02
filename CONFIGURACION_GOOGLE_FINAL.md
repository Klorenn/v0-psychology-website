# 🔐 Configuración Final de Google Cloud Console

## 🌐 Tu Nueva URL de Vercel

```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app
```

---

## 📋 Paso 1: Configurar Google Cloud Console

### 1.1. Ir a Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Inicia sesión con tu cuenta de Google (`ps.msanluis@gmail.com`)

### 1.2. Abrir tu OAuth 2.0 Client ID

- Busca tu cliente con este ID: `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com`
- Haz clic para abrirlo

### 1.3. Agregar URL de Redireccionamiento

1. En la sección **"Authorized redirect URIs"** (URIs de redireccionamiento autorizados)
2. Haz clic en **"+ ADD URI"** o el botón de agregar
3. Pega EXACTAMENTE esta URL:
   ```
   https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback
   ```
4. **IMPORTANTE:** 
   - Debe ser EXACTAMENTE igual (sin espacios, sin barra final)
   - Debe usar `https://` (no `http://`)
   - La ruta debe ser exactamente `/api/google-calendar/callback`
5. Haz clic en **"SAVE"** o **"Guardar"**

---

## 📋 Paso 2: Actualizar Variables de Entorno en Vercel

### 2.1. Ir al Dashboard de Vercel

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **`v0-psychology-website`**

### 2.2. Configurar Variables

1. Ve a **Settings** > **Environment Variables**
2. Agrega o actualiza estas variables:

| Nombre | Valor |
|--------|-------|
| `NEXT_PUBLIC_BASE_URL` | `https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app` |
| `GOOGLE_REDIRECT_URI` | `https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback` |

3. **Asegúrate de que estas variables también estén configuradas:**

| Nombre | Valor |
|--------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `ps.msanluis@gmail.com` |
| `SMTP_PASS` | `[Tu contraseña de aplicación de Google]` |
| `GOOGLE_CLIENT_ID` | `953104782981-abonftgsg034mckjn8qbnv4jqm1imosa.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |

4. Selecciona los entornos: **Production**, **Preview** (y opcionalmente **Development**)
5. Haz clic en **"Save"** después de cada variable

### 2.3. Redesplegar

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último despliegue
3. Selecciona **"Redeploy"**
4. Espera 2-5 minutos

---

## ✅ Paso 3: Verificar que Funciona

### 3.1. Verificar el Sitio

1. Ve a: **https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/**
2. Debería cargar sin errores

### 3.2. Verificar el Dashboard

1. Ve a: **https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/dashboard/login**
2. Inicia sesión con:
   - **Email:** `ps.msanluis@gmail.com`
   - **Contraseña:** `misakki12_`

### 3.3. Verificar Google Calendar

1. En el dashboard, ve a la pestaña **"Configuración del Sitio"**
2. Haz clic en **"Vincular con Google"**
3. Deberías ser redirigido a Google sin errores
4. Autoriza el acceso
5. Deberías ser redirigido de vuelta al dashboard con un mensaje de éxito

---

## 📝 Resumen de URLs

### URLs Principales

- **Sitio:** https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/
- **Dashboard:** https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/dashboard
- **Login:** https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/dashboard/login

### URLs de API

- **Google Callback:** https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback

---

## 🔐 Credenciales

- **Email del Dashboard:** `ps.msanluis@gmail.com`
- **Contraseña del Dashboard:** `misakki12_`

---

## ⚠️ Notas Importantes

1. **La URL puede cambiar** si Vercel genera una nueva. Si cambia, actualiza:
   - Google Cloud Console (Authorized redirect URIs)
   - Variables de entorno en Vercel (`NEXT_PUBLIC_BASE_URL` y `GOOGLE_REDIRECT_URI`)

2. **Para una URL permanente**, considera:
   - Agregar un dominio personalizado en Vercel
   - O usar la URL de producción de Vercel (si tienes una)

3. **SMTP_PASS** debe ser la **contraseña de aplicación** de Google (16 caracteres), NO tu contraseña de Gmail.

---

## 🆘 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** La URL en Google Cloud Console no coincide con la de Vercel.

**Solución:**
1. Verifica que la URL en Google Cloud Console sea EXACTAMENTE:
   ```
   https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback
   ```
2. Sin espacios, sin barra final, con `https://`

### Error: "Google Client ID no configurado"

**Solución:**
1. Verifica que `GOOGLE_CLIENT_ID` esté configurada en Vercel
2. Verifica que `GOOGLE_CLIENT_SECRET` esté configurada en Vercel
3. Haz redeploy después de agregar las variables

---

## ✅ Checklist Final

- [ ] URL agregada en Google Cloud Console
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Redeploy realizado en Vercel
- [ ] Sitio carga correctamente
- [ ] Login funciona
- [ ] Google Calendar se vincula correctamente

---

¡Listo! Tu sitio está configurado y funcionando. 🎉

