import { type NextRequest, NextResponse } from "next/server"
import { getTransbankCredentials, getTransbankBaseUrl, getTransbankHeaders } from "@/lib/transbank-auth"
import { appointmentsStore } from "@/lib/appointments-store"

/**
 * Confirma una transacción de Transbank Webpay Plus
 * GET /api/transbank/confirm-transaction?token_ws=xxx&appointment_id=xxx
 * POST /api/transbank/confirm-transaction (con form-data o JSON)
 */
async function confirmTransaction(tokenWs: string | null, appointmentId: string | null, request: NextRequest) {
  try {
    if (!tokenWs || !appointmentId) {
      return NextResponse.redirect(
        new URL("/booking/failure?error=missing_params", request.url)
      )
    }

    const { commerceCode, apiKey, environment } = getTransbankCredentials()

    if (!commerceCode || !apiKey) {
      return NextResponse.redirect(
        new URL("/booking/failure?error=transbank_not_configured", request.url)
      )
    }

    const baseUrl = getTransbankBaseUrl(environment)
    const headers = getTransbankHeaders(commerceCode, apiKey)

    // Confirmar la transacción en Transbank
    const confirmResponse = await fetch(
      `${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${tokenWs}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({}),
      }
    )

    if (!confirmResponse.ok) {
      const errorText = await confirmResponse.text()
      console.error("Error confirmando transacción en Transbank:", errorText)
      return NextResponse.redirect(
        new URL(`/booking/failure?error=confirmation_failed&appointment_id=${appointmentId}`, request.url)
      )
    }

    const transactionData = await confirmResponse.json()

    // Verificar el estado de la transacción
    const responseCode = transactionData.response_code
    const status = transactionData.status

    // Inicializar store
    await appointmentsStore.init()
    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.redirect(
        new URL("/booking/failure?error=appointment_not_found", request.url)
      )
    }

    // response_code: 0 = aprobado, otros valores = rechazado
    if (responseCode === 0 && status === "AUTHORIZED") {
      // Pago aprobado - confirmar cita automáticamente
      await appointmentsStore.approve(appointmentId)

      // Actualizar información de pago en la cita
      const allAppointments = appointmentsStore.getAll()
      const appointmentIndex = allAppointments.findIndex((a) => a.id === appointmentId)
      if (appointmentIndex !== -1) {
        const updatedAppointment = {
          ...allAppointments[appointmentIndex],
          paymentMethod: "webpay" as const,
          mercadoPagoPaymentId: transactionData.buy_order, // Reutilizamos el campo para Transbank buy_order
        }
        // Actualizar en el array
        allAppointments[appointmentIndex] = updatedAppointment
        // Guardar cambios
        const { appointmentsPersistence } = await import("@/lib/appointments-persistence")
        await appointmentsPersistence.save(allAppointments)
        // Notificar listeners
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

      // Redirigir a página de éxito
      return NextResponse.redirect(
        new URL(`/booking/success?appointment_id=${appointmentId}`, request.url)
      )
    } else {
      // Pago rechazado
      await appointmentsStore.reject(appointmentId)
      return NextResponse.redirect(
        new URL(`/booking/failure?error=payment_rejected&appointment_id=${appointmentId}`, request.url)
      )
    }
  } catch (error) {
    console.error("Error en confirm-transaction de Transbank:", error)
    return NextResponse.redirect(
      new URL("/booking/failure?error=internal_error", request.url)
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tokenWs = searchParams.get("token_ws")
  const appointmentId = searchParams.get("appointment_id")
  return confirmTransaction(tokenWs, appointmentId, request)
}

export async function POST(request: NextRequest) {
  try {
    // Transbank puede enviar el token_ws mediante POST (form-data o JSON)
    const contentType = request.headers.get("content-type") || ""
    
    let tokenWs: string | null = null
    let appointmentId: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      tokenWs = body.token_ws || body.token
      appointmentId = body.appointment_id
    } else {
      // Form-data
      const formData = await request.formData()
      tokenWs = formData.get("token_ws") as string | null
      appointmentId = formData.get("appointment_id") as string | null
      
      // Si no está en form-data, intentar desde query params
      if (!tokenWs || !appointmentId) {
        const searchParams = request.nextUrl.searchParams
        tokenWs = tokenWs || searchParams.get("token_ws")
        appointmentId = appointmentId || searchParams.get("appointment_id")
      }
    }

    return confirmTransaction(tokenWs, appointmentId, request)
  } catch (error) {
    console.error("Error en POST confirm-transaction de Transbank:", error)
    return NextResponse.redirect(
      new URL("/booking/failure?error=internal_error", request.url)
    )
  }
}

