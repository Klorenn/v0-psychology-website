# 🔐 Variables de Entorno para Vercel

Este archivo contiene todas las variables de entorno necesarias para configurar el proyecto en Vercel.

## 📋 Cómo usar este archivo

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/)
2. Ve a **Settings** → **Environment Variables**
3. Copia y pega cada variable una por una
4. Selecciona **"Production"**, **"Preview"** y **"Development"** para cada variable
5. Después de agregar todas, **redesplega** el proyecto

---

## ✅ Variables Obligatorias

### 🗄️ Supabase (Base de Datos)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obtén estos valores desde:**
https://supabase.com/dashboard/project/[tu-proyecto]/settings/api

---

### 🔐 Autenticación (Dashboard)

```env
ADMIN_EMAIL=tu_email_admin_aqui
ADMIN_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=tu-secret-key-muy-largo-y-aleatorio-minimo-32-caracteres-aqui
```

**Para generar JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

### 📧 Resend (Emails)

```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=onboarding@resend.dev
RECIPIENT_EMAIL=tu_email_para_recibir_notificaciones_aqui
```

**Obtén tu API key desde:**
https://resend.com/api-keys

**Nota:** En modo sandbox, usa `onboarding@resend.dev`. En producción, usa tu dominio verificado.

---

### 🌐 Base URL

```env
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

**Reemplaza con tu dominio de Vercel:**
- Ejemplo: `https://tu-proyecto.vercel.app`
- O tu dominio personalizado: `https://tudominio.com`

---

## ⚙️ Variables Opcionales

### 📅 Google Calendar (OAuth 2.0)

Solo si quieres usar Google Calendar para crear eventos automáticamente.

```env
GOOGLE_CLIENT_ID=tu_client_id_de_google_cloud_console.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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loud_console
GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/api/google-calendar/callback
```

**Obtén estos valores desde:**
https://console.cloud.google.com/apis/credentials

**IMPORTANTE:** En Google Cloud Console, agrega esta URI de redirección:
```
https://tu-dominio.vercel.app/api/google-calendar/callback
```

---

### 💳 Flow (Pagos)

Solo si quieres integrar pagos con Flow.

```env
FLOW_API_KEY=tu_flow_api_key_aqui
FLOW_SECRET_KEY=tu_flow_secret_key_aqui
FLOW_ENVIRONMENT=sandbox
```

**Obtén tus credenciales desde:**
- Sandbox (pruebas): https://sandbox.flow.cl/
- Producción: https://flow.cl/

---

### 💳 Transbank Webpay Plus (Pagos)

Solo si quieres integrar pagos con Transbank.

```env
TRANSBANK_COMMERCE_CODE=tu_commerce_code_aqui
TRANSBANK_API_KEY=tu_api_key_aqui
TRANSBANK_ENVIRONMENT=integration
```

**Credenciales de prueba (integration):**
```env
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TRANSBANK_ENVIRONMENT=integration
```

---

### 📧 Contacto

```env
NEXT_PUBLIC_CONTACT_EMAIL=tu_email_de_contacto_aqui
```

Email de contacto que se muestra en el sitio web.

---

## 📝 Checklist de Configuración

Usa este checklist para asegurarte de que todas las variables estén configuradas:

### Obligatorias
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD`
- [ ] `JWT_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM`
- [ ] `RECIPIENT_EMAIL`
- [ ] `NEXT_PUBLIC_BASE_URL`

### Opcionales
- [ ] `GOOGLE_CLIENT_ID` (si usas Google Calendar)
- [ ] `GOOGLE_CLIENT_SECRET` (si usas Google Calendar)
- [ ] `GOOGLE_REDIRECT_URI` (si usas Google Calendar)
- [ ] `FLOW_API_KEY` (si usas Flow)
- [ ] `FLOW_SECRET_KEY` (si usas Flow)
- [ ] `FLOW_ENVIRONMENT` (si usas Flow)
- [ ] `TRANSBANK_COMMERCE_CODE` (si usas Transbank)
- [ ] `TRANSBANK_API_KEY` (si usas Transbank)
- [ ] `TRANSBANK_ENVIRONMENT` (si usas Transbank)
- [ ] `NEXT_PUBLIC_CONTACT_EMAIL`

---

## 🚀 Después de Configurar

1. **Redesplegar el proyecto:**
   - Ve a **Deployments** en Vercel
   - Haz clic en los tres puntos del último deployment
   - Selecciona **"Redeploy"**

2. **Verificar que todo funcione:**
   - Visita tu sitio: `https://tu-dominio.vercel.app`
   - Inicia sesión en el dashboard: `https://tu-dominio.vercel.app/dashboard`
   - Revisa los logs en Vercel si hay errores

---

## 🔍 Troubleshooting

### Error: "Missing API key"
- Verifica que `RESEND_API_KEY` esté configurada correctamente
- Asegúrate de haber redesplegado después de agregar las variables

### Error: "No autorizado"
- Verifica que `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `JWT_SECRET` estén configuradas
- Asegúrate de que `JWT_SECRET` tenga al menos 32 caracteres

### Error: "redirect_uri_mismatch" (Google Calendar)
- Verifica que `GOOGLE_REDIRECT_URI` coincida exactamente con la URI configurada en Google Cloud Console
- Debe incluir `https://` y no tener `/` al final

### Error: "Base de datos no conectada"
- Verifica que las variables de Supabase estén configuradas
- Si conectaste Supabase desde Vercel, las variables deberían agregarse automáticamente
- Visita `/api/db/init` para inicializar las tablas si no existen

---

## 📚 Más Información

- [ENV_SETUP.md](./ENV_SETUP.md) - Guía completa de configuración
- [SETUP.md](./SETUP.md) - Guía de setup inicial
- [README.md](./README.md) - Documentación general del proyecto

