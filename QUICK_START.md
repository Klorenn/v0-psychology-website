# 🚀 Quick Start - Inicio Rápido

Guía rápida para poner en marcha el sistema en 5 minutos.

## ⚡ Setup Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y completa:
- ✅ Credenciales de Supabase
- ✅ `ADMIN_EMAIL` y `ADMIN_PASSWORD`
- ✅ `JWT_SECRET` (genera uno: `openssl rand -base64 32`)
- ✅ Credenciales de Google Calendar OAuth
- ✅ `RESEND_API_KEY`

### 3. Configurar base de datos

Ejecuta en Supabase SQL Editor (en orden):
1. `init-database.sql`
2. `add-rating-column.sql`
3. `add-attended-status.sql`
4. `add-calendar-fields.sql`

### 4. Iniciar servidor

```bash
npm run dev
```

### 5. Conectar Google Calendar

1. Ve a `http://localhost:3000/dashboard`
2. Inicia sesión
3. Ve a "Configuración del Sitio" → "Google Calendar"
4. Haz clic en "Conectar Google Calendar"
5. Autoriza la aplicación

### 6. Verificar Resend

1. Ve a https://resend.com/emails
2. Agrega emails de prueba (si usas sandbox)
3. Prueba creando una cita presencial:
   ```
   http://localhost:3000/api/test/create-presencial-test
   ```

## ✅ Verificación

- [ ] Dashboard carga: `http://localhost:3000/dashboard`
- [ ] Puedes iniciar sesión
- [ ] Google Calendar se conecta
- [ ] Resend envía emails (revisa logs)

## 📚 Documentación Completa

- [SETUP.md](./SETUP.md) - Guía detallada paso a paso
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Cómo reutilizar en otro proyecto
- [README.md](./README.md) - Documentación general

## 🆘 Problemas Comunes

**Dashboard no carga:**
- Verifica que `.env.local` tenga todas las variables
- Revisa la consola del navegador

**Google Calendar no conecta:**
- Verifica `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- Asegúrate de que el redirect URI esté en Google Cloud Console

**Emails no llegan:**
- Verifica `RESEND_API_KEY`
- Si usas sandbox, verifica el email en Resend
- Revisa los logs del servidor

## 🎯 Siguiente Paso

Una vez funcionando, lee [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) para entender cómo reutilizar el sistema.

