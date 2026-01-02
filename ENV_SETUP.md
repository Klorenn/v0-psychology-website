# 🔐 Configuración de Variables de Entorno

Esta guía te ayudará a configurar todas las variables de entorno necesarias para que el proyecto funcione correctamente.

## 📋 Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# ===================================
# 🗄️ Supabase Database (PostgreSQL)
# ===================================
# Estas variables se obtienen automáticamente cuando conectas Supabase en Vercel
# O puedes obtenerlas desde: https://supabase.com/dashboard/project/[tu-proyecto]/settings/api
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
POSTGRES_DATABASE=postgres
POSTGRES_HOST=db.[tu-proyecto].supabase.co
POSTGRES_PASSWORD=tu_password
POSTGRES_PRISMA_URL=postgres://postgres.[proyecto]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL=postgres://postgres.[proyecto]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.[proyecto]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres
SUPABASE_JWT_SECRET=...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://[tu-proyecto].supabase.co

# ===================================
# 📧 SMTP Configuration (Nodemailer)
# ===================================
# Para enviar correos electrónicos de confirmación
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_aqui

# ===================================
# 🌐 Base URL
# ===================================
# En desarrollo: http://localhost:3000
# En producción: https://tu-dominio.vercel.app
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app

# ===================================
# 📅 Google Calendar OAuth2
# ===================================
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/api/google-calendar/callback

# ===================================
# 💳 Flow Payment Gateway (Chile)
# ===================================
FLOW_API_KEY=tu_flow_api_key
FLOW_SECRET_KEY=tu_flow_secret_key
FLOW_ENVIRONMENT=sandbox

# 💳 Transbank Webpay Plus (Chile)
# ===================================
TRANSBANK_COMMERCE_CODE=tu_commerce_code
TRANSBANK_API_KEY=tu_api_key
TRANSBANK_ENVIRONMENT=integration

# ===================================
# 🔐 Dashboard Admin
# ===================================
NEXT_PUBLIC_ADMIN_EMAIL=ps.msanluis@gmail.com
NEXT_PUBLIC_ADMIN_PASSWORD=misakki12_

# ===================================
# 📧 Email Configuration
# ===================================
RECIPIENT_EMAIL=tu-email@ejemplo.com
NEXT_PUBLIC_CONTACT_EMAIL=tu-email@ejemplo.com
```

---

## 🗄️ 1. Configuración de Supabase (Base de Datos)

### Opción A: Conectar Supabase desde Vercel (Recomendado)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/)
2. Ve a **Settings** → **Storage**
3. Haz clic en **"Create Database"** o **"Connect Database"**
4. Selecciona **Supabase**
5. Sigue las instrucciones para crear o conectar tu proyecto de Supabase
6. Vercel automáticamente agregará todas las variables de entorno necesarias

### Opción B: Configuración Manual

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings** → **API**
4. Copia las siguientes variables:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Ve a **Settings** → **Database** → **Connection string**
6. Copia la **Connection string** (URI) y úsala para:
   - `POSTGRES_URL` (usar la versión con pooler)
   - `POSTGRES_URL_NON_POOLING` (usar la versión sin pooler)

### Inicializar las Tablas

Después de configurar Supabase, necesitas crear las tablas:

**Opción 1: Automática (Recomendada)**
1. Ve al dashboard de tu aplicación: `https://tu-dominio.vercel.app/dashboard`
2. Si no hay citas, verás un botón **"Inicializar Base de Datos"**
3. Haz clic en el botón para crear las tablas automáticamente

**Opción 2: Manual (SQL Editor)**
1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Ejecuta el script de inicialización (ver `lib/db.ts` función `initializeDatabase()`)

**Opción 3: Endpoint API**
```bash
# Visita en tu navegador o con curl:
https://tu-dominio.vercel.app/api/db/init
```

### Variables Importantes:
- `POSTGRES_URL`: Usada para conexiones con pooler (recomendada para producción)
- `POSTGRES_URL_NON_POOLING`: Usada para operaciones que requieren conexión directa
- El código automáticamente usa `POSTGRES_URL` si está disponible, o `POSTGRES_URL_NON_POOLING` como fallback

---

## 📧 2. Configuración de SMTP (Gmail)

### Paso 1: Habilitar autenticación de 2 pasos
1. Ve a [myaccount.google.com](https://myaccount.google.com/)
2. Seguridad → Verificación en dos pasos → Activar

### Paso 2: Crear contraseña de aplicación
1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Escribe "Psychology Website" y haz clic en "Generar"
4. Copia la contraseña de 16 caracteres
5. Pégala en `SMTP_PASS`

### Variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ps.msanluis@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Contraseña de aplicación (sin espacios)
```

---

## 📅 3. Configuración de Google Calendar

### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [console.cloud.google.com](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre: "Psychology Website"

### Paso 2: Habilitar Google Calendar API
1. En el menú lateral → "APIs y servicios" → "Biblioteca"
2. Busca "Google Calendar API"
3. Haz clic en "Habilitar"

### Paso 3: Crear credenciales OAuth 2.0
1. "APIs y servicios" → "Credenciales"
2. "+ CREAR CREDENCIALES" → "ID de cliente de OAuth"
3. Tipo de aplicación: **Aplicación web**
4. Nombre: "Psychology Website OAuth"
5. **URIs de redireccionamiento autorizados:**
   ```
   https://tu-dominio.vercel.app/api/google-calendar/callback
   ```
6. Haz clic en "Crear"
7. Copia el **ID de cliente** y el **Secreto del cliente**

### Paso 4: Configurar pantalla de consentimiento
1. "APIs y servicios" → "Pantalla de consentimiento de OAuth"
2. Tipo de usuario: **Externo**
3. Información de la aplicación:
   - Nombre: "Psychology Website"
   - Correo de asistencia: tu email
4. Ámbitos: Agregar `https://www.googleapis.com/auth/calendar`
5. **Usuarios de prueba:** Agregar `ps.msanluis@gmail.com`

### Variables:
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/api/google-calendar/callback
```

---

## 💳 4. Configuración de Flow (Pagos)

### Paso 1: Crear cuenta en Flow
1. **Sandbox (Pruebas):** [sandbox.flow.cl](https://sandbox.flow.cl/)
2. **Producción:** [flow.cl](https://www.flow.cl/)

### Paso 2: Obtener credenciales
1. Inicia sesión en Flow
2. Ve a "Mis Datos" → "Integraciones"
3. Copia tu **API Key** y **Secret Key**

### Paso 3: Configurar Webhook
1. En el panel de Flow, ve a "Configuración" → "Webhooks"
2. Agrega la URL: `https://tu-dominio.vercel.app/api/flow/webhook`
3. Selecciona eventos: "Pago aprobado", "Pago rechazado"

### Variables:
```env
# Para pruebas (sandbox)
FLOW_API_KEY=tu_sandbox_api_key
FLOW_SECRET_KEY=tu_sandbox_secret_key
FLOW_ENVIRONMENT=sandbox

# Para producción
FLOW_API_KEY=tu_production_api_key
FLOW_SECRET_KEY=tu_production_secret_key
FLOW_ENVIRONMENT=production
```

---

## 💳 5. Configuración de Transbank Webpay Plus (Pagos)

### Paso 1: Contratar Webpay Plus
1. Si ya eres cliente: [Portal de Clientes Transbank](https://www.transbank.cl/)
2. Si no eres cliente: [Contratar Webpay Plus](https://publico.transbank.cl/productos-y-servicios/soluciones-para-ventas-internet/webpay-plus)

### Paso 2: Obtener credenciales
1. Una vez contratado, recibirás un **Código de Comercio** único
2. Para el ambiente de integración (pruebas):
   - **Commerce Code:** `597055555532`
   - **API Key:** `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C`
3. Para producción, recibirás tus credenciales después de validar la integración

### Paso 3: Tarjetas de prueba
Para probar en ambiente de integración:
- **Tarjeta aprobada:** VISA `4051 8856 0044 6623`, CVV `123`, fecha futura
- **RUT autenticación:** `11.111.111-1`, clave `123`

### Variables:
```env
# Para pruebas (integration)
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TRANSBANK_ENVIRONMENT=integration

# Para producción (después de validación)
TRANSBANK_COMMERCE_CODE=tu_commerce_code_produccion
TRANSBANK_API_KEY=tu_api_key_produccion
TRANSBANK_ENVIRONMENT=production
```

---

## 🚀 6. Configurar en Vercel

### Paso 1: Ir a configuración del proyecto
1. Ve a [vercel.com](https://vercel.com/)
2. Selecciona tu proyecto
3. Settings → Environment Variables

### Paso 2: Agregar variables
Agrega cada variable una por una:
- **Key:** Nombre de la variable (ej: `SMTP_HOST`)
- **Value:** Valor de la variable
- **Environment:** Selecciona "Production", "Preview" y "Development"

### Paso 3: Redesplegar
Después de agregar todas las variables:
1. Ve a "Deployments"
2. Haz clic en los tres puntos del último deployment
3. "Redeploy"

---

## ✅ Verificación

### 1. Verificar Supabase
```bash
# Visita el dashboard y verifica que las citas se carguen correctamente
# O visita directamente:
https://tu-dominio.vercel.app/api/db/init
# Deberías ver: {"success": true, "message": "Base de datos inicializada correctamente"}
```

### 2. Verificar SMTP
```bash
# En el dashboard, intenta confirmar una cita
# Deberías recibir un email
```

### 3. Verificar Google Calendar
```bash
# En el dashboard → Configuración del Sitio
# Haz clic en "Vincular con Google"
# Deberías poder conectar sin errores
```

### 4. Verificar Flow
```bash
# En la página principal, intenta hacer una reserva
# Selecciona "Flow" como método de pago
# Deberías ser redirigido al checkout de Flow
```

### 5. Verificar Transbank Webpay Plus
```bash
# En la página principal, intenta hacer una reserva
# Selecciona "Webpay Plus" como método de pago
# Deberías ser redirigido al checkout de Transbank
```

---

## 🔍 Troubleshooting

### Error: "POSTGRES_URL no está configurado" o "No hay conexión a base de datos"
- Verifica que `POSTGRES_URL` o `POSTGRES_URL_NON_POOLING` estén configuradas en Vercel
- Si conectaste Supabase desde Vercel, las variables deberían agregarse automáticamente
- Asegúrate de que la URL de conexión sea correcta (debe incluir `sslmode=require`)
- Visita `/api/db/init` para inicializar las tablas si no existen

### Error: "SMTP no configurado"
- Verifica que `SMTP_PASS` sea la contraseña de aplicación (16 caracteres)
- Asegúrate de que la autenticación de 2 pasos esté habilitada

### Error: "redirect_uri_mismatch" (Google Calendar)
- Verifica que `GOOGLE_REDIRECT_URI` coincida exactamente con la URI configurada en Google Cloud Console
- Debe incluir `https://` y no tener `/` al final

### Error: "Flow no configurado"
- Verifica que `FLOW_API_KEY` y `FLOW_SECRET_KEY` estén correctamente configuradas
- Asegúrate de usar las credenciales correctas (sandbox o producción)

### Error: "Transbank no configurado"
- Verifica que `TRANSBANK_COMMERCE_CODE` y `TRANSBANK_API_KEY` estén correctamente configuradas
- Asegúrate de usar las credenciales correctas (integration o production)

### Error: "access_denied" (Google Calendar)
- Agrega tu email como usuario de prueba en Google Cloud Console
- Pantalla de consentimiento → Usuarios de prueba → Agregar usuario

---

## 📝 Notas Importantes

1. **Nunca** subas el archivo `.env.local` a GitHub
2. Las contraseñas de aplicación de Gmail son de **16 caracteres sin espacios**
3. Para Google Calendar, debes estar en la lista de **usuarios de prueba**
4. Flow tiene ambientes separados: **sandbox** (pruebas) y **production**
5. Después de cambiar variables en Vercel, **redesplega** el proyecto

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las variables estén configuradas
2. Revisa los logs en Vercel: Deployments → Ver logs
3. Asegúrate de que las URLs de redirección coincidan exactamente
4. Verifica que los servicios externos (Gmail, Google Calendar, Flow) estén configurados correctamente

