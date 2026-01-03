# Automatización de Agendamiento de Sesiones

## Resumen

Sistema centralizado que automatiza completamente el proceso de confirmación de citas:
1. Creación de evento en Google Calendar (TODAS las sesiones)
2. Generación de Google Meet (SOLO sesiones online)
3. Envío de email automático al paciente (usando Resend)

## Arquitectura

### Función Centralizada

**`lib/appointment-automation.ts`** → `automateAppointmentConfirmation(appointmentId)`

Esta es la **ÚNICA** función que crea eventos de Google Calendar y envía emails automáticos.

### Flujo de Automatización

```
Cita se confirma (pago o manual)
  ↓
automateAppointmentConfirmation(appointmentId)
  ↓
1. Verificar que esté confirmada
2. IDEMPOTENCIA: Si ya tiene calendar_event_id → saltar
3. Crear evento en Google Calendar
4. Guardar calendar_event_id y meet_link en BD
5. Enviar email automático con Resend
```

### Puntos de Integración

La automatización se dispara automáticamente en:

1. **Webhook de Flow** (`app/api/flow/webhook/route.ts`)
   - Cuando el pago se confirma (status "2" o "3")
   - Llama a `automateAppointmentConfirmation()`

2. **Webhook de Transbank** (`app/api/transbank/confirm-transaction/route.ts`)
   - Cuando el pago se autoriza (response_code "0")
   - Llama a `automateAppointmentConfirmation()`

3. **Confirmación manual** (`app/api/appointments/confirm/route.ts`)
   - Cuando la psicóloga acepta una cita desde el email
   - Llama a `automateAppointmentConfirmation()`

4. **Método approve()** (`lib/appointments-store.ts`)
   - Cuando se aprueba una cita desde el dashboard
   - Llama automáticamente a `automateAppointmentConfirmation()`

5. **Envío manual de email** (`app/api/appointments/send-confirmation-email/route.ts`)
   - Si la cita no tiene evento, usa `automateAppointmentConfirmation()`
   - Si ya tiene evento, solo envía email con el meetLink existente

## Características

### Idempotencia

- Si una cita ya tiene `calendar_event_id`, la función **no vuelve a crear evento ni reenvía email**
- Esto previene duplicados por webhooks repetidos o llamadas múltiples

### Google Calendar

- **Título**: "Sesión psicológica" (fijo)
- **Descripción**: Incluye nombre del paciente, modalidad, email, teléfono, motivo, valor
- **Google Meet**: Solo para sesiones `online`
- **Location**: Dirección física para sesiones `presencial` (desde `siteConfig.location.address`)
- **Recordatorios**: Email 1 día antes, popup 1 hora antes

### Email Automático (Resend)

- **Template HTML**: Diseño profesional y cálido
- **Contenido diferenciado**:
  - Online → Incluye link de Google Meet
  - Presencial → Incluye dirección física
- **Tono**: Cálido, profesional y terapéutico
- **Información incluida**: Fecha, hora, modalidad, valor, Meet link o dirección

### Persistencia

Después de crear el evento, se guarda en Supabase:
- `calendar_event_id`: ID del evento en Google Calendar
- `meet_link`: Link de Google Meet (solo si es online)

## Base de Datos

### Nuevos Campos

Ejecutar `add-calendar-fields.sql` en Supabase SQL Editor:

```sql
ALTER TABLE appointments ADD COLUMN calendar_event_id TEXT;
ALTER TABLE appointments ADD COLUMN meet_link TEXT;
CREATE INDEX idx_appointments_calendar_event_id ON appointments(calendar_event_id);
```

### Interfaz TypeScript

```typescript
interface Appointment {
  // ... campos existentes
  calendarEventId?: string
  meetLink?: string
}
```

## Variables de Entorno

```env
# Resend (requerido para emails automáticos)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@tudominio.com

# Google Calendar (ya existente)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
```

## Archivos Creados/Modificados

### Nuevos Archivos
- `lib/appointment-automation.ts` - Función centralizada de automatización
- `lib/email-service.ts` - Servicio de email con Resend
- `add-calendar-fields.sql` - Script SQL para agregar campos

### Archivos Modificados
- `lib/google-calendar.ts` - Título "Sesión psicológica", location para presenciales
- `lib/appointments-store.ts` - Interfaz Appointment, método approve() con automatización
- `lib/db.ts` - Funciones para guardar/leer calendar_event_id y meet_link
- `app/api/flow/webhook/route.ts` - Usa automatización centralizada
- `app/api/transbank/confirm-transaction/route.ts` - Usa automatización centralizada
- `app/api/appointments/confirm/route.ts` - Usa automatización centralizada
- `app/api/appointments/send-confirmation-email/route.ts` - Usa automatización si no hay evento

## Testing

### Flujo de Prueba

1. **Crear cita de prueba** (desde el sitio web o dashboard)
2. **Confirmar cita** (pago o manualmente)
3. **Verificar**:
   - ✅ Evento creado en Google Calendar
   - ✅ `calendar_event_id` guardado en BD
   - ✅ `meet_link` guardado (si es online)
   - ✅ Email enviado al paciente
   - ✅ Idempotencia: segunda llamada no duplica

### Verificación Manual

```sql
-- Ver citas con eventos de Google Calendar
SELECT id, patient_name, calendar_event_id, meet_link 
FROM appointments 
WHERE calendar_event_id IS NOT NULL;
```

## Notas Importantes

1. **Centralización**: `automateAppointmentConfirmation()` es el ÚNICO lugar donde se crean eventos
2. **Idempotencia**: Múltiples llamadas no crean eventos duplicados
3. **Resiliencia**: Si falla Google Calendar o Resend, no rompe el flujo principal
4. **Seguridad**: Todo ejecuta server-side, sin exponer credenciales

