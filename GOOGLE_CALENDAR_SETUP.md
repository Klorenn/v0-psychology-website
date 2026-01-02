# Configuración de Google Calendar

Esta guía explica cómo configurar la integración con Google Calendar para que las citas se sincronicen automáticamente.

## Pasos para Configurar

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el nombre del proyecto

### 2. Habilitar Google Calendar API

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Google Calendar API"
3. Haz clic en **Enable**

### 3. Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo de usuario: **External**
   - Nombre de la app: "Sistema de Citas"
   - Email de soporte: tu email
   - Dominios autorizados: tu dominio (o deja en blanco para desarrollo)
   - Guarda y continúa
4. Agrega scopes:
   - `https://www.googleapis.com/auth/calendar`
   - Guarda y continúa
5. Agrega usuarios de prueba (tu email de Google)
6. Crea el OAuth client ID:
   - Tipo de aplicación: **Web application**
   - Nombre: "Sistema de Citas Web"
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/google-calendar/callback` (desarrollo)
     - `https://tu-dominio.com/api/google-calendar/callback` (producción)
   - Haz clic en **Create**
7. **IMPORTANTE**: Copia el **Client ID** y **Client Secret**

### 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Google Calendar OAuth2
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
# En producción, usa: https://tu-dominio.com/api/google-calendar/callback
```

### 5. Conectar desde el Dashboard

1. Inicia sesión en el dashboard (`/dashboard/login`)
2. Ve a la pestaña **Configuración del Sitio**
3. En la sección **Google Calendar**, haz clic en **Conectar con Google Calendar**
4. Serás redirigido a Google para autorizar la aplicación
5. Selecciona la cuenta de Google que quieres usar
6. Acepta los permisos solicitados
7. Serás redirigido de vuelta al dashboard con la conexión establecida

## Funcionalidades

Una vez conectado, el sistema:

- ✅ **Crea eventos automáticamente** cuando aceptas una cita desde el correo o el dashboard
- ✅ **Sincroniza horarios disponibles** con tu calendario de Google (oculta horarios ocupados)
- ✅ **Incluye información del paciente** en cada evento (nombre, email, teléfono, motivo)
- ✅ **Configura recordatorios** (1 día antes por email, 1 hora antes por popup)

## Desconectar Google Calendar

Si deseas desconectar Google Calendar:

1. Ve al dashboard > Configuración del Sitio
2. En la sección Google Calendar, haz clic en **Desconectar Google Calendar**
3. Confirma la acción

**Nota**: Al desconectar, las citas futuras no se crearán automáticamente en tu calendario, pero las citas ya creadas permanecerán.

## Solución de Problemas

### Error: "Google Calendar no está configurado"

- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén configurados en `.env.local`
- Reinicia el servidor después de agregar las variables

### Error: "No se recibió el código de autorización"

- Verifica que `GOOGLE_REDIRECT_URI` coincida exactamente con la URL configurada en Google Cloud Console
- Asegúrate de que la URL de redirección esté en la lista de "Authorized redirect URIs"

### Error: "Error al intercambiar el código de autorización"

- Verifica que el Client Secret sea correcto
- Asegúrate de que la API de Google Calendar esté habilitada
- Verifica que el proyecto de Google Cloud esté activo

### Los eventos no se crean en Google Calendar

- Verifica que la conexión esté activa en el dashboard
- Revisa los logs del servidor para ver errores
- Asegúrate de que el calendario tenga permisos de escritura

## Seguridad

- Los tokens de acceso se almacenan de forma segura en el servidor
- Los tokens se refrescan automáticamente cuando expiran
- Los tokens nunca se exponen al cliente
- El archivo de tokens está en `.gitignore` y no se sube al repositorio

