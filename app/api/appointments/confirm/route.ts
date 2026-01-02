import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"
import { siteConfigStore } from "@/lib/site-config"
import { siteConfigPersistence } from "@/lib/site-config-persistence"
import nodemailer from "nodemailer"

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || ""

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || RECIPIENT_EMAIL,
    pass: process.env.SMTP_PASS || "",
  },
})

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    // Inicializar el store antes de buscar la cita
    await appointmentsStore.init()

    const searchParams = request.nextUrl.searchParams
    const appointmentId = searchParams.get("id")
    const action = searchParams.get("action") // "accept" o "reject"

    if (!appointmentId || !action) {
      return NextResponse.redirect(`${baseUrl}/confirm?error=invalid_params`)
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.redirect(`${baseUrl}/confirm?error=invalid_action`)
    }

    // Buscar la cita en el store
    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.redirect(`${baseUrl}/confirm?error=not_found`)
    }

    // Actualizar el estado de la cita
    if (action === "accept") {
      await appointmentsStore.approve(appointmentId)
      
      // Crear evento en Google Calendar si está conectado
      let meetLink: string | null = null
      try {
        const { createCalendarEvent } = await import("@/lib/google-calendar")
        const eventResult = await createCalendarEvent(appointment)
        if (eventResult) {
          console.log(`Evento creado en Google Calendar: ${eventResult.eventId}`)
          meetLink = eventResult.meetLink
        }
      } catch (error) {
        console.error("Error creando evento en Google Calendar:", error)
        // No fallar si no se puede crear el evento
      }
    } else {
      await appointmentsStore.reject(appointmentId)
    }

      // NO enviar correo automáticamente - ahora es manual desde el dashboard

    // Redirigir a la página de confirmación
    return NextResponse.redirect(`${baseUrl}/confirm?action=${action}&id=${appointmentId}`)
  } catch (error) {
    console.error("Error confirmando cita:", error)
    return NextResponse.redirect(`${baseUrl}/confirm?error=server_error`)
  }
}

