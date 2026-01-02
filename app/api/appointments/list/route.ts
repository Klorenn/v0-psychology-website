import { type NextRequest, NextResponse } from "next/server"
import { getAllAppointments } from "@/lib/db"

/**
 * Endpoint para listar todas las citas (útil para debugging)
 * GET /api/appointments/list
 */
export async function GET(request: NextRequest) {
  try {
    const appointments = await getAllAppointments()
    
    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments: appointments.map(a => ({
        id: a.id,
        patientName: a.patientName,
        patientEmail: a.patientEmail,
        status: a.status,
        date: a.date,
        time: a.time,
        appointmentType: a.appointmentType,
        createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error listando citas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al listar citas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

