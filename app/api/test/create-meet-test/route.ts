import { type NextRequest, NextResponse } from "next/server"
import { saveAppointment, initializeDatabase } from "@/lib/db"

/**
 * Endpoint para crear una cita de prueba para el día 4 a las 11:00 hrs
 * GET /api/test/create-meet-test
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

    // Calcular fecha: día 4 del mes actual
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    let appointmentDate = new Date(year, month, 4, 11, 0, 0)
    
    // Si el día 4 ya pasó este mes, usar el día 4 del próximo mes
    if (appointmentDate < now) {
      appointmentDate = new Date(year, month + 1, 4, 11, 0, 0)
    }

    // Crear una cita de prueba confirmada para probar Google Meet
    const testAppointment = {
      id: `test-meet-${Date.now()}`,
      patientName: "Paciente Prueba Meet",
      patientEmail: "prueba.meet@test.com",
      patientPhone: "+56912345678",
      consultationReason: "Cita de prueba para probar Google Meet",
      appointmentType: "online" as const,
      date: appointmentDate,
      time: "11:00",
      status: "confirmed" as const, // Directamente confirmada para probar Meet
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      paymentMethod: "transfer" as const,
    }

    console.log("💾 Guardando cita de prueba para Google Meet...", testAppointment.id)
    console.log("📅 Fecha:", appointmentDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }))
    console.log("⏰ Hora: 11:00")
    
    const success = await saveAppointment(testAppointment)
    
    if (success) {
      console.log("✅ Cita guardada exitosamente:", testAppointment.id)
      return NextResponse.json({
        success: true,
        message: "Cita de prueba creada y guardada en la base de datos",
        appointment: {
          id: testAppointment.id,
          patientName: testAppointment.patientName,
          date: appointmentDate.toISOString(),
          time: testAppointment.time,
          status: testAppointment.status,
          formattedDate: appointmentDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
        },
        instructions: {
          step1: "Ve al dashboard: http://localhost:3000/dashboard",
          step2: "Busca esta cita en 'Citas confirmadas'",
          step3: "Haz clic en 'Crear Meet' en el menú de 3 puntos",
          step4: "Deberías ver el link de Google Meet creado automáticamente",
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

