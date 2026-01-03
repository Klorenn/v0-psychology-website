# Psychology System Quotes

Sistema completo de gestión de citas con integración de Google Calendar, envío automático de emails, y dashboard administrativo.

## 🚀 Características

- ✅ **Dashboard administrativo** con autenticación JWT
- ✅ **Integración con Google Calendar** (OAuth 2.0)
- ✅ **Creación automática de eventos** en Google Calendar
- ✅ **Google Meet** para sesiones online
- ✅ **Envío automático de emails** con Resend
- ✅ **Templates personalizables** para emails y eventos
- ✅ **Gestión de citas** (pendientes, confirmadas, atendidas, canceladas)
- ✅ **Sistema de reseñas/testimonios**
- ✅ **Editor visual** de página
- ✅ **Temas personalizables**
- ✅ **Timezone correcto** (Santiago, Chile)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Google Cloud Platform
- Cuenta de Resend
- Base de datos Supabase (o PostgreSQL)

## 🛠️ Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd v0-psychology-website
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y completa las variables:

```bash
cp .env.example .env.local
```

Ver [SETUP.md](./SETUP.md) para detalles completos de configuración.

### 3. Configurar Base de Datos

Ejecuta los scripts SQL en tu base de datos Supabase:

1. `init-database.sql` - Tablas principales
2. `add-rating-column.sql` - Columna de rating para reseñas
3. `add-attended-status.sql` - Estado "atendido" para citas
4. `add-calendar-fields.sql` - Campos de Google Calendar

### 4. Configurar Google Calendar OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Google Calendar
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/google-calendar/callback` a URIs de redirección
6. Agrega tu email a "Usuarios de prueba" si está en modo Testing

### 5. Configurar Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API Key
3. En modo sandbox, verifica los emails de prueba en https://resend.com/emails

### 6. Ejecutar el proyecto

```bash
npm run dev
```

Visita `http://localhost:3000`

## 📚 Documentación

- [SETUP.md](./SETUP.md) - Guía completa de configuración
- [APPOINTMENT_AUTOMATION.md](./APPOINTMENT_AUTOMATION.md) - Flujo de automatización de citas
- [ENV_SETUP.md](./ENV_SETUP.md) - Variables de entorno
- [SECURITY.md](./SECURITY.md) - Políticas de seguridad

## 🔑 Variables de Entorno Principales

```env
# Base de datos
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key

# Autenticación
ADMIN_EMAIL=tu_email@ejemplo.com
ADMIN_PASSWORD=tu_password_seguro
JWT_SECRET=tu_secret_jwt_muy_seguro

# Google Calendar
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback

# Resend
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=onboarding@resend.dev
```

## 🎯 Uso Rápido

### Crear una cita desde el frontend

El formulario público en `/` permite a los usuarios crear citas que se guardan como "pending".

### Confirmar una cita desde el dashboard

1. Inicia sesión en `/dashboard`
2. Ve a la sección "Citas"
3. Haz clic en "Aprobar" en una cita pendiente
4. El sistema automáticamente:
   - Crea el evento en Google Calendar
   - Crea Google Meet (si es online)
   - Envía email de confirmación (si es presencial)

### Enviar email manualmente

Desde el dashboard, en una cita confirmada:
- **Presencial**: Click en "Enviar Correo" → Crea evento + envía email
- **Online**: Click en "Crear Meet" → Crea evento con Meet

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── appointments/     # Endpoints de citas
│   │   ├── auth/             # Autenticación
│   │   ├── google-calendar/  # OAuth de Google Calendar
│   │   └── reviews/          # Endpoints de reseñas
│   ├── dashboard/            # Dashboard administrativo
│   └── page.tsx              # Página principal
├── components/               # Componentes React
├── lib/
│   ├── appointment-automation.ts  # ⭐ Automatización central
│   ├── googleCalendar.ts          # ⭐ Integración Google Calendar
│   ├── email-service.ts           # ⭐ Servicio de emails
│   ├── db.ts                      # Base de datos
│   └── api-auth.ts                # Autenticación JWT
└── public/                   # Archivos estáticos
```

## ⭐ Archivos Clave para Reutilización

Si quieres usar este sistema en otro proyecto, estos son los archivos esenciales:

1. **`lib/appointment-automation.ts`** - Función central de automatización
2. **`lib/googleCalendar.ts`** - Integración con Google Calendar
3. **`lib/email-service.ts`** - Servicio de emails con Resend
4. **`lib/db.ts`** - Funciones de base de datos
5. **`app/api/appointments/update-status/route.ts`** - Endpoint que dispara automatización
6. **`app/api/appointments/send-confirmation-email/route.ts`** - Envío manual de emails

## 🔄 Flujo de Automatización

```
Usuario crea cita → Estado: "pending"
         ↓
Admin aprueba cita → Estado: "confirmed"
         ↓
automateAppointmentConfirmation() se ejecuta automáticamente
         ↓
    ┌────┴────┐
    ↓         ↓
Google      Resend
Calendar    (solo presencial)
```

Ver [APPOINTMENT_AUTOMATION.md](./APPOINTMENT_AUTOMATION.md) para detalles.

## 🧪 Testing

Endpoints de prueba disponibles:

- `GET /api/test/create-presencial-test` - Crea cita presencial de prueba
- `GET /api/test/create-meet-test` - Crea cita online de prueba

## 📝 Licencia

[Tu licencia aquí]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📧 Soporte

Para problemas o preguntas, abre un issue en GitHub.
