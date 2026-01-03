import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"
import { requireAuth } from "@/lib/api-auth"

/**
 * Endpoint temporal para listar citas confirmadas (solo para testing)
 * GET /api/test/list-confirmed
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    await appointmentsStore.init()
    const appointments = appointmentsStore.getAll()
    const confirmed = appointments.filter(a => a.status === "confirmed")
    
    return NextResponse.json({
      success: true,
      count: confirmed.length,
      appointments: confirmed.map(a => ({
        id: a.id,
        patientName: a.patientName,
        patientEmail: a.patientEmail,
        date: a.date,
        time: a.time,
        appointmentType: a.appointmentType,
        hasCalendarEvent: !!a.calendarEventId,
        hasMeetLink: !!a.meetLink,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}

