import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"
import { siteConfigStore } from "@/lib/site-config"
import { siteConfigPersistence } from "@/lib/site-config-persistence"
import nodemailer from "nodemailer"

const RECIPIENT_EMAIL = "ps.msanluis@gmail.com"

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

    // Enviar correo de confirmación al paciente
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    const formattedDate = `${appointment.date.getDate()} de ${monthNames[appointment.date.getMonth()]}, ${appointment.date.getFullYear()}`
    const price = appointment.appointmentType === "online" ? "20.000" : "27.000"
    const appointmentTypeText = appointment.appointmentType === "online" ? "Online" : "Presencial"

    // Cargar configuración para obtener el template de email
    await siteConfigPersistence.load()
    const siteConfig = siteConfigStore.get()
    
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

    // Usar template personalizado si existe, sino usar el default
    let emailSubject: string
    let emailBody: string
    
    if (action === "accept" && siteConfig.emailTemplate?.subject && siteConfig.emailTemplate?.body) {
      emailSubject = replaceTemplateVars(siteConfig.emailTemplate.subject)
      emailBody = replaceTemplateVars(siteConfig.emailTemplate.body)
    } else {
      emailSubject = action === "accept" 
        ? `Sesión Confirmada - ${formattedDate}`
        : `Sesión Rechazada - ${formattedDate}`
      emailBody = action === "accept"
        ? `Estimado/a ${appointment.patientName},\n\nSu sesión ha sido confirmada para:\n- Fecha: ${formattedDate}\n- Hora: ${appointment.time} hrs\n- Modalidad: ${appointmentTypeText}\n- Valor: $${price} CLP${meetLink ? `\n- Enlace de Google Meet: ${meetLink}` : ""}\n\nPor favor, asegúrese de haber realizado el pago por transferencia antes de la sesión.\n\nSaludos cordiales,\nMaría`
        : `Estimado/a ${appointment.patientName},\n\nLamento informarle que su solicitud de sesión para el ${formattedDate} a las ${appointment.time} hrs ha sido rechazada.\n\nPor favor, intente agendar otra fecha y hora disponible.\n\nSaludos cordiales,\nMaría`
    }

    // Convertir el body del template a HTML (simple conversión de saltos de línea)
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
              background-color: ${action === "accept" ? "#d1fae5" : "#fee2e2"};
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
              <h2>${action === "accept" ? "✓ Sesión Confirmada" : "✗ Sesión Rechazada"}</h2>
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

    // Redirigir a la página de confirmación
    return NextResponse.redirect(`${baseUrl}/confirm?action=${action}&id=${appointmentId}`)
  } catch (error) {
    console.error("Error confirmando cita:", error)
    return NextResponse.redirect(`${baseUrl}/confirm?error=server_error`)
  }
}

