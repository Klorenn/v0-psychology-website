import { type NextRequest, NextResponse } from "next/server"
import { updateAppointmentStatus } from "@/lib/db"

/**
 * Endpoint para actualizar el estado de una cita
 * POST /api/appointments/update-status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos: id y status" },
        { status: 400 }
      )
    }

    if (!["pending", "confirmed", "cancelled", "expired"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Estado inválido" },
        { status: 400 }
      )
    }

    const success = await updateAppointmentStatus(id, status)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Error al actualizar el estado de la cita" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Cita ${status === "confirmed" ? "confirmada" : "rechazada"} correctamente`,
    })
  } catch (error) {
    console.error("Error actualizando estado de cita:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el estado de la cita",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

