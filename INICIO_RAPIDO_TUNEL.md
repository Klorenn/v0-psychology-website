# 🚀 Inicio Rápido - Crear Túnel para Google Calendar

## Opción más rápida (2 minutos)

### Paso 1: Obtener authtoken de ngrok

1. Ve a: **https://dashboard.ngrok.com/**
2. Crea una cuenta (gratis) o inicia sesión
3. Ve a la sección **"Your Authtoken"**
4. Copia el token (algo como: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

### Paso 2: Configurar ngrok

Ejecuta en la terminal:

```bash
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

### Paso 3: Iniciar el túnel

Ejecuta:

```bash
./start-ngrok-auto.sh
```

Este script:
- ✅ Inicia ngrok automáticamente
- ✅ Obtiene la URL pública
- ✅ Actualiza `.env.local` con la nueva URL
- ✅ Te muestra qué actualizar en Google Cloud Console

### Paso 4: Actualizar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) > Credentials
2. Abre tu OAuth 2.0 Client ID
3. En "Authorized redirect URIs", agrega la URL que te mostró el script:
   - Ejemplo: `https://abc123.ngrok-free.app/api/google-calendar/callback`

### Paso 5: Reiniciar el servidor

```bash
npm run dev
```

### Paso 6: Probar la conexión

1. Ve a: `http://localhost:3000/dashboard/login`
2. Configuración del Sitio > Google Calendar
3. Haz clic en "Conectar con Google Calendar"

---

## Alternativa: Si no quieres crear cuenta de ngrok

Puedes usar **localtunnel** (gratis, sin registro):

```bash
npx localtunnel --port 3000
```

Pero ngrok es más estable y recomendado para OAuth.

