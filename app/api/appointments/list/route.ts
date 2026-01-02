import { type NextRequest, NextResponse } from "next/server"
import { getAllAppointments } from "@/lib/db"

/**
 * Endpoint para listar todas las citas desde el servidor
 * GET /api/appointments/list
 */
export async function GET(request: NextRequest) {
  try {
    const appointments = await getAllAppointments()
    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching appointments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

