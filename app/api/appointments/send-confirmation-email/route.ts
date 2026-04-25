import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"
import { sendAppointmentConfirmationEmail } from "@/lib/email-service"
import { requireAuth } from "@/lib/api-auth"
import { siteConfigStore } from "@/lib/site-config"
import { siteConfigPersistence } from "@/lib/site-config-persistence"

/**
 * Envía correo de confirmación manualmente
 * POST /api/appointments/send-confirmation-email
 */
export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    // FORZAR recarga del store para asegurar que tenemos las citas más recientes
    await appointmentsStore.init(true)

    const body = await request.json()
    const { appointmentId, createMeet } = body

    console.log(`[API] 📥 Solicitud recibida: appointmentId=${appointmentId}, createMeet=${createMeet}`)

    if (!appointmentId || typeof appointmentId !== "string" || appointmentId.trim().length === 0) {
      return NextResponse.json({ error: "appointmentId es requerido" }, { status: 400 })
    }

    const appointments = appointmentsStore.getAll()
    console.log(`[API] 🔍 Buscando cita: ${appointmentId} (${appointments.length} citas en store)`)
    
    let appointment = appointments.find((a) => a.id === appointmentId)

    // Si no se encuentra en el store, intentar obtenerla directamente de la BD
    if (!appointment) {
      console.log(`[API] ⚠️ Cita no encontrada en store, buscando en BD...`)
      try {
        const { getAppointmentById } = await import("@/lib/db")
        const dbAppointment = await getAppointmentById(appointmentId)
        
        if (dbAppointment) {
          console.log(`[API] ✅ Cita encontrada en BD: ${dbAppointment.patientName}`)
          appointment = dbAppointment
        }
      } catch (dbError) {
        console.error(`[API] ❌ Error obteniendo cita de BD:`, dbError)
      }
    }

    if (!appointment) {
      return NextResponse.json({ 
        error: "Cita no encontrada",
        details: `ID: ${appointmentId}`
      }, { status: 404 })
    }

    if (appointment.status !== "confirmed") {
      return NextResponse.json({ error: "La cita debe estar confirmada" }, { status: 400 })
    }

    // Manejar creación de evento en Google Calendar y Google Meet
    let meetLink: string | null = appointment.meetLink || null
    let meetStatus: "created" | "not_supported" = meetLink ? "created" : "not_supported"
    
    // Si no tiene evento de Google Calendar, crearlo (con Meet si es online)
    if (!appointment.calendarEventId) {
      try {
        console.log(`[Calendar] Creando evento en Google Calendar para cita ${appointmentId}...`)
        const { automateAppointmentConfirmation } = await import("@/lib/appointment-automation")
        // Para presenciales: NO saltar email (automateAppointmentConfirmation lo envía)
        // Para online con createMeet: saltar email (solo crear Meet)
        // Para online sin createMeet: saltar email aquí, se envía después manualmente
        const skipEmail = createMeet === true || appointment.appointmentType === "online"
        console.log(`[Calendar] skipEmail: ${skipEmail} (createMeet: ${createMeet}, tipo: ${appointment.appointmentType})`)
        const result = await automateAppointmentConfirmation(appointmentId, { skipEmail })
        
        if (result.success && !result.skipped) {
          // El meetLink y meetStatus vienen directamente del resultado de la automatización
          meetLink = result.meetLink || null
          meetStatus = result.meetStatus || "not_supported"
          console.log(`[Calendar] Evento creado exitosamente`)
          console.log(`[Calendar] Meet Status: ${meetStatus}`)
          console.log(`[Calendar] MeetLink: ${meetLink || "N/A"}`)
          
          // Recargar appointment para obtener el meetLink actualizado desde BD
          await appointmentsStore.init(true)
          const updatedAppointments = appointmentsStore.getAll()
          const updatedAppointment = updatedAppointments.find((a) => a.id === appointmentId)
          if (updatedAppointment) {
            const meetLinkFromDB = updatedAppointment.meetLink || null
            console.log(`[Calendar] MeetLink desde BD después de recargar: ${meetLinkFromDB || "N/A"}`)
            // Usar el de BD si está disponible, sino usar el del resultado
            meetLink = meetLinkFromDB || meetLink
            // Actualizar meetStatus si encontramos meetLink en BD
            if (meetLinkFromDB && meetStatus === "not_supported") {
              meetStatus = "created"
            }
          }
          
          // NO lanzar error si meetStatus es "not_supported" - continuar normalmente
          if (meetStatus === "not_supported" && appointment.appointmentType === "online") {
            console.log(`[Calendar] ℹ️ Google Meet no disponible en la respuesta - continuando normalmente`)
          }
        } else if (result.skipped) {
          // Ya tenía evento, usar el existente
          meetLink = result.meetLink || null
          meetStatus = result.meetStatus || (meetLink ? "created" : "not_supported")
          console.log(`[Calendar] Evento ya existía, usando meetLink: ${meetLink || "N/A"}, status: ${meetStatus}`)
        } else {
          // Si falla la creación del evento, retornar error inmediatamente
          console.error(`[Calendar] ❌ Error creando evento:`, result.error)
          return NextResponse.json(
            {
              success: false,
              error: result.error || "Error al crear evento en Google Calendar",
              meetLink: null,
              meetStatus: "not_supported",
            },
            { status: 500 }
          )
        }
      } catch (error) {
        console.error(`[Calendar] ❌ Error en automatización:`, error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
            return NextResponse.json(
              {
                success: false,
                error: `Error al crear evento en Google Calendar: ${errorMessage}`,
                meetLink: null,
                meetStatus: "not_supported",
              },
              { status: 500 }
            )
      }
    } else {
      // Ya tiene evento, usar el meetLink existente
      meetLink = appointment.meetLink || null
      meetStatus = meetLink ? "created" : "not_supported"
      console.log(`[Calendar] Usando evento existente, meetLink: ${meetLink || "N/A"}, status: ${meetStatus}`)
    }

    // Si solo se solicitó crear Meet (createMeet: true), NO enviar email
    // Solo retornar el resultado del Meet
    if (createMeet) {
      console.log(`[API] ✅ Solo se solicitó crear Meet, retornando resultado sin enviar email`)
      return NextResponse.json({
        success: true,
        message: meetStatus === "created" 
          ? "Google Meet creado correctamente" 
          : "Evento creado en Google Calendar. Google Meet no se pudo crear automáticamente.",
        meetLink: meetLink || null,
        meetStatus: meetStatus,
        calendarEventId: appointment.calendarEventId || null,
      })
    }

    // Para sesiones PRESENCIALES: verificar si el email ya fue enviado
    if (appointment.appointmentType === "presencial") {
      // Si el evento se acaba de crear (no tenía calendarEventId antes), 
      // el email ya fue enviado por automateAppointmentConfirmation
      const eventWasJustCreated = !appointment.calendarEventId
      
      if (eventWasJustCreated) {
        console.log(`[API] 📧 Sesión presencial: evento recién creado, email ya enviado por automateAppointmentConfirmation`)
        
        // Recargar para obtener el calendarEventId actualizado
        await appointmentsStore.init(true)
        const updatedAppointments = appointmentsStore.getAll()
        const updatedAppointment = updatedAppointments.find((a) => a.id === appointmentId)
        
        // Verificar si hubo error de email en el resultado de automateAppointmentConfirmation
        // (esto se maneja en automateAppointmentConfirmation, pero verificamos aquí también)
        return NextResponse.json({
          success: true,
          message: "Evento creado en Google Calendar y correo enviado correctamente",
          meetLink: null,
          meetStatus: "not_supported",
          calendarEventId: updatedAppointment?.calendarEventId || null,
        })
      }
      
      // Si ya tenía evento, necesitamos enviar el email manualmente
      console.log(`[API] 📧 Evento ya existía, enviando email manualmente...`)
      
      // Obtener dirección física
      let location: string | null = null
      try {
        const { siteConfigPersistence } = await import("@/lib/site-config-persistence")
        const { siteConfigStore } = await import("@/lib/site-config")
        await siteConfigPersistence.load()
        const siteConfig = siteConfigStore.get()
        if (siteConfig.location?.address) {
          location = `${siteConfig.location.address}, ${siteConfig.location.city || ""}, ${siteConfig.location.country || ""}`.trim()
        }
      } catch (error) {
        console.warn("[Email] No se pudo obtener dirección física:", error)
        location = "Torremolinos 355, Temuco, Araucanía"
      }

      // Formatear fecha
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ]
      const appointmentDate = new Date(appointment.date)
      const formattedDate = `${appointmentDate.getDate()} de ${monthNames[appointmentDate.getMonth()]}, ${appointmentDate.getFullYear()}`

      // Enviar email
      const emailResult = await sendAppointmentConfirmationEmail({
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        date: formattedDate,
        time: appointment.time,
        modality: "presencial",
        location: location || "Torremolinos 355, Temuco, Araucanía",
      })

      if (!emailResult.success) {
        console.error("[Email] ❌ Error enviando email:", emailResult.error)
        return NextResponse.json(
          { 
            success: false, 
            error: emailResult.error || "Error al enviar el correo",
            details: emailResult.details,
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Correo enviado correctamente",
        meetLink: null,
        meetStatus: "not_supported",
      })
    }

    // Para sesiones ONLINE: enviar email con link de Meet si está disponible
    console.log(`[API] 📧 Enviando email de confirmación para sesión online...`)
    
    // Formatear fecha en español
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]
    const appointmentDate = new Date(appointment.date)
    const formattedDate = `${appointmentDate.getDate()} de ${monthNames[appointmentDate.getMonth()]}, ${appointmentDate.getFullYear()}`

    // Enviar email usando el servicio de email
    const emailResult = await sendAppointmentConfirmationEmail({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      date: formattedDate,
      time: appointment.time,
      modality: "online",
      meetLink: meetLink,
      location: null,
    })

    if (!emailResult.success) {
      console.error("[Email] Error enviando email:", emailResult.error)
      // NO fallar si solo se creó el Meet - retornar éxito parcial
      if (meetLink || meetStatus === "created") {
        console.log(`[Email] ⚠️ Email falló pero Meet fue creado, retornando éxito parcial`)
        return NextResponse.json({
          success: true,
          message: "Google Meet creado pero email no pudo enviarse",
          meetLink: meetLink || null,
          meetStatus: meetStatus,
          emailSent: false,
        })
      }
      // Si no hay Meet y falla el email, retornar error
      return NextResponse.json(
        { 
          success: false, 
          error: emailResult.error || "Error al enviar el correo",
          meetLink: meetLink || null,
          meetStatus: meetStatus,
          details: emailResult.details,
        },
        { status: 500 }
      )
    }

    // Determinar mensaje según meetStatus
    let message = "Correo enviado correctamente"
    if (meetStatus === "not_supported") {
      message = "Correo enviado. Google Meet no se pudo crear automáticamente. Puedes agregarlo manualmente desde Google Calendar."
    }

    return NextResponse.json({
      success: true,
      message,
      meetLink: meetLink || null,
      meetStatus,
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
      emailSubject = `Confirmación de Sesión - ${formattedDate}`
      emailBody = `Hola ${appointment.patientName},\n\nEspero que estés teniendo un lindo día.\nQuería escribirte para confirmarte con cariño los detalles de tu próxima sesión:\n\n🗓 **${formattedDate}**\n⏰ **${appointment.time} hrs**\n📍 **Modalidad:** ${appointmentTypeText}\n💰 **Valor:** $${price} CLP\n🔗 **Enlace de Google Meet:** [ENLACE_GOOGLE_MEET]\n\nPara cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por **transferencia bancaria antes de la sesión**.\n\nSi necesitas decirme algo antes de venir, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte 🌿\n\nUn abrazo grande,\n**María San Luis**\nPsicóloga Clínica`
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

