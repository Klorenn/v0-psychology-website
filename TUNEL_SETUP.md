# Configuración de Túnel para Desarrollo

Para exponer tu aplicación local a internet y poder probar Google Calendar OAuth, necesitas crear un túnel.

## Opción 1: ngrok (Recomendado - Más fácil)

### Configuración básica (Gratis - Dominio aleatorio)

1. **Crea una cuenta en ngrok** (si no tienes):
   - Ve a https://dashboard.ngrok.com/
   - Crea una cuenta gratuita
   - Copia tu **authtoken**

2. **Configura ngrok**:
   ```bash
   ngrok config add-authtoken TU_AUTHTOKEN
   ```

3. **Inicia el túnel**:
   ```bash
   ngrok http 3000
   ```

4. **Copia la URL HTTPS** que ngrok te da (ej: `https://abc123.ngrok-free.app`)

5. **Actualiza `.env.local`**:
   ```env
   GOOGLE_REDIRECT_URI=https://abc123.ngrok-free.app/api/google-calendar/callback
   NEXT_PUBLIC_BASE_URL=https://abc123.ngrok-free.app
   ```

6. **Actualiza Google Cloud Console**:
   - Ve a tu OAuth 2.0 Client ID
   - Agrega la URL a "Authorized redirect URIs":
     - `https://abc123.ngrok-free.app/api/google-calendar/callback`

### Configuración con dominio personalizado (Requiere plan de pago)

Si quieres usar `psmariasanluis.com`:

1. **Registra el dominio** `psmariasanluis.com` (si no lo tienes)

2. **Upgrade a plan de ngrok** que permita dominios personalizados

3. **Configura DNS**:
   - Crea un registro CNAME en tu proveedor DNS:
     - Nombre: `@` o `psmariasanluis.com`
     - Valor: `tunnel.ngrok.io`

4. **Inicia el túnel con dominio**:
   ```bash
   ngrok http 3000 --domain=psmariasanluis.com
   ```

5. **Actualiza `.env.local`**:
   ```env
   GOOGLE_REDIRECT_URI=https://psmariasanluis.com/api/google-calendar/callback
   NEXT_PUBLIC_BASE_URL=https://psmariasanluis.com
   ```

## Opción 2: Cloudflare Tunnel (Gratis - Permite dominio personalizado)

Si ya tienes el dominio `psmariasanluis.com` registrado:

1. **Instala cloudflared**:
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Autentica**:
   ```bash
   cloudflared tunnel login
   ```

3. **Crea un túnel**:
   ```bash
   cloudflared tunnel create psmariasanluis
   ```

4. **Configura el túnel**:
   ```bash
   cloudflared tunnel route dns psmariasanluis psmariasanluis.com
   ```

5. **Inicia el túnel**:
   ```bash
   cloudflared tunnel run psmariasanluis
   ```

## Recomendación

Para desarrollo rápido, usa **ngrok básico (gratis)**. Es más simple y funciona perfectamente para probar OAuth.

Para producción o si necesitas el dominio personalizado, usa **Cloudflare Tunnel** (gratis con dominio propio) o **ngrok con plan de pago**.

## Script de ayuda

He creado un script `start-tunnel.sh` que puedes usar:

```bash
./start-tunnel.sh 3000
```

