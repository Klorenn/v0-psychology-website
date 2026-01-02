import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"

/**
 * Endpoint de prueba para crear una cita de prueba
 * GET /api/test/create-appointment
 */
export async function GET(request: NextRequest) {
  try {
    const testAppointment = {
      id: `test-${Date.now()}`,
      patientName: "Paciente de Prueba",
      patientEmail: "test@ejemplo.com",
      patientPhone: "+56912345678",
      consultationReason: "Esta es una cita de prueba creada automáticamente",
      appointmentType: "online" as const,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      time: "10:00",
      status: "pending" as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      paymentMethod: "transfer" as const,
    }

    console.log("🧪 Creando cita de prueba...", testAppointment.id)
    const appointment = await appointmentsStore.add(testAppointment)
    console.log("✅ Cita de prueba creada:", appointment.id)

    return NextResponse.json({
      success: true,
      message: "Cita de prueba creada correctamente",
      appointment: {
        id: appointment.id,
        patientName: appointment.patientName,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
      },
    })
  } catch (error) {
    console.error("❌ Error creando cita de prueba:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear cita de prueba",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

