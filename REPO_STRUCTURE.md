# 📁 Estructura del Repositorio - psychology-system-quotes

Estructura recomendada para el repositorio que contiene SOLO el sistema de citas.

## 🎯 Estructura de Carpetas

```
psychology-system-quotes/
│
├── 📚 lib/                          # Core - Sistema de automatización
│   ├── appointment-automation.ts   # ⭐ Función central
│   ├── googleCalendar.ts            # ⭐ Google Calendar API
│   ├── email-service.ts             # ⭐ Resend emails
│   ├── google-calendar-auth.ts      # ⭐ OAuth handling
│   ├── google-calendar-auth-db.ts   # ⭐ Persistencia tokens
│   ├── timezone-service.ts           # Timezone (Santiago)
│   └── api-auth.ts                  # JWT auth (opcional)
│
├── 📡 app/api/                      # Ejemplos de uso
│   ├── appointments/
│   │   ├── update-status/
│   │   │   └── route.ts            # Ejemplo: Disparar automatización
│   │   └── send-confirmation-email/
│   │       └── route.ts            # Ejemplo: Envío manual
│   └── google-calendar/
│       ├── auth/
│       │   └── route.ts            # OAuth - Iniciar
│       ├── callback/
│       │   └── route.ts            # OAuth - Callback
│       └── status/
│           └── route.ts            # OAuth - Estado
│
├── 🗄️ sql/                          # Scripts de base de datos
│   ├── appointments-table.sql      # Tabla de citas
│   ├── calendar-fields.sql         # Campos Google Calendar
│   └── google-tokens-table.sql     # Tabla de tokens OAuth
│
├── 📝 examples/                      # Ejemplos de integración
│   ├── basic-integration.ts        # Ejemplo básico
│   └── full-integration.ts         # Ejemplo completo
│
├── 📄 .env.example                  # Template de variables
├── 📄 .gitignore                    # Git ignore
├── 📄 package.json                  # Dependencias
│
└── 📚 Documentación
    ├── README.md                    # Documentación principal
    ├── SETUP.md                     # Guía de configuración
    ├── INTEGRATION_GUIDE.md         # Guía de integración
    └── QUICK_START.md               # Inicio rápido
```

## 📦 Archivos por Categoría

### ⭐ Core (Obligatorios)

**lib/appointment-automation.ts**
- Función central `automateAppointmentConfirmation()`
- Orquesta todo el flujo
- Idempotente

**lib/googleCalendar.ts**
- `createCalendarEvent()` - Crear eventos
- `getAvailableSlots()` - Obtener horarios disponibles
- Manejo de OAuth y tokens

**lib/email-service.ts**
- `sendAppointmentConfirmationEmail()` - Enviar emails
- Templates HTML para presencial y online

**lib/google-calendar-auth.ts**
- Manejo de tokens OAuth
- Refresh automático de tokens

**lib/google-calendar-auth-db.ts**
- Persistencia de tokens en BD
- Adaptar según tu BD

### 📡 API Routes (Ejemplos)

**app/api/appointments/update-status/route.ts**
- Ejemplo de cómo disparar automatización al confirmar cita

**app/api/appointments/send-confirmation-email/route.ts**
- Ejemplo de envío manual de email

**app/api/google-calendar/\***
- Endpoints OAuth necesarios

### 🗄️ SQL (Obligatorios)

**sql/appointments-table.sql**
- Tabla `appointments` con campos:
  - `calendar_event_id`
  - `meet_link`
  - `status` (pending, confirmed, etc.)

**sql/calendar-fields.sql**
- Agregar campos de Google Calendar a tabla existente

**sql/google-tokens-table.sql**
- Tabla para tokens OAuth

### 📝 Configuración

**.env.example**
- Template con todas las variables necesarias

**package.json**
- Dependencias mínimas:
  - `googleapis`
  - `resend`
  - `jose` (si usas JWT)

## 🔧 Adaptaciones Necesarias

### 1. Base de Datos

**lib/google-calendar-auth-db.ts**
- Adaptar funciones `saveGoogleTokens()`, `getGoogleTokens()` a tu BD
- Si usas Prisma, Sequelize, etc., adaptar las queries

**lib/db.ts** (si lo incluyes)
- Adaptar `getSupabaseClient()` a tu cliente de BD
- O crear funciones genéricas que acepten tu cliente

### 2. Autenticación

**lib/api-auth.ts**
- Opcional si ya tienes tu propio sistema de auth
- O adaptar a tu sistema

### 3. Timezone

**lib/timezone-service.ts**
- Cambiar "America/Santiago" si necesitas otro timezone
- O hacer configurable

## 📋 Checklist de Archivos

### Obligatorios
- [ ] `lib/appointment-automation.ts`
- [ ] `lib/googleCalendar.ts`
- [ ] `lib/email-service.ts`
- [ ] `lib/google-calendar-auth.ts`
- [ ] `lib/google-calendar-auth-db.ts` (adaptar)
- [ ] `sql/appointments-table.sql`
- [ ] `sql/calendar-fields.sql`
- [ ] `sql/google-tokens-table.sql`
- [ ] `.env.example`
- [ ] `package.json`

### Recomendados
- [ ] `lib/timezone-service.ts`
- [ ] `app/api/appointments/update-status/route.ts` (ejemplo)
- [ ] `app/api/google-calendar/*` (OAuth)
- [ ] `README.md`
- [ ] `SETUP.md`
- [ ] `INTEGRATION_GUIDE.md`

### Opcionales
- [ ] `lib/api-auth.ts`
- [ ] `examples/` (ejemplos de integración)

## 🚀 Uso del Script de Extracción

```bash
# Desde el proyecto principal
./extract-appointment-system.sh

# Esto creará ../psychology-system-quotes/ con todos los archivos
```

Luego:
1. Revisa y adapta los archivos según tu BD
2. `cd ../psychology-system-quotes`
3. `npm install`
4. `git init && git add . && git commit -m "Initial commit"`
5. Crea repo en GitHub y haz push

