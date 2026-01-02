import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"
import { signFlowParams, getFlowCredentials } from "@/lib/flow-auth"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Flow envía los datos como form-data
    const token = formData.get("token") as string
    const flowOrder = formData.get("flowOrder") as string
    const status = formData.get("status") as string

    if (!token || !flowOrder) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
    }

    const { apiKey, secretKey, baseUrl } = getFlowCredentials()
    
    if (!apiKey || !secretKey) {
      return NextResponse.json({ error: "Flow no configurado" }, { status: 500 })
    }

    // Verificar la firma del webhook
    const params: Record<string, string> = {
      apiKey: apiKey,
      token: token,
    }
    const signature = signFlowParams(params, secretKey)
    
    // Obtener información del pago desde Flow
    const getPaymentParams: Record<string, string> = {
      apiKey: apiKey,
      token: token,
    }
    const getPaymentSignature = signFlowParams(getPaymentParams, secretKey)
    getPaymentParams.s = getPaymentSignature

    const statusFormData = new URLSearchParams()
    Object.entries(getPaymentParams).forEach(([key, value]) => {
      statusFormData.append(key, value)
    })

    const paymentResponse = await fetch(`${baseUrl}/payment/getStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: statusFormData,
    })

    if (!paymentResponse.ok) {
      console.error("Error obteniendo estado del pago de Flow")
      return NextResponse.json({ error: "Error obteniendo estado" }, { status: 500 })
    }

    const paymentData = await paymentResponse.text()
    const paymentParams = new URLSearchParams(paymentData)
    const paymentStatus = paymentParams.get("status") || status
    const commerceOrder = paymentParams.get("commerceOrder") || flowOrder

    // Obtener appointmentId del commerceOrder o del optional
    let appointmentId = commerceOrder
    try {
      const optional = paymentParams.get("optional")
      if (optional) {
        const optionalData = JSON.parse(optional)
        appointmentId = optionalData.appointmentId || commerceOrder
      }
    } catch {
      // Si no se puede parsear, usar commerceOrder
    }

    if (!appointmentId) {
      return NextResponse.json({ error: "No se encontró appointment_id" }, { status: 400 })
    }

    // Inicializar store
    await appointmentsStore.init()
    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    // Actualizar estado según el estado del pago
    if (paymentStatus === "2" || paymentStatus === "3") {
      // 2 = Pagado, 3 = Pagado y marcado
      // Confirmar cita automáticamente
      await appointmentsStore.approve(appointmentId)
      
      // Actualizar información de pago en la cita
      const allAppointments = appointmentsStore.getAll()
      const appointmentIndex = allAppointments.findIndex((a) => a.id === appointmentId)
      if (appointmentIndex !== -1) {
        const updatedAppointment = {
          ...allAppointments[appointmentIndex],
          paymentMethod: "flow" as const,
          mercadoPagoPaymentId: flowOrder, // Reutilizamos el campo para Flow payment ID
        }
        // Actualizar en el array
        allAppointments[appointmentIndex] = updatedAppointment
        // Guardar cambios usando persist directamente
        const { appointmentsPersistence } = await import("@/lib/appointments-persistence")
        await appointmentsPersistence.save(allAppointments)
        // Notificar listeners - actualizar el store interno
        const store = appointmentsStore as any
        if (store._updateAppointments) {
          store._updateAppointments(allAppointments)
        }
      }

      // Crear evento en Google Calendar si está conectado
      try {
        const { createCalendarEvent } = await import("@/lib/google-calendar")
        const eventResult = await createCalendarEvent(appointment)
        if (eventResult) {
          console.log(`Evento creado en Google Calendar: ${eventResult.eventId}`)
        }
      } catch (error) {
        console.error("Error creando evento en Google Calendar:", error)
      }

      // El correo ahora se envía manualmente desde el dashboard
    } else if (paymentStatus === "4" || paymentStatus === "5") {
      // 4 = Rechazado, 5 = Anulado
      await appointmentsStore.reject(appointmentId)
    }
    // Si está "1" (Pendiente), mantener como pending

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error en webhook de Flow:", error)
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 })
  }
}

// GET para verificación (Flow puede hacer GET)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "ok" })
}

