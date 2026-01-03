# 📦 Psychology System Quotes - Solo Sistema de Citas

Este documento lista todos los archivos necesarios para extraer SOLO el sistema de citas y crear un repositorio independiente.

## 🎯 Archivos Esenciales

### ⭐ Core - Sistema de Automatización

```
lib/
  ├── appointment-automation.ts      ⭐ CRÍTICO - Función central
  ├── googleCalendar.ts              ⭐ CRÍTICO - Integración Google Calendar
  ├── email-service.ts               ⭐ CRÍTICO - Servicio de emails
  ├── google-calendar-auth.ts        ⭐ CRÍTICO - Manejo de tokens OAuth
  ├── google-calendar-auth-db.ts     ⭐ CRÍTICO - Persistencia de tokens
  ├── timezone-service.ts            ✅ Recomendado - Timezone correcto
  └── api-auth.ts                    ✅ Opcional - Autenticación JWT
```

### 📡 API Routes - Ejemplos de Uso

```
app/api/
  ├── appointments/
  │   ├── update-status/route.ts     ⭐ Ejemplo: Disparar automatización
  │   └── send-confirmation-email/route.ts  ⭐ Ejemplo: Envío manual
  └── google-calendar/
      ├── auth/route.ts              ⭐ OAuth - Iniciar conexión
      ├── callback/route.ts           ⭐ OAuth - Callback
      └── status/route.ts             ✅ OAuth - Verificar estado
```

### 🗄️ Base de Datos

```
sql/
  ├── appointments-table.sql          ⭐ Tabla de citas
  ├── calendar-fields.sql            ⭐ Campos de Google Calendar
  └── google-tokens-table.sql        ⭐ Tabla de tokens OAuth
```

### 📝 Configuración

```
.env.example                         ⭐ Template de variables
package.json                         ⭐ Dependencias necesarias
```

### 📚 Documentación

```
README.md                            ⭐ Documentación principal
SETUP.md                             ⭐ Guía de configuración
INTEGRATION_GUIDE.md                 ⭐ Guía de integración
```

## 📋 Checklist de Archivos

### Core Files (Obligatorios)

- [ ] `lib/appointment-automation.ts`
- [ ] `lib/googleCalendar.ts`
- [ ] `lib/email-service.ts`
- [ ] `lib/google-calendar-auth.ts`
- [ ] `lib/google-calendar-auth-db.ts`

### Dependencias (Obligatorias)

- [ ] `googleapis` (Google Calendar API)
- [ ] `resend` (Email service)
- [ ] `jose` (JWT si usas api-auth.ts)

### Base de Datos (Obligatorias)

- [ ] Script SQL para tabla `appointments` con campos:
  - `calendar_event_id`
  - `meet_link`
- [ ] Script SQL para tabla `google_calendar_tokens`

### Ejemplos (Opcionales pero recomendados)

- [ ] `app/api/appointments/update-status/route.ts`
- [ ] `app/api/appointments/send-confirmation-email/route.ts`
- [ ] `app/api/google-calendar/auth/route.ts`
- [ ] `app/api/google-calendar/callback/route.ts`

## 🚀 Estructura del Nuevo Repositorio

```
psychology-system-quotes/
├── lib/
│   ├── appointment-automation.ts
│   ├── googleCalendar.ts
│   ├── email-service.ts
│   ├── google-calendar-auth.ts
│   ├── google-calendar-auth-db.ts
│   └── timezone-service.ts
├── app/api/
│   ├── appointments/
│   │   ├── update-status/
│   │   └── send-confirmation-email/
│   └── google-calendar/
│       ├── auth/
│       ├── callback/
│       └── status/
├── sql/
│   ├── appointments-table.sql
│   ├── calendar-fields.sql
│   └── google-tokens-table.sql
├── examples/
│   └── integration-example.ts
├── .env.example
├── package.json
├── README.md
├── SETUP.md
└── INTEGRATION_GUIDE.md
```

## 🔧 Script de Extracción

Ver `extract-appointment-system.sh` para automatizar la extracción.

