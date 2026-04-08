# 🔧 Solución: Error de Redirección a localhost

## ❌ Problema
Google está redirigiendo a `localhost:3000` en lugar de a `psmariasanluis.com`

## ✅ Solución Rápida

### Paso 1: Verificar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **"APIs y servicios"** → **"Credenciales"**
4. Haz clic en tu **ID de cliente OAuth 2.0**
5. En **"URIs de redirección autorizadas"**, verifica que:
   - ✅ Tengas: `https://psmariasanluis.com/api/google-calendar/callback`
   - ❌ NO tengas: `http://localhost:3000/api/google-calendar/callback` (elimínala si está)
   - ❌ NO tengas ninguna otra URI de localhost

**⚠️ IMPORTANTE:** Si tienes múltiples URIs, Google puede elegir la incorrecta. Es mejor tener SOLO la de producción.

### Paso 2: Verificar Variables en Vercel

Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**

Asegúrate de tener estas variables:

```env
NEXT_PUBLIC_BASE_URL=https://psmariasanluis.com
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=https://psmariasanluis.com/api/google-calendar/callback
```

**Verifica que:**
- `NEXT_PUBLIC_BASE_URL` sea exactamente `https://psmariasanluis.com` (sin `/` al final)
- `GOOGLE_REDIRECT_URI` sea exactamente `https://psmariasanluis.com/api/google-calendar/callback` (sin `/` al final)

### Paso 3: Eliminar URI de localhost en Google Cloud Console

Si tienes `http://localhost:3000/api/google-calendar/callback` en Google Cloud Console:

1. Haz clic en el **ícono de papelera** al lado de esa URI
2. Guarda los cambios
3. Deja SOLO: `https://psmariasanluis.com/api/google-calendar/callback`

### Paso 4: Redesplegar en Vercel

1. Ve a **Deployments** en Vercel
2. Haz clic en los **tres puntos** del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine

### Paso 5: Probar de Nuevo

1. Ve a `https://psmariasanluis.com/dashboard`
2. Haz clic en **"Vincular con Google"**
3. Acepta los permisos
4. Ahora debería redirigir correctamente a `psmariasanluis.com` en lugar de `localhost`

---

## 🔍 Verificar Configuración

Visita este endpoint para ver qué está configurado:
```
https://psmariasanluis.com/api/google-calendar/test
```

Esto te mostrará:
- Qué `redirectUri` se está usando
- Qué variables están configuradas
- Qué deberías tener en Google Cloud Console

---

## ⚠️ Si Aún No Funciona

### Verificar Logs en Vercel

1. Ve a **Vercel Dashboard** → Tu proyecto → **Deployments**
2. Haz clic en el último deployment
3. Ve a la pestaña **"Functions"**
4. Busca logs que empiecen con `[OAuth]`
5. Verifica qué `Redirect URI` se está usando

### Verificar que las URIs Coincidan

En los logs de Vercel, deberías ver:
```
[OAuth]   Redirect URI: https://psmariasanluis.com/api/google-calendar/callback
```

Si ves `localhost`, significa que `GOOGLE_REDIRECT_URI` no está configurado en Vercel.

---

## 📋 Checklist Final

- [ ] En Google Cloud Console, SOLO tienes: `https://psmariasanluis.com/api/google-calendar/callback`
- [ ] NO tienes ninguna URI de localhost en Google Cloud Console
- [ ] `NEXT_PUBLIC_BASE_URL` está configurado en Vercel: `https://psmariasanluis.com`
- [ ] `GOOGLE_REDIRECT_URI` está configurado en Vercel: `https://psmariasanluis.com/api/google-calendar/callback`
- [ ] El proyecto fue redesplegado en Vercel
- [ ] Los logs en Vercel muestran la URI correcta (no localhost)

---

## 💡 Por Qué Pasa Esto

Google OAuth usa la URI de redirección que está registrada en Google Cloud Console. Si tienes múltiples URIs registradas, Google puede elegir cualquiera de ellas. Por eso es importante tener SOLO la URI de producción.

Además, el código ahora valida que no se use localhost en producción y te dará un error claro si falta la configuración.

