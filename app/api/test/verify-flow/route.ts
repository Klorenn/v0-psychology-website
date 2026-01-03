import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/db"
import { getGoogleCalendarTokens } from "@/lib/google-calendar-auth"
import { appointmentsStore } from "@/lib/appointments-store"

/**
 * Endpoint para verificar el flujo completo de citas y Google Calendar
 * GET /api/test/verify-flow
 */
export async function GET(request: NextRequest) {
  try {
    const results: any = {
      database: { connected: false, appointments: [] },
      googleCalendar: { connected: false, tokens: null, calendarId: null },
      testAppointment: { found: false, hasEvent: false, appointment: null },
    }

    // 1. Verificar conexión a base de datos y citas
    const supabase = getSupabaseClient()
    if (supabase) {
      results.database.connected = true
      
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)
      
      if (!error && appointments) {
        results.database.appointments = appointments.map((apt: any) => ({
          id: apt.id,
          patientName: apt.patient_name,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          calendarEventId: apt.calendar_event_id,
          meetLink: apt.meet_link,
        }))
      }
    }

    // 2. Verificar tokens de Google Calendar
    const tokens = await getGoogleCalendarTokens()
    if (tokens) {
      results.googleCalendar.connected = true
      results.googleCalendar.tokens = {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        expiryDate: tokens.expiryDate,
        calendarId: tokens.calendarId,
        userEmail: tokens.userEmail,
      }
      results.googleCalendar.calendarId = tokens.calendarId || "primary"
    }

    // 3. Buscar cita de prueba
    await appointmentsStore.init()
    const allAppointments = appointmentsStore.getAll()
    const testAppointment = allAppointments.find(
      (apt) =>
        apt.patientName?.includes("Prueba Meet") ||
        apt.patientEmail === "prueba.meet@test.com"
    )

    if (testAppointment) {
      results.testAppointment.found = true
      results.testAppointment.hasEvent = !!testAppointment.calendarEventId
      results.testAppointment.appointment = {
        id: testAppointment.id,
        patientName: testAppointment.patientName,
        date: testAppointment.date,
        time: testAppointment.time,
        status: testAppointment.status,
        calendarEventId: testAppointment.calendarEventId,
        meetLink: testAppointment.meetLink,
      }
    }

    // 4. Resumen y recomendaciones
    const recommendations: string[] = []
    
    if (!results.database.connected) {
      recommendations.push("❌ No hay conexión a la base de datos")
    }
    
    if (!results.googleCalendar.connected) {
      recommendations.push("❌ Google Calendar no está conectado. Visita: /api/google-calendar/auth")
    } else if (!results.googleCalendar.tokens?.calendarId) {
      recommendations.push("⚠️ Google Calendar está conectado pero no tiene calendarId guardado. Reconecta OAuth.")
    }
    
    if (!results.testAppointment.found) {
      recommendations.push("ℹ️ No se encontró cita de prueba. Crea una visitando: /api/test/create-meet-test")
    } else if (!results.testAppointment.hasEvent) {
      recommendations.push("ℹ️ Cita de prueba encontrada pero no tiene evento de Google Calendar. Crea el Meet desde el dashboard.")
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        databaseConnected: results.database.connected,
        googleCalendarConnected: results.googleCalendar.connected,
        testAppointmentFound: results.testAppointment.found,
        testAppointmentHasEvent: results.testAppointment.hasEvent,
      },
      recommendations,
      nextSteps: [
        results.googleCalendar.connected
          ? "✅ Google Calendar está conectado"
          : "1. Conecta Google Calendar: /api/google-calendar/auth",
        results.testAppointment.found
          ? "✅ Cita de prueba encontrada"
          : "2. Crea cita de prueba: /api/test/create-meet-test",
        results.testAppointment.hasEvent
          ? "✅ La cita ya tiene evento de Google Calendar"
          : "3. Ve al dashboard y haz clic en 'Crear Meet' para la cita de prueba",
        "4. Verifica en Google Calendar (ps.mariasanluis@gmail.com) que el evento aparezca",
      ],
    })
  } catch (error) {
    console.error("Error verificando flujo:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

