import { type NextRequest, NextResponse } from "next/server"
import { saveAppointment, initializeDatabase } from "@/lib/db"

/**
 * Endpoint simple para crear una cita directamente en la BD
 * GET /api/test/create-simple
 */
export async function GET(request: NextRequest) {
  try {
    // Asegurar que las tablas existan
    try {
      await initializeDatabase()
      console.log("✅ Tablas verificadas/inicializadas")
    } catch (initError) {
      console.error("Error inicializando BD:", initError)
    }

    // Crear una cita simple
    const testAppointment = {
      id: `test-simple-${Date.now()}`,
      patientName: "Paciente Prueba Simple",
      patientEmail: "prueba@test.com",
      patientPhone: "+56912345678",
      consultationReason: "Cita de prueba creada directamente en BD",
      appointmentType: "online" as const,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      time: "10:00",
      status: "pending" as const,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      paymentMethod: "transfer" as const,
    }

    console.log("💾 Guardando cita directamente en BD...", testAppointment.id)
    const success = await saveAppointment(testAppointment)
    
    if (success) {
      console.log("✅ Cita guardada exitosamente:", testAppointment.id)
      return NextResponse.json({
        success: true,
        message: "Cita creada y guardada en la base de datos",
        appointment: {
          id: testAppointment.id,
          patientName: testAppointment.patientName,
          date: testAppointment.date,
          time: testAppointment.time,
          status: testAppointment.status,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo guardar la cita (probablemente no hay conexión a BD)",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Error creando cita:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear cita",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

