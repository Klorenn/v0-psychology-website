# Guía Completa de Configuración

Esta guía te ayudará a configurar todo el sistema desde cero.

## 📋 Tabla de Contenidos

1. [Configuración de Base de Datos](#configuración-de-base-de-datos)
2. [Configuración de Google Calendar](#configuración-de-google-calendar)
3. [Configuración de Resend](#configuración-de-resend)
4. [Configuración de Autenticación](#configuración-de-autenticación)
5. [Variables de Entorno](#variables-de-entorno)
6. [Verificación](#verificación)

## 🗄️ Configuración de Base de Datos

### Opción 1: Supabase (Recomendado)

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a SQL Editor
4. Ejecuta los siguientes scripts en orden:

#### Script 1: Tablas principales
```sql
-- Ejecuta init-database.sql
```

#### Script 2: Rating para reseñas
```sql
-- Ejecuta add-rating-column.sql
```

#### Script 3: Estado "atendido"
```sql
-- Ejecuta add-attended-status.sql
```

#### Script 4: Campos de Google Calendar
```sql
-- Ejecuta add-calendar-fields.sql
```

5. Obtén tus credenciales:
   - Ve a Settings → API
   - Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copia `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copia `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Opción 2: PostgreSQL Local

Si prefieres usar PostgreSQL local, adapta los scripts SQL a tu esquema.

## 📅 Configuración de Google Calendar

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Calendar:
   - Ve a "APIs & Services" → "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

### Paso 2: Crear Credenciales OAuth 2.0

1. Ve a "APIs & Services" → "Credentials"
2. Haz clic en "Create Credentials" → "OAuth client ID"
3. Selecciona "Web application"
4. Configura:
   - **Name**: "Psychology Website Calendar"
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/google-calendar/callback` (desarrollo)
     - `https://tu-dominio.com/api/google-calendar/callback` (producción)
5. Guarda el **Client ID** y **Client Secret**

### Paso 3: Configurar OAuth Consent Screen

1. Ve a "APIs & Services" → "OAuth consent screen"
2. Selecciona "External" (o "Internal" si usas Google Workspace)
3. Completa:
   - App name: "Psychology Website"
   - User support email: Tu email
   - Developer contact: Tu email
4. Agrega scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Si está en modo "Testing":
   - Ve a "Test users"
   - Agrega el email que usarás para autenticar (ej: `ps.mariasanluis@gmail.com`)

### Paso 4: Conectar Google Calendar

1. Inicia tu aplicación: `npm run dev`
2. Ve a `/dashboard`
3. Ve a "Configuración del Sitio" → "Google Calendar"
4. Haz clic en "Conectar Google Calendar"
5. Autoriza la aplicación
6. ¡Listo! El sistema está conectado

## 📧 Configuración de Resend

### Paso 1: Crear Cuenta

1. Ve a [Resend](https://resend.com)
2. Crea una cuenta gratuita
3. Obtén tu API Key:
   - Ve a "API Keys"
   - Crea un nuevo API Key
   - Copia el key (empieza con `re_`)

### Paso 2: Configurar Email Remitente

#### Opción A: Modo Sandbox (Desarrollo)

1. Usa `onboarding@resend.dev` como remitente
2. Ve a "Emails" → "Test Emails"
3. Agrega los emails de prueba que recibirán correos
4. Verifica cada email desde el correo recibido

#### Opción B: Dominio Verificado (Producción)

1. Ve a "Domains"
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones
4. Espera la verificación (puede tardar hasta 24 horas)
5. Usa `noreply@tu-dominio.com` como remitente

### Paso 3: Configurar Variables

```env
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=onboarding@resend.dev  # Sandbox
# O
EMAIL_FROM=noreply@tu-dominio.com  # Producción
```

## 🔐 Configuración de Autenticación

### Paso 1: Configurar Credenciales de Admin

```env
ADMIN_EMAIL=tu_email@ejemplo.com
ADMIN_PASSWORD=tu_password_seguro_minimo_12_caracteres
```

### Paso 2: Generar JWT Secret

```bash
# Genera un secret seguro
openssl rand -base64 32
```

O usa cualquier generador de strings aleatorios. Debe ser:
- Mínimo 32 caracteres
- Aleatorio y único
- No compartirlo públicamente

```env
JWT_SECRET=tu_secret_generado_aqui
```

## 🔧 Variables de Entorno Completas

Crea un archivo `.env.local` con todas las variables:

```env
# ============================================
# BASE DE DATOS (Supabase)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# ============================================
# AUTENTICACIÓN
# ============================================
ADMIN_EMAIL=tu_email@ejemplo.com
ADMIN_PASSWORD=tu_password_seguro
JWT_SECRET=tu_jwt_secret_muy_seguro_minimo_32_caracteres

# ============================================
# GOOGLE CALENDAR (OAuth 2.0)
# ============================================
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
GOOGLE_CALENDAR_EMAIL=tu_email@gmail.com  # Email del calendario a usar

# ============================================
# RESEND (Emails)
# ============================================
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=onboarding@resend.dev  # Sandbox
# EMAIL_FROM=noreply@tu-dominio.com  # Producción
RECIPIENT_EMAIL=tu_email@ejemplo.com  # Email que recibe notificaciones

# ============================================
# OPCIONAL
# ============================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Solo si usas localtunnel
NEXT_PUBLIC_CONTACT_EMAIL=tu_email@ejemplo.com
```

## ✅ Verificación

### 1. Verificar Base de Datos

```bash
# Visita en el navegador
http://localhost:3000/api/test-supabase
```

Deberías ver: `"success": true`

### 2. Verificar Autenticación

1. Ve a `/dashboard`
2. Inicia sesión con tus credenciales
3. Deberías ver el dashboard

### 3. Verificar Google Calendar

1. En el dashboard, ve a "Configuración del Sitio"
2. Busca la sección de Google Calendar
3. Haz clic en "Conectar Google Calendar"
4. Autoriza y verifica que se conecte

### 4. Verificar Resend

1. Crea una cita de prueba presencial:
   ```
   http://localhost:3000/api/test/create-presencial-test
   ```
2. Revisa los logs del servidor
3. Si usas sandbox, verifica que el email esté en "Test Emails" de Resend
4. Revisa el inbox del email de prueba

## 🐛 Solución de Problemas

### Google Calendar no se conecta

- Verifica que las URIs de redirección estén correctas
- Si está en modo Testing, agrega tu email a "Test users"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos

### Emails no llegan (Resend)

- Verifica que `RESEND_API_KEY` sea correcto
- Si usas sandbox, verifica el email en "Test Emails"
- Revisa los logs del servidor para ver errores específicos
- Verifica que `EMAIL_FROM` esté configurado

### Error de autenticación

- Verifica que `JWT_SECRET` tenga al menos 32 caracteres
- Verifica que `ADMIN_EMAIL` y `ADMIN_PASSWORD` sean correctos
- Limpia cookies del navegador

### Base de datos no conecta

- Verifica las credenciales de Supabase
- Verifica que las tablas existan (ejecuta los scripts SQL)
- Revisa los logs del servidor

## 📚 Recursos Adicionales

- [Documentación de Google Calendar API](https://developers.google.com/calendar/api)
- [Documentación de Resend](https://resend.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)

