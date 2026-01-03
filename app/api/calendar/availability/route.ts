import { type NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/google-calendar"
import { appointmentsStore } from "@/lib/appointments-store"

// Default available time slots (9am-12pm and 3pm-6pm)
const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]

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
