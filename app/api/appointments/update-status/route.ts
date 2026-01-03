import { type NextRequest, NextResponse } from "next/server"
import { updateAppointmentStatus, getAppointmentById } from "@/lib/db"
import { requireAuth } from "@/lib/api-auth"
import { isValidStatusTransition, getInvalidTransitionMessage, type AppointmentStatus } from "@/lib/appointment-status"
import { createErrorResponse, AppError } from "@/lib/error-handler"

/**
 * Endpoint para actualizar el estado de una cita
 * POST /api/appointments/update-status
 */
export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "ID de cita requerido y debe ser una cadena válida" },
        { status: 400 }
      )
    }

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { success: false, error: "Estado requerido y debe ser una cadena válida" },
        { status: 400 }
      )
    }

    const validStatuses: AppointmentStatus[] = ["pending", "confirmed", "cancelled", "expired", "attended"]
    if (!validStatuses.includes(status as AppointmentStatus)) {
      return NextResponse.json(
        { success: false, error: `Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    // Obtener el estado actual de la cita
    const appointment = await getAppointmentById(id)
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Cita no encontrada" },
        { status: 404 }
      )
    }

    // Validar transición de estado
    const currentStatus = appointment.status as AppointmentStatus
    if (!isValidStatusTransition(currentStatus, status as AppointmentStatus)) {
      return NextResponse.json(
        { 
          success: false, 
          error: getInvalidTransitionMessage(currentStatus, status as AppointmentStatus)
        },
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

    // Automatizar: crear evento en Google Calendar y enviar email
    // Solo si el estado cambió a "confirmed"
    if (status === "confirmed") {
      try {
        const { automateAppointmentConfirmation } = await import("@/lib/appointment-automation")
        // Ejecutar en background para no bloquear la respuesta
        // No esperamos el resultado para no bloquear la respuesta al cliente
        automateAppointmentConfirmation(id)
          .then((result) => {
            if (result.success) {
              console.log(`[Appointment] Automatización completada para cita ${id}`)
            } else {
              console.error(`[Appointment] Automatización falló para cita ${id}:`, result.error)
            }
          })
          .catch((error) => {
            console.error(`[Appointment] Error en automatización para cita ${id}:`, error)
            // No romper el flujo principal, la cita ya está confirmada
          })
      } catch (error) {
        console.error(`[Appointment] Error iniciando automatización para cita ${id}:`, error)
        // No fallar si la automatización falla, la cita ya está confirmada
      }
    }

    // Retornar éxito siempre, incluso si la automatización falla
    // La cita ya está confirmada en la BD
    return NextResponse.json({
      success: true,
      message: `Cita ${status === "confirmed" ? "confirmada" : "actualizada"} correctamente`,
    })
  } catch (error) {
    console.error("Error actualizando estado de cita:", error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(
      { success: false, ...errorResponse },
      { status: error instanceof AppError ? error.statusCode : 500 }
    )
  }
}

