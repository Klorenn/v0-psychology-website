import { type NextRequest, NextResponse } from "next/server"
import { saveAppointment, initializeDatabase } from "@/lib/db"
import { appointmentsStore } from "@/lib/appointments-store"
import { automateAppointmentConfirmation } from "@/lib/appointment-automation"

/**
 * Endpoint para crear una cita de prueba PRESENCIAL y enviar email
 * GET /api/test/create-presencial-test
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

    // Calcular fecha: mañana a las 10:00
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    // Crear una cita de prueba presencial confirmada
    const testAppointment = {
      id: `test-presencial-${Date.now()}`,
      patientName: "Paciente Prueba Presencial",
      patientEmail: "pautelluscoop@gmail.com",
      patientPhone: "+56912345678",
      consultationReason: "Cita de prueba presencial para verificar el envío de email",
      appointmentType: "presencial" as const,
      date: tomorrow,
      time: "10:00",
      status: "confirmed" as const, // Directamente confirmada para probar email
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      paymentMethod: "transfer" as const,
    }

    console.log("💾 Guardando cita de prueba presencial...", testAppointment.id)
    console.log("📅 Fecha:", tomorrow.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }))
    console.log("⏰ Hora: 10:00")
    console.log("📧 Email:", testAppointment.patientEmail)
    
    // Guardar en BD
    const success = await saveAppointment(testAppointment)
    
    if (success) {
      console.log("✅ Cita guardada en BD")
      
      // Agregar al store
      await appointmentsStore.add(testAppointment)
      console.log("✅ Cita agregada al store")
      
      // Inicializar store para asegurar que esté actualizado
      await appointmentsStore.init(true)
      
      // Esperar un momento para que el store se actualice
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Trigger automático de confirmación (creará evento y enviará email)
      console.log("🔄 Iniciando automatización de confirmación...")
      const automationResult = await automateAppointmentConfirmation(testAppointment.id)
      
      if (automationResult.success) {
        console.log("✅ Automatización completada:", {
          calendarEventId: automationResult.calendarEventId,
          meetLink: automationResult.meetLink,
          meetStatus: automationResult.meetStatus,
        })
        
        return NextResponse.json({
          success: true,
          message: "Cita de prueba presencial creada y email enviado",
          appointment: {
            id: testAppointment.id,
            patientName: testAppointment.patientName,
            patientEmail: testAppointment.patientEmail,
            date: tomorrow.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: testAppointment.time,
            type: testAppointment.appointmentType,
            status: testAppointment.status,
          },
          automation: {
            calendarEventId: automationResult.calendarEventId,
            meetLink: automationResult.meetLink,
            meetStatus: automationResult.meetStatus,
          },
        })
      } else {
        console.error("❌ Error en automatización:", automationResult.error)
        return NextResponse.json({
          success: false,
          message: "Cita creada pero error en automatización",
          error: automationResult.error,
          appointment: {
            id: testAppointment.id,
            patientName: testAppointment.patientName,
            patientEmail: testAppointment.patientEmail,
          },
        }, { status: 500 })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "No se pudo guardar la cita en la base de datos",
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Error creando cita de prueba presencial:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creando cita de prueba",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

