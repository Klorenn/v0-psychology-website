import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"

/**
 * Endpoint de prueba para crear una cita de prueba
 * GET /api/test/create-appointment
 */
export async function GET(request: NextRequest) {
  try {
    // Crear varias citas de prueba con datos más realistas
    const testPatients = [
      {
        name: "María González",
        email: "maria.gonzalez@email.com",
        phone: "+56987654321",
        reason: "Necesito ayuda con ansiedad y estrés laboral",
        type: "online" as const,
        time: "10:00",
      },
      {
        name: "Juan Pérez",
        email: "juan.perez@email.com",
        phone: "+56912345678",
        reason: "Consulta sobre depresión",
        type: "presencial" as const,
        time: "15:00",
      },
      {
        name: "Ana Martínez",
        email: "ana.martinez@email.com",
        phone: "+56955555555",
        reason: "Terapia de pareja",
        type: "online" as const,
        time: "11:00",
      },
    ]

    const createdAppointments = []
    
    for (const patient of testPatients) {
      const testAppointment = {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        consultationReason: patient.reason,
        appointmentType: patient.type,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        time: patient.time,
        status: "pending" as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        paymentMethod: "transfer" as const,
      }

      console.log("🧪 Creando cita de prueba...", testAppointment.id)
      const appointment = await appointmentsStore.add(testAppointment)
      console.log("✅ Cita de prueba creada:", appointment.id)
      createdAppointments.push({
        id: appointment.id,
        patientName: appointment.patientName,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
      })
    }

    console.log("🧪 Creando cita de prueba...", testAppointment.id)
    const appointment = await appointmentsStore.add(testAppointment)
    console.log("✅ Cita de prueba creada:", appointment.id)

    return NextResponse.json({
      success: true,
      message: `${createdAppointments.length} citas de prueba creadas correctamente`,
      count: createdAppointments.length,
      appointments: createdAppointments,
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

