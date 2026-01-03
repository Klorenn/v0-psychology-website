import { type NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/googleCalendar"
import { appointmentsStore } from "@/lib/appointments-store"

// Default available time slots (9am-12pm and 3pm-6pm)
const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]

/**
 * Verificar si una hora ya pasó en zona horaria de Santiago
 */
function isTimePast(date: Date, time: string): boolean {
  const [hours, minutes] = time.split(":").map(Number)
  
  // Crear fecha/hora de la cita en zona horaria de Santiago
  const appointmentDate = new Date(date)
  appointmentDate.setHours(hours, minutes, 0, 0)
  
  // Obtener hora actual en zona horaria de Santiago usando Intl.DateTimeFormat
  const now = new Date()
  const santiagoFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  
  const parts = santiagoFormatter.formatToParts(now)
  const year = parseInt(parts.find(p => p.type === "year")?.value || "0")
  const month = parseInt(parts.find(p => p.type === "month")?.value || "0") - 1
  const day = parseInt(parts.find(p => p.type === "day")?.value || "0")
  const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0")
  const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0")
  
  // Crear fecha actual en Santiago para comparar
  const nowInSantiago = new Date(year, month, day, hour, minute, 0)
  
  // Comparar fechas: si la fecha de la cita es anterior a la fecha actual en Santiago, ya pasó
  const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate())
  const nowDateOnly = new Date(nowInSantiago.getFullYear(), nowInSantiago.getMonth(), nowInSantiago.getDate())
  
  // Si es el mismo día, comparar horas
  if (appointmentDateOnly.getTime() === nowDateOnly.getTime()) {
    return appointmentDate.getHours() < nowInSantiago.getHours() || 
           (appointmentDate.getHours() === nowInSantiago.getHours() && appointmentDate.getMinutes() < nowInSantiago.getMinutes())
  }
  
  // Si la fecha de la cita es anterior a hoy, ya pasó
  return appointmentDateOnly < nowDateOnly
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get("date")

  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

  try {
    const date = new Date(dateParam)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    // Inicializar el store de citas
    await appointmentsStore.init()

    // Obtener horarios de Google Calendar (si está conectado)
    let availableSlots = await getAvailableSlots(date)
    
    // Obtener citas confirmadas y pendientes del día (todas las pendientes se bloquean)
    const appointments = appointmentsStore.getAll()
    const dayAppointments = appointments.filter((a) => {
      const appointmentDate = new Date(a.date)
      return (
        appointmentDate.toDateString() === date.toDateString() &&
        (a.status === "confirmed" || a.status === "pending")
      )
    })

    // Bloquear horarios ocupados por citas confirmadas o pendientes
    // Esto asegura que cuando se acepta una cita o se crea una nueva, se tache automáticamente
    const blockedTimes = dayAppointments.map((a) => a.time)
    availableSlots = availableSlots.filter((slot) => !blockedTimes.includes(slot))
    
    // Filtrar horas pasadas (según zona horaria de Santiago)
    // Si es hoy, filtrar horas que ya pasaron
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateOnly = new Date(date)
    selectedDateOnly.setHours(0, 0, 0, 0)
    
    if (selectedDateOnly.getTime() === today.getTime()) {
      // Es hoy, filtrar horas pasadas
      availableSlots = availableSlots.filter((slot) => !isTimePast(date, slot))
    }
    
    return NextResponse.json({
      availableSlots,
      source: availableSlots.length < DEFAULT_SLOTS.length ? "filtered" : "default",
    })
  } catch (error) {
    console.error("[v0] Error fetching calendar availability:", error)
    return NextResponse.json({
      availableSlots: DEFAULT_SLOTS,
      source: "default",
    })
  }
}
