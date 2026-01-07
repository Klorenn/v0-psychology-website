import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { validateEmail, validatePhone, validateName, sanitizeName, sanitizePhone, sanitizeString } from "@/lib/validation"
import { appointmentsStore } from "@/lib/appointments-store"
import { getSantiagoDateTime } from "@/lib/timezone-service"

// Email del administrador que recibirá las notificaciones de nuevas citas
// IMPORTANTE: En Resend sandbox, solo puedes enviar a emails verificados
// Ve a https://resend.com/emails y verifica tu email en "Test Emails"
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || process.env.ADMIN_EMAIL || "admin@example.com"

// Lazy initialization de Resend para evitar errores durante el build
function getResendInstance() {
  const { Resend } = require("resend")
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no está configurado")
  }
  return new Resend(apiKey)
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function POST(request: NextRequest) {
  // Este endpoint es público - los usuarios pueden crear citas sin autenticación
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

    // Validar teléfono según el tipo de atención
    const isOnline = appointmentType === "online"
    if (!validatePhone(patientPhone, isOnline)) {
      return NextResponse.json({ error: "Número de teléfono inválido" }, { status: 400 })
    }

    // Validar teléfono de contacto de emergencia si está presente (siempre como internacional)
    if (emergencyContactPhone && !validatePhone(emergencyContactPhone, true)) {
      return NextResponse.json({ error: "Número de teléfono de contacto de emergencia inválido" }, { status: 400 })
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

    // IMPORTANTE: Guardar la cita en la base de datos PRIMERO
    try {
      console.log("💾 Guardando cita en base de datos...", appointmentId)
      await appointmentsStore.add({
        id: appointmentId,
        patientName,
        patientEmail,
        patientPhone,
        consultationReason: consultationReason || undefined,
        emergencyContactRelation: emergencyContactRelation || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        appointmentType,
        date: appointmentDate,
        time,
        status: "pending",
        createdAt: await getSantiagoDateTime(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas para enviar el comprobante
        paymentMethod: "transfer",
      })
      console.log("✅ Cita guardada en base de datos:", appointmentId)
    } catch (dbError) {
      console.error("❌ Error guardando cita en base de datos:", dbError)
      // Continuar aunque falle el guardado, para que al menos se intente enviar el email
      // Pero retornar error para que el cliente sepa que algo falló
      return NextResponse.json(
        { 
          error: "Error al guardar la cita en la base de datos", 
          details: dbError instanceof Error ? dbError.message : "Unknown error" 
        },
        { status: 500 }
      )
    }

    // Enviar email usando Resend
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"
    
    if (!RECIPIENT_EMAIL || RECIPIENT_EMAIL === "") {
      console.warn("[Email] RECIPIENT_EMAIL no configurado, no se enviará email de notificación")
      return NextResponse.json({ 
        success: true, 
        message: "Cita guardada. Email no enviado (RECIPIENT_EMAIL no configurado)",
        appointmentId 
      })
    }

    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("[Email] RESEND_API_KEY no configurado, no se enviará email")
        return NextResponse.json({ 
          success: true, 
          message: "Cita guardada. Email no enviado (RESEND_API_KEY no configurado)",
          appointmentId 
        })
      }

      console.log(`[Email] Enviando notificación a: ${RECIPIENT_EMAIL}`)
      console.log(`[Email] Desde: ${fromEmail}`)
      
      const resend = getResendInstance()
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: RECIPIENT_EMAIL,
        subject: `Nueva Solicitud de Cita - ${patientName}`,
        html: emailHtml,
        text: emailText,
      })

      console.log(`[Email] ✅ Email enviado correctamente. ID: ${emailResult.data?.id}`)
      console.log(`[Email] 📧 Destinatario: ${RECIPIENT_EMAIL}`)
      
      // Advertencia si está en sandbox
      if (fromEmail === "onboarding@resend.dev") {
        console.warn(`[Email] ⚠️ Estás usando Resend en modo sandbox. Asegúrate de que ${RECIPIENT_EMAIL} esté verificado en https://resend.com/emails`)
      }
    } catch (emailError: any) {
      console.error("[Email] ❌ Error enviando email de notificación:", emailError)
      
      // Mensaje más específico según el tipo de error
      let errorMessage = "Error al enviar email"
      if (emailError?.message?.includes("not verified") || emailError?.message?.includes("not in allowed list")) {
        errorMessage = `El email ${RECIPIENT_EMAIL} no está verificado en Resend. Ve a https://resend.com/emails y agrégalo a "Test Emails" para modo sandbox.`
        console.error(`[Email] ⚠️ ${errorMessage}`)
      } else if (emailError?.message) {
        errorMessage = emailError.message
      }
      
      // Si falla el envío pero la cita ya está guardada, retornar éxito parcial
      // El email se puede enviar manualmente después
      return NextResponse.json({ 
        success: true, 
        message: "Cita guardada correctamente. Error al enviar email (puedes ver la cita en el dashboard)",
        appointmentId,
        emailError: true,
        emailErrorMessage: errorMessage
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cita guardada y email enviado correctamente",
      appointmentId 
    })
  } catch (error) {
    console.error("Error enviando correo:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error details:", errorMessage)
    return NextResponse.json(
      { error: errorMessage || "Error al enviar el correo", details: errorMessage },
      { status: 500 }
    )
  }
}

