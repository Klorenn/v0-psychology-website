# Guía de Integración - Reutilización del Sistema

Esta guía explica cómo reutilizar el sistema de gestión de citas en otro proyecto.

## 🎯 Componentes Reutilizables

### 1. Sistema de Automatización de Citas

**Archivo principal:** `lib/appointment-automation.ts`

Esta es la función central que orquesta todo:

```typescript
import { automateAppointmentConfirmation } from "@/lib/appointment-automation"

// Cuando una cita se confirma, llama esta función
const result = await automateAppointmentConfirmation(appointmentId, {
  skipEmail: false  // true para solo crear evento, false para crear + email
})

// Resultado:
// {
//   success: boolean
//   calendarEventId?: string
//   meetLink?: string | null
//   meetStatus?: "created" | "not_supported"
// }
```

**Características:**
- ✅ Idempotente (no duplica eventos si ya existe)
- ✅ Crea evento en Google Calendar automáticamente
- ✅ Crea Google Meet para sesiones online
- ✅ Envía email por Resend para sesiones presenciales
- ✅ Guarda `calendar_event_id` y `meet_link` en BD

### 2. Integración con Google Calendar

**Archivo:** `lib/googleCalendar.ts`

**Funciones principales:**

```typescript
// Crear evento en Google Calendar
const result = await createCalendarEvent({
  summary: "Sesión Psicológica - María",
  description: "Descripción completa...",
  startDate: "2026-01-15T10:00:00Z",
  endDate: "2026-01-15T11:00:00Z",
  attendees: ["paciente@email.com"],
  location: "Torremolinos 355, Temuco",  // Solo presencial
  timeZone: "America/Santiago",
  modality: "online" | "presencial"
})

// Resultado:
// {
//   eventId: string
//   htmlLink: string
//   meetLink: string | null
//   meetStatus: "created" | "not_supported"
// }
```

**Requisitos:**
- OAuth 2.0 configurado en Google Cloud Console
- Tokens guardados en BD (se manejan automáticamente)

### 3. Servicio de Emails

**Archivo:** `lib/email-service.ts`

```typescript
import { sendAppointmentConfirmationEmail } from "@/lib/email-service"

const result = await sendAppointmentConfirmationEmail({
  patientName: "María González",
  patientEmail: "maria@email.com",
  date: "15 de Enero, 2026",
  time: "10:00",
  modality: "presencial",
  location: "Torremolinos 355, Temuco"
})

// Resultado:
// {
//   success: boolean
//   emailId?: string
//   error?: string
// }
```

**Templates incluidos:**
- ✅ Template para sesiones presenciales (HTML)
- ✅ Template para sesiones online (HTML)
- ✅ Incluye link de Google Maps para presenciales
- ✅ Incluye link de Google Meet para online

### 4. Base de Datos

**Archivo:** `lib/db.ts`

**Funciones clave:**

```typescript
// Guardar cita
await saveAppointment(appointment)

// Obtener todas las citas
const appointments = await getAllAppointments()

// Actualizar estado de cita
await updateAppointmentStatus(id, "confirmed")

// Guardar info de Google Calendar
await updateAppointmentCalendarInfo(id, eventId, meetLink)

// Obtener cita por ID
const appointment = await getAppointmentById(id)
```

**Esquema de tabla `appointments`:**

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_type TEXT NOT NULL,  -- 'online' | 'presencial'
  date TIMESTAMP NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL,  -- 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'attended'
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  calendar_event_id TEXT,  -- ID del evento en Google Calendar
  meet_link TEXT,  -- Link de Google Meet (solo online)
  -- ... otros campos
);
```

## 🔄 Flujo de Integración

### Paso 1: Instalar Dependencias

```bash
npm install resend googleapis
```

### Paso 2: Configurar Variables de Entorno

Ver `.env.example` para todas las variables necesarias.

### Paso 3: Copiar Archivos Clave

Copia estos archivos a tu proyecto:

```
lib/
  ├── appointment-automation.ts  ⭐ CRÍTICO
  ├── googleCalendar.ts          ⭐ CRÍTICO
  ├── email-service.ts           ⭐ CRÍTICO
  ├── db.ts                      (adaptar a tu BD)
  └── google-calendar-auth.ts   (manejo de tokens OAuth)
```

### Paso 4: Adaptar a tu Base de Datos

Si no usas Supabase, adapta `lib/db.ts`:

```typescript
// Ejemplo con Prisma
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function saveAppointment(appointment: Appointment) {
  return await prisma.appointment.create({
    data: {
      id: appointment.id,
      patientName: appointment.patientName,
      // ... mapear campos
    }
  })
}
```

### Paso 5: Integrar en tu Flujo

**Opción A: Al confirmar una cita**

```typescript
// En tu endpoint de confirmación
export async function POST(request: Request) {
  const { appointmentId } = await request.json()
  
  // 1. Actualizar estado en BD
  await updateAppointmentStatus(appointmentId, "confirmed")
  
  // 2. Disparar automatización
  const result = await automateAppointmentConfirmation(appointmentId)
  
  if (result.success) {
    return Response.json({ 
      success: true,
      calendarEventId: result.calendarEventId,
      meetLink: result.meetLink
    })
  }
  
  return Response.json({ error: result.error }, { status: 500 })
}
```

**Opción B: Manualmente desde dashboard**

```typescript
// Botón "Enviar Correo" o "Crear Meet"
const handleSendEmail = async () => {
  const result = await automateAppointmentConfirmation(appointmentId, {
    skipEmail: false  // true para solo crear evento
  })
  
  if (result.success) {
    alert("✅ Evento creado y email enviado")
  }
}
```

## 📝 Personalización de Templates

### Email Presencial

Edita `lib/email-service.ts` → `presencialHtml`

### Email Online

Edita `lib/email-service.ts` → `onlineHtml`

### Google Calendar

Edita `lib/appointment-automation.ts`:
- `onlineDescription` - Para sesiones online
- `presencialDescription` - Para sesiones presenciales

## 🔐 Seguridad

### Autenticación

El sistema usa JWT. Ver `lib/api-auth.ts`:

```typescript
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (!auth.authenticated) {
    return auth.response!
  }
  
  // Tu lógica aquí
}
```

### Variables de Entorno

Nunca commitees `.env.local`. Usa `.env.example` como template.

## 🧪 Testing

Endpoints de prueba incluidos:

```typescript
// app/api/test/create-presencial-test/route.ts
// Crea cita presencial y dispara automatización

// app/api/test/create-meet-test/route.ts
// Crea cita online y prueba Google Meet
```

## 📚 Archivos de Referencia

- `APPOINTMENT_AUTOMATION.md` - Documentación detallada del flujo
- `SETUP.md` - Guía de configuración completa
- `SECURITY.md` - Políticas de seguridad

## ⚠️ Consideraciones

1. **Idempotencia**: `automateAppointmentConfirmation` es idempotente. Si una cita ya tiene `calendar_event_id`, no crea duplicados.

2. **Google Meet**: Solo funciona con OAuth 2.0. Service Accounts no pueden crear Meet automáticamente.

3. **Resend Sandbox**: En desarrollo, solo puedes enviar a emails verificados en Resend.

4. **Timezone**: El sistema usa "America/Santiago" por defecto. Ajusta en `lib/timezone-service.ts` si necesitas otro.

## 🚀 Checklist de Integración

- [ ] Variables de entorno configuradas
- [ ] Google Calendar OAuth configurado
- [ ] Resend API Key configurado
- [ ] Base de datos con tablas creadas
- [ ] Archivos clave copiados
- [ ] `lib/db.ts` adaptado a tu BD
- [ ] Templates personalizados (opcional)
- [ ] Endpoint de confirmación integrado
- [ ] Testing realizado

## 💡 Tips

1. **Logs**: El sistema tiene logging detallado. Revisa la consola para debugging.

2. **Errores**: Todos los errores son descriptivos. Revisa los logs del servidor.

3. **Testing**: Usa los endpoints de prueba antes de integrar en producción.

4. **Backup**: Haz backup de tus tokens de Google Calendar antes de cambios grandes.

