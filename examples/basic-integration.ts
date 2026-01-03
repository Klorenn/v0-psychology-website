/**
 * Ejemplo básico de integración del sistema de citas
 * 
 * Este ejemplo muestra cómo usar el sistema en tu proyecto
 */

import { automateAppointmentConfirmation } from '../lib/appointment-automation'

// Ejemplo 1: Cuando una cita se confirma
export async function confirmAppointment(appointmentId: string) {
  // 1. Actualizar estado en tu BD
  await updateAppointmentStatusInYourDB(appointmentId, 'confirmed')
  
  // 2. Disparar automatización
  const result = await automateAppointmentConfirmation(appointmentId)
  
  if (result.success) {
    console.log('✅ Evento creado:', result.calendarEventId)
    console.log('✅ Meet link:', result.meetLink)
    
    // 3. Guardar calendar_event_id y meet_link en tu BD
    await updateAppointmentInYourDB(appointmentId, {
      calendarEventId: result.calendarEventId,
      meetLink: result.meetLink
    })
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

// Ejemplo 2: Solo crear evento (sin email)
export async function createCalendarEventOnly(appointmentId: string) {
  const result = await automateAppointmentConfirmation(appointmentId, {
    skipEmail: true
  })
  
  return result
}

// Ejemplo 3: En endpoint de API (Next.js)
export async function POST(request: Request) {
  const { appointmentId } = await request.json()
  
  try {
    const result = await automateAppointmentConfirmation(appointmentId)
    
    if (result.success) {
      return Response.json({
        success: true,
        calendarEventId: result.calendarEventId,
        meetLink: result.meetLink,
        meetStatus: result.meetStatus
      })
    }
    
    return Response.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}

// Funciones de ejemplo (adaptar a tu BD)
async function updateAppointmentStatusInYourDB(id: string, status: string) {
  // Tu lógica aquí
  // Ejemplo con Prisma:
  // await prisma.appointment.update({ where: { id }, data: { status } })
}

async function updateAppointmentInYourDB(id: string, data: any) {
  // Tu lógica aquí
  // Ejemplo con Prisma:
  // await prisma.appointment.update({ where: { id }, data })
}

