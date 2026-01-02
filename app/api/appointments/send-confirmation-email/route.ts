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

/**
 * Envía correo de confirmación manualmente
 * POST /api/appointments/send-confirmation-email
 */
export async function POST(request: NextRequest) {
  try {
    await appointmentsStore.init()

    const body = await request.json()
    const { appointmentId, createMeet } = body

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId es requerido" }, { status: 400 })
    }

    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    if (appointment.status !== "confirmed") {
      return NextResponse.json({ error: "La cita debe estar confirmada" }, { status: 400 })
    }

    // Crear Google Meet si se solicita y es online
    let meetLink: string | null = null
    if (createMeet && appointment.appointmentType === "online") {
      try {
        const { createCalendarEvent } = await import("@/lib/google-calendar")
        const eventResult = await createCalendarEvent(appointment)
        if (eventResult) {
          console.log(`Evento creado en Google Calendar: ${eventResult.eventId}`)
          meetLink = eventResult.meetLink
        }
      } catch (error) {
        console.error("Error creando evento en Google Calendar:", error)
        // Continuar aunque falle
      }
    }

    // Cargar configuración para obtener el template de email
    await siteConfigPersistence.load()
    const siteConfig = siteConfigStore.get()

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]

    const formattedDate = `${appointment.date.getDate()} de ${monthNames[appointment.date.getMonth()]}, ${appointment.date.getFullYear()}`
    const price = appointment.appointmentType === "online" ? "20.000" : "27.000"
    const appointmentTypeText = appointment.appointmentType === "online" ? "Online" : "Presencial"

    // Función para reemplazar variables en el template
    const replaceTemplateVars = (template: string): string => {
      return template
        .replace(/\{\{patientName\}\}/g, appointment.patientName)
        .replace(/\{\{date\}\}/g, formattedDate)
        .replace(/\{\{time\}\}/g, appointment.time)
        .replace(/\{\{appointmentType\}\}/g, appointmentTypeText)
        .replace(/\{\{price\}\}/g, price)
        .replace(/\{\{meetLink\}\}/g, meetLink || "")
        .replace(/\{\{#if meetLink\}\}([\s\S]*?)\{\{\/if\}\}/g, meetLink ? "$1" : "")
    }

    // Usar template personalizado si existe
    let emailSubject: string
    let emailBody: string

    if (siteConfig.emailTemplate?.subject && siteConfig.emailTemplate?.body) {
      emailSubject = replaceTemplateVars(siteConfig.emailTemplate.subject)
      emailBody = replaceTemplateVars(siteConfig.emailTemplate.body)
    } else {
      emailSubject = `Sesión Confirmada - ${formattedDate}`
      emailBody = `Estimado/a ${appointment.patientName},\n\nSu sesión ha sido confirmada para:\n- Fecha: ${formattedDate}\n- Hora: ${appointment.time} hrs\n- Modalidad: ${appointmentTypeText}\n- Valor: $${price} CLP${meetLink ? `\n- Enlace de Google Meet: ${meetLink}` : ""}\n\nPor favor, asegúrese de haber realizado el pago por transferencia antes de la sesión.\n\nSaludos cordiales,\nMaría`
    }

    // Convertir el body del template a HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .header {
              background-color: #d1fae5;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              margin: -20px -20px 20px -20px;
            }
            .info-section {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            a {
              color: #4285F4;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✓ Sesión Confirmada</h2>
            </div>
            <div style="white-space: pre-wrap;">${emailBody.replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')}</div>
          </div>
        </body>
      </html>
    `

    const emailText = emailBody

    // Enviar correo al paciente
    if (!process.env.SMTP_PASS) {
      console.log("=== EMAIL AL PACIENTE (SMTP no configurado) ===")
      console.log("To:", appointment.patientEmail)
      console.log("Subject:", emailSubject)
      console.log("Body:", emailText)
      console.log("================================")
    } else {
      await transporter.sendMail({
        from: process.env.SMTP_USER || RECIPIENT_EMAIL,
        to: appointment.patientEmail,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Correo enviado correctamente",
      meetLink,
      emailSubject,
      emailBody,
    })
  } catch (error) {
    console.error("Error enviando correo de confirmación:", error)
    return NextResponse.json(
      { error: "Error al enviar el correo" },
      { status: 500 }
    )
  }
}

/**
 * Obtiene el preset de correo para copiar
 * GET /api/appointments/send-confirmation-email?appointmentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    await appointmentsStore.init()

    const searchParams = request.nextUrl.searchParams
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId es requerido" }, { status: 400 })
    }

    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    await siteConfigPersistence.load()
    const siteConfig = siteConfigStore.get()

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]

    const formattedDate = `${appointment.date.getDate()} de ${monthNames[appointment.date.getMonth()]}, ${appointment.date.getFullYear()}`
    const price = appointment.appointmentType === "online" ? "20.000" : "27.000"
    const appointmentTypeText = appointment.appointmentType === "online" ? "Online" : "Presencial"

    const replaceTemplateVars = (template: string, meetLink?: string): string => {
      return template
        .replace(/\{\{patientName\}\}/g, appointment.patientName)
        .replace(/\{\{date\}\}/g, formattedDate)
        .replace(/\{\{time\}\}/g, appointment.time)
        .replace(/\{\{appointmentType\}\}/g, appointmentTypeText)
        .replace(/\{\{price\}\}/g, price)
        .replace(/\{\{meetLink\}\}/g, meetLink || "[ENLACE_GOOGLE_MEET]")
        .replace(/\{\{#if meetLink\}\}([\s\S]*?)\{\{\/if\}\}/g, meetLink ? "$1" : "")
    }

    let emailSubject: string
    let emailBody: string

    if (siteConfig.emailTemplate?.subject && siteConfig.emailTemplate?.body) {
      emailSubject = replaceTemplateVars(siteConfig.emailTemplate.subject)
      emailBody = replaceTemplateVars(siteConfig.emailTemplate.body)
    } else {
      emailSubject = `Sesión Confirmada - ${formattedDate}`
      emailBody = `Estimado/a ${appointment.patientName},\n\nSu sesión ha sido confirmada para:\n- Fecha: ${formattedDate}\n- Hora: ${appointment.time} hrs\n- Modalidad: ${appointmentTypeText}\n- Valor: $${price} CLP\n- Enlace de Google Meet: [ENLACE_GOOGLE_MEET]\n\nPor favor, asegúrese de haber realizado el pago por transferencia antes de la sesión.\n\nSaludos cordiales,\nMaría`
    }

    return NextResponse.json({
      emailSubject,
      emailBody,
      patientEmail: appointment.patientEmail,
    })
  } catch (error) {
    console.error("Error obteniendo preset de correo:", error)
    return NextResponse.json(
      { error: "Error al obtener el preset" },
      { status: 500 }
    )
  }
}

