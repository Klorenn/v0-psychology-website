import { getGoogleCalendarTokens } from "./google-calendar-auth"
import type { Appointment } from "./appointments-store"

export async function createCalendarEvent(appointment: Appointment): Promise<string | null> {
  const tokens = await getGoogleCalendarTokens()
  
  if (!tokens || !tokens.accessToken) {
    return null
  }
  
  try {
    // Crear fecha de inicio y fin (1 hora de duración)
    const startDate = new Date(appointment.date)
    const [hours, minutes] = appointment.time.split(":").map(Number)
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setHours(hours + 1, minutes, 0, 0)
    
    const event = {
      summary: `Consulta - ${appointment.patientName}`,
      description: `Consulta ${appointment.appointmentType === "online" ? "Online" : "Presencial"} con ${appointment.patientName}\n\n` +
        `Email: ${appointment.patientEmail}\n` +
        `Teléfono: ${appointment.patientPhone}\n` +
        (appointment.consultationReason ? `Motivo: ${appointment.consultationReason}\n` : "") +
        `Valor: $${appointment.appointmentType === "online" ? "20.000" : "27.000"} CLP`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "America/Santiago",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "America/Santiago",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 día antes
          { method: "popup", minutes: 60 }, // 1 hora antes
        ],
      },
    }
    
    const calendarId = tokens.calendarId || "primary"
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error("Error creando evento en Google Calendar:", error)
      return null
    }
    
    const createdEvent = await response.json()
    return createdEvent.id || null
  } catch (error) {
    console.error("Error creando evento en Google Calendar:", error)
    return null
  }
}

export async function getAvailableSlots(date: Date): Promise<string[]> {
  const tokens = await getGoogleCalendarTokens()
  const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]
  
  if (!tokens || !tokens.accessToken) {
    return DEFAULT_SLOTS
  }
  
  try {
    const timeMin = new Date(date)
    timeMin.setHours(0, 0, 0, 0)
    
    const timeMax = new Date(date)
    timeMax.setHours(23, 59, 59, 999)
    
    const calendarId = tokens.calendarId || "primary"
    const response = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: "America/Santiago",
        items: [{ id: calendarId }],
      }),
    })
    
    if (!response.ok) {
      return DEFAULT_SLOTS
    }
    
    const data = await response.json()
    const busySlots = data.calendars?.[calendarId]?.busy || []
    
    // Filtrar horarios ocupados
    const availableSlots = DEFAULT_SLOTS.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number)
      const slotStart = new Date(date)
      slotStart.setHours(hours, minutes, 0, 0)
      
      const slotEnd = new Date(slotStart)
      slotEnd.setHours(hours + 1, 0, 0, 0)
      
      return !busySlots.some((busy: { start: string; end: string }) => {
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return slotStart < busyEnd && slotEnd > busyStart
      })
    })
    
    return availableSlots
  } catch (error) {
    console.error("Error obteniendo horarios disponibles:", error)
    return DEFAULT_SLOTS
  }
}

