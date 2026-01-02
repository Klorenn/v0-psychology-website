import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { validateEmail, validatePhone, validateName, sanitizeName, sanitizePhone, sanitizeString } from "@/lib/validation"

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || ""

// Configuración del transporter de nodemailer
// Nota: En producción, configura estas variables de entorno:
// - SMTP_HOST (ej: smtp.gmail.com)
// - SMTP_PORT (ej: 587)
// - SMTP_USER (tu correo)
// - SMTP_PASS (tu contraseña de aplicación)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || RECIPIENT_EMAIL,
    pass: process.env.SMTP_PASS || "",
  },
})

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { appointmentId, patientName, patientEmail, patientPhone, consultationReason, emergencyContactRelation, emergencyContactName, emergencyContactPhone, appointmentType, date, time } = body

    if (!appointmentId || !patientName || !patientEmail || !patientPhone || !appointmentType || !date || !time) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (!isValidUUID(appointmentId)) {
      return NextResponse.json({ error: "ID de cita inválido" }, { status: 400 })
    }

    if (!validateEmail(patientEmail)) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 })
    }

    if (!validatePhone(patientPhone)) {
      return NextResponse.json({ error: "Número de teléfono inválido" }, { status: 400 })
    }

    if (!validateName(patientName)) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 })
    }

    if (appointmentType !== "online" && appointmentType !== "presencial") {
      return NextResponse.json({ error: "Tipo de cita inválido" }, { status: 400 })
    }

    const appointmentDate = new Date(date)
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    }

    patientName = sanitizeName(patientName)
    patientEmail = sanitizeString(patientEmail).toLowerCase()
    patientPhone = sanitizePhone(patientPhone)
    if (consultationReason) {
      consultationReason = sanitizeString(consultationReason)
    }
    if (emergencyContactRelation) {
      emergencyContactRelation = sanitizeString(emergencyContactRelation)
    }
    if (emergencyContactName) {
      emergencyContactName = sanitizeName(emergencyContactName)
    }
    if (emergencyContactPhone) {
      emergencyContactPhone = sanitizePhone(emergencyContactPhone)
    }
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

    const formattedDate = `${appointmentDate.getDate()} de ${monthNames[appointmentDate.getMonth()]}, ${appointmentDate.getFullYear()}`
    const price = appointmentType === "online" ? "20.000" : "27.000"

    // URL base para aceptar/rechazar (ajusta según tu dominio)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const acceptUrl = `${baseUrl}/api/appointments/confirm?id=${appointmentId}&action=accept`
    const rejectUrl = `${baseUrl}/api/appointments/confirm?id=${appointmentId}&action=reject`

    // Crear el HTML del correo
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
              background-color: #f8f9fa;
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
            .info-row {
              margin: 10px 0;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              color: #333;
            }
            .buttons {
              margin: 30px 0;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              margin: 0 10px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              color: white;
            }
            .button-accept {
              background-color: #22c55e;
            }
            .button-reject {
              background-color: #ef4444;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nueva Solicitud de Cita</h2>
            </div>
            
            <div class="info-section">
              <h3>Información del Paciente</h3>
              <div class="info-row">
                <span class="label">Nombre completo:</span>
                <span class="value">${patientName}</span>
              </div>
              <div class="info-row">
                <span class="label">Correo electrónico:</span>
                <span class="value">${patientEmail}</span>
              </div>
              <div class="info-row">
                <span class="label">Número de teléfono:</span>
                <span class="value">${patientPhone}</span>
              </div>
              ${consultationReason ? `
              <div class="info-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <div style="margin-bottom: 8px;">
                  <span class="label">Motivo de consulta:</span>
                </div>
                <div class="value" style="color: #555; font-style: italic; line-height: 1.6;">
                  ${consultationReason}
                </div>
              </div>
              ` : ""}
            </div>

            ${emergencyContactName && emergencyContactPhone ? `
            <div class="info-section" style="background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <h3>Contacto de Emergencia</h3>
              ${emergencyContactRelation ? `
              <div class="info-row">
                <span class="label">Relación:</span>
                <span class="value">${emergencyContactRelation.charAt(0).toUpperCase() + emergencyContactRelation.slice(1)}</span>
              </div>
              ` : ""}
              <div class="info-row">
                <span class="label">Nombre:</span>
                <span class="value">${emergencyContactName}</span>
              </div>
              <div class="info-row">
                <span class="label">Teléfono:</span>
                <span class="value">${emergencyContactPhone}</span>
              </div>
            </div>
            ` : ""}

            <div class="info-section">
              <h3>Detalles de la Cita</h3>
              <div class="info-row">
                <span class="label">Fecha:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Hora:</span>
                <span class="value">${time} hrs</span>
              </div>
              <div class="info-row">
                <span class="label">Modalidad:</span>
                <span class="value">${appointmentType === "online" ? "Online" : "Presencial"}</span>
              </div>
              <div class="info-row">
                <span class="label">Valor de la consulta:</span>
                <span class="value">$${price} CLP</span>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Importante:</strong> El paciente debe cancelar el monto de $${price} CLP por transferencia y enviar el comprobante por correo antes de que se confirme la cita.
            </div>
            
            <div class="info-section" style="background-color: #dbeafe; border-left: 4px solid #3b82f6;">
              <p><strong>📧 Envío de comprobante</strong></p>
              <p style="font-size: 13px; margin-top: 8px; color: #1e40af;">
                El paciente debe enviar el comprobante de transferencia por correo a: <strong>${RECIPIENT_EMAIL}</strong>
              </p>
              <p style="font-size: 12px; margin-top: 8px; color: #1e40af;">
                El comprobante debe mostrar claramente: banco emisor, monto transferido, número de cuenta destino y fecha.
              </p>
            </div>

            <div class="buttons">
              <a href="${acceptUrl}" class="button button-accept">✓ Aceptar Cita</a>
              <a href="${rejectUrl}" class="button button-reject">✗ Rechazar Cita</a>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Si los botones no funcionan, copia y pega estos enlaces en tu navegador:<br>
              Aceptar: ${acceptUrl}<br>
              Rechazar: ${rejectUrl}
            </p>
          </div>
        </body>
      </html>
    `

    const emailText = `
Nueva Solicitud de Cita

Información del Paciente:
- Nombre completo: ${patientName}
- Correo electrónico: ${patientEmail}
- Número de teléfono: ${patientPhone}
${consultationReason ? `- Motivo de consulta: ${consultationReason}` : ""}
${emergencyContactName && emergencyContactPhone ? `
Contacto de Emergencia:
${emergencyContactRelation ? `- Relación: ${emergencyContactRelation.charAt(0).toUpperCase() + emergencyContactRelation.slice(1)}` : ""}
- Nombre: ${emergencyContactName}
- Teléfono: ${emergencyContactPhone}
` : ""}

Detalles de la Cita:
- Fecha: ${formattedDate}
- Hora: ${time} hrs
- Modalidad: ${appointmentType === "online" ? "Online" : "Presencial"}
- Valor de la consulta: $${price} CLP

⚠️ Importante: El paciente debe cancelar el monto de $${price} CLP por transferencia y enviar el comprobante por correo a ${RECIPIENT_EMAIL} antes de que se confirme la cita.

⚠️ Comprobante pendiente - El paciente debe enviar el comprobante por correo.

Para aceptar la cita, visita: ${acceptUrl}
Para rechazar la cita, visita: ${rejectUrl}
    `

    // Enviar el correo
    const mailOptions = {
      from: process.env.SMTP_USER || RECIPIENT_EMAIL,
      to: RECIPIENT_EMAIL,
      subject: `Nueva Solicitud de Cita - ${patientName}`,
      text: emailText,
      html: emailHtml,
    }

    // Si no hay configuración SMTP, solo loguear (para desarrollo)
    if (!process.env.SMTP_PASS) {
      console.log("=== EMAIL (SMTP no configurado) ===")
      console.log("To:", RECIPIENT_EMAIL)
      console.log("Subject:", mailOptions.subject)
      console.log("Body:", emailText)
      console.log("================================")
      return NextResponse.json({ 
        success: true, 
        message: "Email logged (SMTP not configured)",
        appointmentId 
      })
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      message: "Email enviado correctamente",
      appointmentId 
    })
  } catch (error) {
    console.error("Error enviando correo:", error)
    return NextResponse.json(
      { error: "Error al enviar el correo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

