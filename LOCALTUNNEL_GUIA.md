# 🚀 Guía Rápida - Localtunnel

## Pasos para crear el túnel

### 1. Asegúrate de que tu servidor esté corriendo

En una terminal, ejecuta:
```bash
npm run dev
```

### 2. Inicia localtunnel (en otra terminal)

```bash
./start-localtunnel-simple.sh
```

O directamente:
```bash
npx localtunnel --port 3000
```

### 3. Copia la URL que aparece

Verás algo como:
```
your url is: https://abc123def456.loca.lt
```

### 4. Actualiza .env.local con esa URL

Ejecuta:
```bash
./update-env-with-url.sh https://abc123def456.loca.lt
```

O manualmente edita `.env.local`:
```env
GOOGLE_REDIRECT_URI=https://abc123def456.loca.lt/api/google-calendar/callback
NEXT_PUBLIC_BASE_URL=https://abc123def456.loca.lt
```

### 5. Actualiza Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Abre tu OAuth 2.0 Client ID
3. En "Authorized redirect URIs", agrega:
   ```
   https://abc123def456.loca.lt/api/google-calendar/callback
   ```
4. Guarda los cambios

### 6. Reinicia tu servidor (si es necesario)

```bash
npm run dev
```

### 7. Prueba la conexión

1. Ve a: `http://localhost:3000/dashboard/login`
2. Configuración del Sitio > Google Calendar
3. Haz clic en "Conectar con Google Calendar"

## ⚠️ Notas importantes

- **La URL de localtunnel cambia cada vez** que lo reinicias
- Si reinicias localtunnel, debes actualizar `.env.local` y Google Cloud Console de nuevo
- Localtunnel es gratuito pero puede ser más lento que ngrok
- Para producción, considera usar ngrok con dominio fijo o Cloudflare Tunnel

## 🔄 Si necesitas reiniciar

1. Detén localtunnel (Ctrl+C)
2. Ejecuta `./start-localtunnel-simple.sh` de nuevo
3. Copia la nueva URL
4. Ejecuta `./update-env-with-url.sh NUEVA_URL`
5. Actualiza Google Cloud Console con la nueva URL

