import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"
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
      try {
        const { createCalendarEvent } = await import("@/lib/google-calendar")
        const eventId = await createCalendarEvent(appointment)
        if (eventId) {
          console.log(`Evento creado en Google Calendar: ${eventId}`)
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

    const emailSubject = action === "accept" 
      ? `Cita Confirmada - ${formattedDate}`
      : `Cita Rechazada - ${formattedDate}`

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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${action === "accept" ? "✓ Cita Confirmada" : "✗ Cita Rechazada"}</h2>
            </div>
            
            <p>Estimado/a ${appointment.patientName},</p>
            
            ${action === "accept" 
              ? `
                <p>Su cita ha sido <strong>confirmada</strong> para:</p>
                <div class="info-section">
                  <p><strong>Fecha:</strong> ${formattedDate}</p>
                  <p><strong>Hora:</strong> ${appointment.time} hrs</p>
                  <p><strong>Modalidad:</strong> ${appointment.appointmentType === "online" ? "Online" : "Presencial"}</p>
                  <p><strong>Valor:</strong> $${price} CLP</p>
                </div>
                <p>Por favor, asegúrese de haber realizado el pago por transferencia antes de la cita.</p>
              `
              : `
                <p>Lamento informarle que su solicitud de cita para el ${formattedDate} a las ${appointment.time} hrs ha sido rechazada.</p>
                <p>Por favor, intente agendar otra fecha y hora disponible.</p>
              `
            }
            
            <p>Saludos cordiales,<br>María</p>
          </div>
        </body>
      </html>
    `

    const emailText = action === "accept"
      ? `
Estimado/a ${appointment.patientName},

Su cita ha sido confirmada para:
- Fecha: ${formattedDate}
- Hora: ${appointment.time} hrs
- Modalidad: ${appointment.appointmentType === "online" ? "Online" : "Presencial"}
- Valor: $${price} CLP

Por favor, asegúrese de haber realizado el pago por transferencia antes de la cita.

Saludos cordiales,
María
      `
      : `
Estimado/a ${appointment.patientName},

Lamento informarle que su solicitud de cita para el ${formattedDate} a las ${appointment.time} hrs ha sido rechazada.

Por favor, intente agendar otra fecha y hora disponible.

Saludos cordiales,
María
      `

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

