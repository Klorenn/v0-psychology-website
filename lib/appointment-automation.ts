/**
 * Automatización centralizada de confirmación de citas
 * 
 * Esta función es el ÚNICO lugar donde se crean eventos de Google Calendar
 * y se envían emails automáticos después de confirmar una cita.
 * 
 * Implementa idempotencia: si la cita ya tiene calendar_event_id,
 * no vuelve a crear evento ni reenviar email.
 */

import { appointmentsStore, type Appointment } from "./appointments-store"
import { createCalendarEvent } from "./googleCalendar"
import { updateAppointmentCalendarInfo } from "./db"
import { sendAppointmentConfirmationEmail } from "./email-service"

/**
 * Automatizar confirmación de cita:
 * 1. Verificar que la cita esté confirmada
 * 2. Si ya tiene calendar_event_id, no hacer nada (idempotencia)
 * 3. Crear evento en Google Calendar
 * 4. Guardar calendar_event_id y meet_link en BD
 * 5. Enviar email automático al paciente
 * 
 * @param appointmentId ID de la cita a automatizar
 * @returns Resultado de la automatización
 */
export async function automateAppointmentConfirmation(
  appointmentId: string,
  options?: { skipEmail?: boolean }
): Promise<{
  success: boolean
  skipped?: boolean
  error?: string
  calendarEventId?: string
  meetLink?: string | null
  meetStatus?: "created" | "not_supported"
  emailError?: string
  emailDetails?: any
}> {
  try {
    // Inicializar store
    await appointmentsStore.init()
    
    // Obtener la cita
    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return {
        success: false,
        error: "Cita no encontrada",
      }
    }

    // Verificar que la cita esté confirmada
    if (appointment.status !== "confirmed") {
      return {
        success: false,
        error: `La cita no está confirmada. Estado actual: ${appointment.status}`,
      }
    }

    // IDEMPOTENCIA: Si ya tiene calendar_event_id, no hacer nada
    if (appointment.calendarEventId) {
      console.log(`[Calendar] Cita ${appointmentId} ya tiene evento (${appointment.calendarEventId}), saltando automatización`)
      return {
        success: true,
        skipped: true,
        calendarEventId: appointment.calendarEventId,
        meetLink: appointment.meetLink || null,
        meetStatus: appointment.meetLink ? "created" : "not_supported",
      }
    }

    // Crear evento en Google Calendar usando Service Account
    console.log(`[Calendar] Creando evento en Google Calendar para cita ${appointmentId}...`)
    
    // Preparar fechas
    const startDate = new Date(appointment.date)
    const [hours, minutes] = appointment.time.split(":").map(Number)
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setHours(hours + 1, minutes, 0, 0)

    // Obtener dirección física para sesiones presenciales
    let physicalLocation: string | undefined = undefined
    if (appointment.appointmentType === "presencial") {
      try {
        const { siteConfigPersistence } = await import("./site-config-persistence")
        const { siteConfigStore } = await import("./site-config")
        await siteConfigPersistence.load()
        const siteConfig = siteConfigStore.get()
        if (siteConfig.location?.address) {
          physicalLocation = `${siteConfig.location.address}, ${siteConfig.location.city || ""}, ${siteConfig.location.country || ""}`.trim()
        }
      } catch (error) {
        console.warn("No se pudo obtener dirección física:", error)
      }
    }

    // Preparar datos para templates
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]
    const appointmentDate = new Date(appointment.date)
    const formattedDate = `${appointmentDate.getDate()} de ${monthNames[appointmentDate.getMonth()]}, ${appointmentDate.getFullYear()}`
    const modality = appointment.appointmentType === "online" ? "Online" : "Presencial"
    const price = appointment.appointmentType === "online" ? "20.000" : "27.000"
    const firstName = appointment.patientName.split(" ")[0]
    
    // Template para sesiones ONLINE (se usa en la descripción del evento de Google Calendar)
    const onlineDescription = `Hola ${firstName},

Espero que estés muy bien 🌿
Quería confirmarte los detalles de tu próxima sesión:

🗓 Fecha: ${formattedDate}
⏰ Hora: ${appointment.time}
📍 Modalidad: ${modality}
💰 Valor: $${price} CLP

Para cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por transferencia bancaria antes de la sesión.

Si la sesión es online, te sugiero considerar lo siguiente para que podamos aprovechar bien el encuentro:

💻 Conectarte desde un lugar tranquilo y privado
🎧 Usar audífonos, si es posible, para mejorar el audio
📶 Asegurarte de contar con una conexión a internet estable
⏱ Ingresar unos minutos antes de la hora acordada

Si antes de la sesión necesitas comentarme algo, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte.

Un abrazo,
María San Luis
Psicóloga Clínica${appointment.consultationReason ? `\n\n💭 Motivo de consulta: ${appointment.consultationReason}` : ""}`

    // Template para sesiones PRESENCIALES (se envía por Resend)
    const presencialEmailTemplate = `Hola ${firstName},

Espero que estés muy bien 🌿
Quería confirmarte los detalles de tu próxima sesión:

🗓 Fecha: ${formattedDate}
⏰ Hora: ${appointment.time}
📍 Modalidad: ${modality}
💰 Valor: $${price} CLP

Para cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por transferencia bancaria antes de la sesión.

Si antes de la sesión necesitas comentarme algo, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte.

Un abrazo,
María San Luis
Psicóloga Clínica${appointment.consultationReason ? `\n\n💭 Motivo de consulta: ${appointment.consultationReason}` : ""}`

    // Descripción completa para el evento de Google Calendar (presencial)
    const googleMapsLink = "https://www.google.com/maps/place/Torremolinos+355,+Temuco,+Araucan%C3%ADa/data=!4m2!3m1!1s0x9614d3f59f45ca89:0x76959c5674f732d6?sa=X&ved=1t:242&ictx=111"
    const presencialDescription = `Hola ${firstName},

Espero que estés muy bien 🌿
Quería confirmarte los detalles de tu próxima sesión presencial:

🗓 Fecha: ${formattedDate}
⏰ Hora: ${appointment.time}
📍 Modalidad: Presencial
💰 Valor: $${price} CLP

🗺️ Dirección:
Torremolinos 355, Temuco

${googleMapsLink}

Para que la sesión se desarrolle con calma y sin apuros, te recomiendo:

🚶 Llegar con unos minutos de anticipación
📵 Silenciar tu teléfono durante la sesión
🧘‍♀️ Tomarte un momento previo para respirar y conectar contigo

Para cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por transferencia bancaria antes de la sesión.

Si antes de la sesión necesitas comentarme algo, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte.

Un abrazo,
María San Luis
Psicóloga Clínica${appointment.consultationReason ? `\n\n💭 Motivo de consulta: ${appointment.consultationReason}` : ""}`

    let eventResult: { eventId: string; htmlLink: string; meetLink: string | null; meetStatus: "created" | "not_supported" } | null = null

    try {
      // Usar descripción diferente según modalidad
      const eventDescription = appointment.appointmentType === "online" 
        ? onlineDescription 
        : presencialDescription
      
      eventResult = await createCalendarEvent({
        summary: `Sesión Psicológica - ${firstName}`,
        description: eventDescription,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        attendees: [appointment.patientEmail],
        location: physicalLocation,
        timeZone: "America/Santiago",
        modality: appointment.appointmentType, // "online" | "presencial"
      })

      console.log(`[Calendar] ✅ Evento creado exitosamente: ${eventResult.eventId}`)
      console.log(`[Calendar] 🔗 HTML Link: ${eventResult.htmlLink}`)
      console.log(`[Calendar] 📹 Meet Status: ${eventResult.meetStatus}`)
      console.log(`[Calendar] 📹 MeetLink: ${eventResult.meetLink || "N/A"}`)
      
      // Verificar que el evento realmente se creó
      if (!eventResult.eventId) {
        throw new Error("El evento se creó pero no se obtuvo el eventId")
      }
      
      // Guardar calendar_event_id y meet_link en la base de datos
      // NO fallar si meetStatus es "not_supported" - es una limitación esperada
      try {
        await updateAppointmentCalendarInfo(
          appointmentId,
          eventResult.eventId,
          eventResult.meetLink || null
        )
        console.log(`[Calendar] Información guardada en BD para cita ${appointmentId}`, {
          eventId: eventResult.eventId,
          meetLink: eventResult.meetLink || null,
          meetStatus: eventResult.meetStatus,
        })
      } catch (dbError) {
        console.error(`[Calendar] Error guardando información en BD:`, dbError)
        // Continuar aunque falle el guardado en BD, el evento ya está creado
      }
    } catch (error) {
      console.error(`[Calendar] Error creando evento en Google Calendar para cita ${appointmentId}:`, error)
      // NO enviar email si falla la creación del evento en Google Calendar
      return {
        success: false,
        error: `No se pudo crear evento en Google Calendar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }

    // Para sesiones ONLINE: la información completa está en la descripción del evento
    // Para sesiones PRESENCIALES: enviar email por Resend con el template completo
    if (appointment.appointmentType === "presencial" && !options?.skipEmail) {
      console.log(`[Email] Enviando email de confirmación para sesión presencial...`)
      
      try {
        const emailResult = await sendAppointmentConfirmationEmail({
          patientName: appointment.patientName,
          patientEmail: appointment.patientEmail,
          date: formattedDate,
          time: appointment.time,
          modality: "presencial",
          location: physicalLocation || "Torremolinos 355, Temuco, Araucanía",
        })

        if (emailResult.success) {
          console.log(`[Email] ✅ Email de confirmación enviado correctamente`)
          console.log(`[Email] 📧 Email ID: ${emailResult.emailId || "N/A"}`)
        } else {
          console.error(`[Email] ⚠️ Error enviando email: ${emailResult.error}`)
          if (emailResult.details) {
            console.error(`[Email] 📋 Detalles:`, emailResult.details)
          }
          // No fallar si el email falla, el evento ya está creado
          // Pero retornar información del error para debugging
          return {
            success: true,
            calendarEventId: eventResult?.eventId,
            meetLink: eventResult?.meetLink || null,
            meetStatus: eventResult?.meetStatus || "not_supported",
            emailError: emailResult.error,
            emailDetails: emailResult.details,
          }
        }
      } catch (emailError) {
        console.error(`[Email] ⚠️ Excepción enviando email:`, emailError)
        // No fallar si el email falla, el evento ya está creado
        return {
          success: true,
          calendarEventId: eventResult?.eventId,
          meetLink: eventResult?.meetLink || null,
          meetStatus: eventResult?.meetStatus || "not_supported",
          emailError: emailError instanceof Error ? emailError.message : "Error desconocido",
        }
      }
    } else if (appointment.appointmentType === "online") {
      console.log(`[Calendar] ✅ Evento creado con toda la información en la descripción (sesión online)`)
    }

    return {
      success: true,
      calendarEventId: eventResult?.eventId,
      meetLink: eventResult?.meetLink || null,
      meetStatus: eventResult?.meetStatus || "not_supported",
    }
  } catch (error) {
    console.error(`[Appointment] Error en automateAppointmentConfirmation para cita ${appointmentId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

