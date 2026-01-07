# 🔧 Solución de Problemas: Google Calendar OAuth

## ❌ Error: "no_code" o redirección a localhost:3000

### Causas comunes:

1. **La URI de redirección no coincide exactamente** entre Google Cloud Console y Vercel
2. **Falta `NEXT_PUBLIC_BASE_URL`** en las variables de entorno de Vercel
3. **El usuario canceló la autorización** en Google

---

## ✅ Solución Paso a Paso

### 1. Verificar Variables de Entorno en Vercel

Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**

Asegúrate de tener estas 3 variables configuradas:

```env
NEXT_PUBLIC_BASE_URL=https://psicoterapiamaria.online
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=https://psicoterapiamaria.online/api/google-calendar/callback
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_BASE_URL` debe ser exactamente `https://psicoterapiamaria.online` (sin `/` al final)
- `GOOGLE_REDIRECT_URI` debe ser exactamente `https://psicoterapiamaria.online/api/google-calendar/callback` (sin `/` al final)

### 2. Verificar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **"APIs y servicios"** → **"Credenciales"**
4. Haz clic en tu **ID de cliente OAuth**
5. En **"URIs de redirección autorizadas"**, verifica que tengas EXACTAMENTE:

```
https://psicoterapiamaria.online/api/google-calendar/callback
```

**⚠️ IMPORTANTE:**
- Debe empezar con `https://` (no `http://`)
- No debe terminar con `/`
- Debe ser exactamente esa URL, sin espacios antes o después
- Si tienes múltiples URIs, asegúrate de que esta esté en la lista

### 3. Redesplegar en Vercel

Después de agregar/actualizar las variables de entorno:

1. Ve a **Deployments** en Vercel
2. Haz clic en los **tres puntos** del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el despliegue

### 4. Probar de Nuevo

1. Ve a `https://psicoterapiamaria.online/dashboard`
2. Haz clic en **"Vincular con Google"**
3. Acepta los permisos en Google
4. Debería redirigir correctamente

---

## 🔍 Verificar Configuración

### Endpoint de Prueba

Visita este endpoint para ver tu configuración actual:

```
https://psicoterapiamaria.online/api/google-calendar/test
```

Esto te mostrará:
- Qué variables están configuradas
- Qué URI de redirección se está usando
- Qué deberías tener en Google Cloud Console

---

## 🐛 Errores Comunes y Soluciones

### Error: "redirect_uri_mismatch"

**Causa:** La URI en Google Cloud Console no coincide con la de Vercel.

**Solución:**
1. Copia exactamente esta URI: `https://psicoterapiamaria.online/api/google-calendar/callback`
2. Pégala en Google Cloud Console → Credenciales → Tu OAuth Client → URIs de redirección
3. Asegúrate de que no haya espacios ni `/` al final
4. Guarda los cambios
5. Redesplega en Vercel

### Error: Redirección a localhost:3000

**Causa:** `NEXT_PUBLIC_BASE_URL` no está configurado en Vercel.

**Solución:**
1. Agrega `NEXT_PUBLIC_BASE_URL=https://psicoterapiamaria.online` en Vercel
2. Redesplega el proyecto

### Error: "access_denied"

**Causa:** Tu email no está en la lista de usuarios de prueba.

**Solución:**
1. Ve a Google Cloud Console → Pantalla de consentimiento de OAuth
2. Agrega tu email a "Usuarios de prueba"
3. Intenta nuevamente

### Error: "no_code"

**Causa:** Google redirigió sin el código de autorización. Esto generalmente significa que la URI no coincide.

**Solución:**
1. Verifica que la URI en Google Cloud Console sea exactamente: `https://psicoterapiamaria.online/api/google-calendar/callback`
2. Verifica que `GOOGLE_REDIRECT_URI` en Vercel sea exactamente: `https://psicoterapiamaria.online/api/google-calendar/callback`
3. Asegúrate de que ambas coincidan EXACTAMENTE (carácter por carácter)
4. Redesplega en Vercel

---

## 📋 Checklist Final

Antes de probar, verifica:

- [ ] `NEXT_PUBLIC_BASE_URL` está configurado en Vercel: `https://psicoterapiamaria.online`
- [ ] `GOOGLE_CLIENT_ID` está configurado en Vercel
- [ ] `GOOGLE_CLIENT_SECRET` está configurado en Vercel
- [ ] `GOOGLE_REDIRECT_URI` está configurado en Vercel: `https://psicoterapiamaria.online/api/google-calendar/callback`
- [ ] En Google Cloud Console, la URI de redirección es: `https://psicoterapiamaria.online/api/google-calendar/callback`
- [ ] Ambas URIs coinciden EXACTAMENTE (sin espacios, sin `/` al final)
- [ ] El proyecto fue redesplegado en Vercel después de agregar las variables
- [ ] Tu email está en "Usuarios de prueba" en Google Cloud Console (si está en modo de prueba)

---

## 🔐 Verificar Logs en Vercel

Si aún no funciona, revisa los logs:

1. Ve a **Vercel Dashboard** → Tu proyecto → **Deployments**
2. Haz clic en el último deployment
3. Ve a la pestaña **"Functions"**
4. Busca logs que empiecen con `[OAuth]` o `[OAuth Callback]`
5. Estos logs te dirán exactamente qué URI se está usando y qué está recibiendo

---

## 💡 Tips

- **Siempre copia y pega** las URIs, no las escribas manualmente (para evitar espacios o caracteres incorrectos)
- **Las URIs son case-sensitive** - `https://` no es lo mismo que `HTTPS://`
- **No agregues `/` al final** - `https://psicoterapiamaria.online/api/google-calendar/callback/` es diferente a `https://psicoterapiamaria.online/api/google-calendar/callback`
- **Espera unos minutos** después de cambiar la configuración en Google Cloud Console antes de probar

---

¿Aún no funciona? Revisa los logs en Vercel y comparte el error específico que ves.

