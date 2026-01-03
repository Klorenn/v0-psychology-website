import { Resend } from "resend"

// Lazy initialization para evitar errores durante el build
let resendInstance: Resend | null = null

function getResendInstance(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY no está configurado. Configúralo en tus variables de entorno.")
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export interface AppointmentEmailParams {
  patientName: string
  patientEmail: string
  date: string
  time: string
  modality: "online" | "presencial"
  meetLink?: string | null
  location?: string | null
}

export async function sendAppointmentConfirmationEmail(
  params: AppointmentEmailParams
): Promise<{ success: boolean; error?: string; emailId?: string; details?: any }> {
  const {
    patientName,
    patientEmail,
    date,
    time,
    modality,
    meetLink,
    location,
  } = params

  const fromEmail =
    process.env.EMAIL_FROM && process.env.EMAIL_FROM.length > 0
      ? process.env.EMAIL_FROM
      : "onboarding@resend.dev"

  // Template para sesiones presenciales (formato HTML)
  const googleMapsLink = "https://www.google.com/maps/place/Torremolinos+355,+Temuco,+Araucan%C3%ADa/data=!4m2!3m1!1s0x9614d3f59f45ca89:0x76959c5674f732d6?sa=X&ved=1t:242&ictx=111"
  const presencialHtml = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <p>Hola ${patientName.split(" ")[0]},</p>

      <p>Espero que estés muy bien 🌿</p>
      <p>Quería confirmarte los detalles de tu próxima sesión presencial:</p>

      <p>
        🗓 <strong>Fecha:</strong> ${date}<br />
        ⏰ <strong>Hora:</strong> ${time}<br />
        📍 <strong>Modalidad:</strong> Presencial<br />
        💰 <strong>Valor:</strong> $27.000 CLP
      </p>

      <p>
        <strong>🗺️ Dirección:</strong><br />
        Torremolinos 355, Temuco<br />
        <a href="${googleMapsLink}" 
           style="color: #0066cc; text-decoration: none; font-weight: normal;" 
           target="_blank">
          ${googleMapsLink}
        </a>
      </p>

      <p>Para que la sesión se desarrolle con calma y sin apuros, te recomiendo:</p>
      <ul style="margin: 16px 0; padding-left: 20px;">
        <li>🚶 Llegar con unos minutos de anticipación</li>
        <li>📵 Silenciar tu teléfono durante la sesión</li>
        <li>🧘‍♀️ Tomarte un momento previo para respirar y conectar contigo</li>
      </ul>

      <p>Para cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por <strong>transferencia bancaria antes de la sesión</strong>.</p>

      <p>Si antes de la sesión necesitas comentarme algo, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte.</p>

      <p style="margin-top: 32px">
        Un abrazo,<br />
        <strong>María Jesús Chávez</strong><br />
        Psicóloga Clínica
      </p>
    </div>
  `

  // Template para sesiones online (mantener el anterior por compatibilidad)
  const onlineHtml = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6">
      <p>Hola ${patientName},</p>

      <p>Tu sesión ha quedado confirmada con los siguientes detalles:</p>

      <ul>
        <li><strong>Fecha:</strong> ${date}</li>
        <li><strong>Hora:</strong> ${time}</li>
        <li><strong>Modalidad:</strong> Online</li>
      </ul>

      <p>La sesión se realizará de forma online mediante videollamada.</p>
      ${meetLink ? `<p><strong>Enlace:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ""}

      <p>Si necesitas reprogramar o tienes alguna duda, puedes responder a este correo.</p>

      <p style="margin-top: 32px">
        Un abrazo,<br />
        <strong>María Jesús Chavez San Luis</strong><br />
        Psicóloga
      </p>
    </div>
  `

  const html = modality === "presencial" ? presencialHtml : onlineHtml

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[Email] ❌ RESEND_API_KEY no configurado")
      return { success: false, error: "RESEND_API_KEY no está configurado" }
    }

    console.log("[Email] 📧 Configuración de envío:")
    console.log("   - Desde:", fromEmail)
    console.log("   - A:", patientEmail)
    console.log("   - Modalidad:", modality)
    console.log("   - RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Configurado" : "❌ No configurado")

    // Verificar si estamos en sandbox mode
    if (fromEmail === "onboarding@resend.dev") {
      console.warn("[Email] ⚠️ Modo sandbox detectado. Asegúrate de que el email del destinatario esté verificado en Resend.")
      console.warn("[Email] 📝 Verifica emails en: https://resend.com/emails")
    }

    const resend = getResendInstance()
    const result = await resend.emails.send({
      from: fromEmail,
      to: patientEmail,
      subject: "Confirmación de tu sesión",
      html,
    })

    console.log("[Email] ✅ Email enviado correctamente")
    console.log("   - Email ID:", result.data?.id)
    console.log("   - Estado: Enviado a Resend")
    
    // Advertencia sobre sandbox
    if (fromEmail === "onboarding@resend.dev") {
      console.log("[Email] ⚠️ IMPORTANTE: En modo sandbox, el email solo llegará si:")
      console.log("   1. El destinatario está verificado en Resend")
      console.log("   2. Ve a https://resend.com/emails y verifica:", patientEmail)
    }

    return { success: true, emailId: result.data?.id }
  } catch (error: any) {
    console.error("[Email] ❌ Error enviando email:")
    console.error("   - Tipo:", error?.name || "Unknown")
    console.error("   - Mensaje:", error?.message || "Error desconocido")
    
    // Detalles específicos de Resend
    if (error?.response?.body) {
      console.error("   - Detalles de Resend:", JSON.stringify(error.response.body, null, 2))
    }
    
    // Error común: email no verificado en sandbox
    if (error?.message?.includes("unverified") || error?.message?.includes("not verified")) {
      const errorMessage = `El email ${patientEmail} no está verificado en Resend. Ve a https://resend.com/emails y agrégalo como email de prueba.`
      console.error("[Email] 🔴", errorMessage)
      return { 
        success: false, 
        error: errorMessage,
        details: error?.response?.body || error
      }
    }

    const errorMessage = error?.message || "Error desconocido al enviar email"
    const errorDetails = error?.response?.body || error
    
    return { 
      success: false, 
      error: errorMessage,
      details: errorDetails 
    }
  }
}
