# Configuración del Túnel - Información Completa

## ✅ Túnel Activo

**URL del túnel:** `https://tangy-walls-grin.loca.lt`

**Estado:** El túnel está corriendo en background. Para detenerlo, ejecuta:
```bash
pkill -f localtunnel
```

---

## 📧 Paso 1: Configurar Contraseña de Aplicación de Google (SMTP)

Para que los correos se envíen automáticamente, necesitas una **contraseña de aplicación** de Google:

### Instrucciones:

1. **Ve a tu cuenta de Google:**
   - https://myaccount.google.com/

2. **Activa la verificación en 2 pasos** (si no la tienes):
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"

3. **Genera una contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - O busca "Contraseñas de aplicaciones" en tu cuenta
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe: "Sistema de Citas"
   - Haz clic en "Generar"
   - **Copia la contraseña de 16 caracteres** (ej: `abcd efgh ijkl mnop`)

4. **Actualiza `.env.local`:**
   ```bash
   # Abre .env.local y reemplaza esta línea:
   SMTP_PASS=tu_contraseña_de_aplicación_de_google
   
   # Por (sin espacios, todo junto):
   SMTP_PASS=abcdefghijklmnop
   ```

5. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C) y vuelve a iniciarlo:
   npm run dev
   ```

---

## 🔐 Paso 2: Configurar Google Cloud Console (OAuth para Google Calendar)

Para que Google Calendar funcione, necesitas configurar OAuth2:

### Instrucciones:

1. **Ve a Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Crea o selecciona un proyecto:**
   - Haz clic en el selector de proyectos (arriba)
   - Crea un nuevo proyecto o selecciona uno existente

3. **Habilita Google Calendar API:**
   - Ve a: https://console.cloud.google.com/apis/library
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

4. **Crea credenciales OAuth 2.0:**
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Haz clic en "Create Credentials" > "OAuth client ID"
   
   - **Si es la primera vez**, configura la pantalla de consentimiento:
     - Tipo: **External**
     - Nombre: "Sistema de Citas"
     - Email: `ps.msanluis@gmail.com`
     - Guarda y continúa
   
   - **Agrega scopes:**
     - `https://www.googleapis.com/auth/calendar`
     - Guarda y continúa
   
   - **Agrega usuarios de prueba:**
     - Agrega: `ps.msanluis@gmail.com`
     - Guarda y continúa
   
   - **Crea el OAuth client ID:**
     - Tipo: **Web application**
     - Nombre: "Sistema de Citas Web"
     - **Authorized redirect URIs:** (IMPORTANTE)
       ```
       https://tangy-walls-grin.loca.lt/api/google-calendar/callback
       ```
     - Haz clic en "Create"
   
   - **Copia las credenciales:**
     - **Client ID:** (ej: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
     - **Client Secret:** (ej: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

5. **Actualiza `.env.local`:**
   ```bash
   # Agrega estas líneas a .env.local:
   GOOGLE_CLIENT_ID=tu_client_id_aqui
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   ```

6. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

7. **Conecta Google Calendar desde el Dashboard:**
   - Ve a: http://localhost:3000/dashboard
   - Pestaña "Configuración del Sitio"
   - Sección "Google Calendar"
   - Haz clic en "Conectar con Google Calendar"
   - Autoriza la aplicación

---

## 📋 Resumen de Variables de Entorno

Tu archivo `.env.local` debe tener estas variables:

```env
# SMTP para correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicación_de_16_caracteres

# URL del túnel (ya configurado)
NEXT_PUBLIC_BASE_URL=https://tangy-walls-grin.loca.lt
GOOGLE_REDIRECT_URI=https://tangy-walls-grin.loca.lt/api/google-calendar/callback

# Google Calendar OAuth (agregar después de configurar Google Cloud)
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
```

---

## ⚠️ Notas Importantes

1. **El túnel cambia cada vez que lo reinicias:**
   - Si reinicias localtunnel, obtendrás una nueva URL
   - Deberás actualizar `.env.local` y Google Cloud Console con la nueva URL

2. **Para mantener la misma URL:**
   - No cierres la terminal donde corre localtunnel
   - O usa ngrok con un plan de pago para URL fija

3. **En producción:**
   - Usa tu dominio real (ej: `https://psmariasanluis.com`)
   - Actualiza `NEXT_PUBLIC_BASE_URL` y `GOOGLE_REDIRECT_URI`
   - Actualiza Google Cloud Console con la nueva URL

---

## ✅ Verificación

Una vez configurado todo:

1. **Prueba los correos:**
   - Crea una cita desde el frontend
   - Verifica que recibas el correo en `ps.msanluis@gmail.com`

2. **Prueba Google Calendar:**
   - Conecta desde el dashboard
   - Acepta una cita
   - Verifica que se cree el evento en tu Google Calendar

---

## 🆘 Problemas Comunes

### Los correos no se envían
- Verifica que `SMTP_PASS` sea la contraseña de aplicación (16 caracteres, sin espacios)
- Asegúrate de tener verificación en 2 pasos activada

### Google Calendar no se conecta
- Verifica que la URL en Google Cloud Console sea exactamente: `https://tangy-walls-grin.loca.lt/api/google-calendar/callback`
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Reinicia el servidor después de agregar las variables

### El túnel no funciona
- Verifica que el servidor esté corriendo en el puerto 3000
- Ejecuta: `lsof -ti:3000` para verificar
- Reinicia localtunnel si es necesario

