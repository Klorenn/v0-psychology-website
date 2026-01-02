# 🌐 URLs Finales del Proyecto

## ✅ URL de Producción en Vercel

```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app
```

---

## 📋 URLs Principales

### Página Principal
```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/
```

### Dashboard (Panel de Administración)
```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/dashboard
```

### Login del Dashboard
```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/dashboard/login
```

### URL de Callback de Google Calendar
```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback
```

---

## 🔐 Credenciales del Dashboard

- **Email:** `ps.msanluis@gmail.com`
- **Contraseña:** `misakki12_`

---

## ⚙️ Configuración Requerida

### 1. Google Cloud Console

**URL a agregar en "Authorized redirect URIs":**
```
https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback
```

**Pasos:**
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Abre tu OAuth 2.0 Client ID
3. Agrega la URL de arriba en "Authorized redirect URIs"
4. Guarda

### 2. Variables de Entorno en Vercel

**Variables a actualizar:**
- `NEXT_PUBLIC_BASE_URL` = `https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app`
- `GOOGLE_REDIRECT_URI` = `https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/api/google-calendar/callback`

**Pasos:**
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings > Environment Variables
4. Actualiza las variables de arriba
5. Haz Redeploy

---

## ✅ Verificación

1. ✅ Sitio carga: https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/
2. ✅ Login funciona: https://v0-psychology-website1-ko9i5hm0i-kl0rens-projects.vercel.app/dashboard/login
3. ✅ Google Calendar se vincula correctamente

---

## 📝 Nota

Si Vercel genera una nueva URL, actualiza:
- Google Cloud Console (Authorized redirect URIs)
- Variables de entorno en Vercel

