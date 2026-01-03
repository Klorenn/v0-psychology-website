/**
 * Google Calendar OAuth 2.0 Integration
 * 
 * Usa OAuth 2.0 para crear eventos en Google Calendar
 * y generar Google Meet automáticamente.
 */

import { google } from "googleapis"
import type { calendar_v3 } from "googleapis"
import { getGoogleCalendarTokens } from "./google-calendar-auth"

/**
 * Inicializa el cliente de Google Calendar usando OAuth 2.0
 * @returns Cliente autenticado de Google Calendar API
 */
async function getCalendarClient(): Promise<calendar_v3.Calendar> {
  // Verificar que estamos en el servidor (Node.js)
  if (typeof window !== "undefined") {
    throw new Error("googleCalendar solo puede usarse en el servidor (API routes)")
  }

  // Obtener tokens OAuth desde la base de datos
  const tokens = await getGoogleCalendarTokens()
  
  if (!tokens || !tokens.accessToken) {
    throw new Error(
      "Google Calendar no está conectado. " +
      "Ve al dashboard y haz clic en 'Conectar con Google Calendar' para autorizar. " +
      "O visita: /api/google-calendar/auth"
    )
  }

  // Crear cliente OAuth2 con las credenciales
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/google-calendar/callback`

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan variables de entorno de Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
    )
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  // Configurar credenciales con los tokens guardados
  auth.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  })

  // Si el token está expirado o está por expirar, refrescarlo automáticamente
  if (tokens.expiryDate && Date.now() >= tokens.expiryDate - 60000) { // Refrescar 1 minuto antes
    try {
      console.log(`[Calendar] 🔄 Token expirado o por expirar, refrescando...`)
      const { credentials } = await auth.refreshAccessToken()
      auth.setCredentials(credentials)
      
      // Guardar tokens actualizados
      const { saveGoogleCalendarTokens } = await import("./google-calendar-auth")
      await saveGoogleCalendarTokens({
        accessToken: credentials.access_token!,
        refreshToken: tokens.refreshToken, // El refresh token no cambia
        expiryDate: credentials.expiry_date || Date.now() + 3600000,
        calendarId: tokens.calendarId,
      })
      console.log(`[Calendar] ✅ Token refrescado exitosamente`)
    } catch (error) {
      console.error(`[Calendar] ❌ Error refrescando token:`, error)
      throw new Error(
        "Error refrescando token de Google Calendar. " +
        "Por favor, reconecta tu cuenta desde el dashboard visitando: /api/google-calendar/auth"
      )
    }
  }

  // Inicializar cliente de Calendar API
  const calendar = google.calendar({
    version: "v3",
    auth,
  })

  return calendar
}

/**
 * Interfaz para los parámetros de creación de evento
 */
export interface CreateCalendarEventParams {
  summary: string
  description: string
  startDate: string // ISO string
  endDate: string // ISO string
  attendees: string[] // Array de emails
  location?: string // Opcional: dirección física
  timeZone?: string // Opcional: timezone (default: America/Santiago)
  modality?: "online" | "presencial" // Modalidad de la sesión
}

/**
 * Interfaz para el resultado de creación de evento
 */
export interface CreateCalendarEventResult {
  eventId: string
  htmlLink: string
  meetLink: string | null
  meetStatus: "created" | "not_supported"
}

/**
 * Obtiene el ID del calendario desde los tokens guardados
 * Si no está disponible, intenta buscar el calendario por email o usa "primary" como fallback
 */
async function getCalendarId(): Promise<string> {
  const tokens = await getGoogleCalendarTokens()
  
  if (tokens?.calendarId) {
    console.log(`[Calendar] ✅ Usando calendarId desde tokens: ${tokens.calendarId}`)
    return tokens.calendarId
  }
  
  // Si tenemos el email del usuario, intentar buscar el calendario por email
  if (tokens?.userEmail) {
    try {
      const calendar = await getCalendarClient()
      console.log(`[Calendar] 🔍 Buscando calendario para: ${tokens.userEmail}`)
      
      // Listar calendarios del usuario
      const calendarList = await calendar.calendarList.list()
      const calendars = calendarList.data.items || []
      
      // Buscar calendario por email o ID
      const targetCalendar = calendars.find((cal: any) => 
        cal.id === tokens.userEmail || 
        cal.id?.includes(tokens.userEmail) ||
        cal.summary === tokens.userEmail ||
        cal.primary === true
      )
      
      if (targetCalendar && targetCalendar.id) {
        console.log(`[Calendar] ✅ Calendario encontrado: ${targetCalendar.id} (${targetCalendar.summary || 'N/A'})`)
        // Guardar el calendarId encontrado para futuras referencias
        if (targetCalendar.id !== tokens.calendarId) {
          const { saveGoogleCalendarTokens } = await import("./google-calendar-auth")
          await saveGoogleCalendarTokens({
            ...tokens,
            calendarId: targetCalendar.id,
          })
          console.log(`[Calendar] 💾 CalendarId guardado: ${targetCalendar.id}`)
        }
        return targetCalendar.id
      }
      
      // Si no se encuentra, usar el calendario principal
      const primaryCalendar = calendars.find((cal: any) => cal.primary === true)
      if (primaryCalendar && primaryCalendar.id) {
        console.log(`[Calendar] ✅ Usando calendario principal: ${primaryCalendar.id}`)
        return primaryCalendar.id
      }
    } catch (error) {
      console.error(`[Calendar] ⚠️ Error buscando calendario por email:`, error)
    }
  }
  
  console.log(`[Calendar] ℹ️ No hay calendarId en tokens, usando "primary"`)
  return "primary"
}

/**
 * Crea un evento en Google Calendar usando OAuth 2.0
 * 
 * @param params Parámetros del evento a crear
 * @returns Resultado con eventId, htmlLink y meetLink
 * @throws Error si falla la creación del evento
 */
export async function createCalendarEvent(
  params: CreateCalendarEventParams
): Promise<CreateCalendarEventResult> {
  const calendar = await getCalendarClient() // Ahora es async
  const timeZone = params.timeZone || "America/Santiago"
  let meetLink: string | null = null

  try {
    // Obtener calendarId desde los tokens guardados
    const calendarId = await getCalendarId()
    
    if (!calendarId) {
      throw new Error("No se pudo determinar el ID del calendario")
    }
    
    // Construir objeto del evento
    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startDate,
        timeZone,
      },
      end: {
        dateTime: params.endDate,
        timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 día antes
          { method: "popup", minutes: 60 }, // 1 hora antes
        ],
      },
    }
    
    // Agregar asistentes
    if (params.attendees && params.attendees.length > 0) {
      event.attendees = params.attendees.map((email) => ({ email }))
    }

    // Agregar Google Meet para sesiones online
    if (params.modality === "online") {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      }
    }

    // Agregar location si está presente (para sesiones presenciales)
    if (params.location) {
      event.location = params.location
    }
    
    console.log(`[Calendar] 📅 Creando evento: ${event.summary} en ${calendarId}`)
    console.log(`[Calendar] 📅 ${event.start?.dateTime} - ${event.end?.dateTime}`)
    
    // Crear evento con Google Meet si es sesión online
    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
      conferenceDataVersion: params.modality === "online" ? 1 : 0,
    })
    
    console.log(`[Calendar] ✅ Respuesta recibida de Google Calendar API`)

    const createdEvent = response.data

    console.log(`[Calendar] 📦 Respuesta completa del evento:`, {
      id: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
      summary: createdEvent.summary,
      hasConferenceData: !!createdEvent.conferenceData,
    })

    if (!createdEvent.id || !createdEvent.htmlLink) {
      console.error(`[Calendar] ❌ El evento se creó pero falta información esencial:`, {
        hasId: !!createdEvent.id,
        hasHtmlLink: !!createdEvent.htmlLink,
        eventData: createdEvent,
      })
      throw new Error("El evento se creó pero falta información esencial (id o htmlLink)")
    }

    console.log(`[Calendar] ✅ Evento creado: ${createdEvent.id}`)

    // Obtener Google Meet link si se creó
    let meetStatus: "created" | "not_supported" = "not_supported"
    
    if (params.modality === "online") {
      if (createdEvent.conferenceData?.entryPoints && createdEvent.conferenceData.entryPoints.length > 0) {
        meetLink = createdEvent.conferenceData.entryPoints[0].uri || null
        if (meetLink) {
          meetStatus = "created"
          console.log(`[Calendar] 🎥 Google Meet creado correctamente: ${meetLink}`)
        }
      } else {
        console.log(`[Calendar] 🚫 Google Meet NO disponible en la respuesta`)
        meetStatus = "not_supported"
      }
    }

    return {
      eventId: createdEvent.id,
      htmlLink: createdEvent.htmlLink,
      meetLink,
      meetStatus,
    }
  } catch (error) {
    console.error("[Calendar] ❌ Error creando evento en Google Calendar:", error)
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error("[Calendar] ❌ Mensaje de error:", error.message)
      console.error("[Calendar] ❌ Stack:", error.stack)
    }
    
    // Si es un error de la API de Google, extraer más detalles
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as any
      console.error("[Calendar] ❌ Respuesta de la API:", apiError.response?.data)
      console.error("[Calendar] ❌ Status code:", apiError.response?.status)
    }

    // Mejorar mensajes de error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes("authentication") || errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
        throw new Error(
          "Error de autenticación con Google Calendar. Por favor, reconecta tu cuenta desde el dashboard visitando: /api/google-calendar/auth"
        )
      }
      if (errorMessage.includes("permission") || errorMessage.includes("forbidden") || errorMessage.includes("403")) {
        throw new Error(
          `Error de permisos con Google Calendar. Por favor, reconecta tu cuenta desde el dashboard visitando: /api/google-calendar/auth`
        )
      }
      if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        throw new Error(
          `Calendario no encontrado. Por favor, reconecta tu cuenta desde el dashboard visitando: /api/google-calendar/auth`
        )
      }
      
      // Si es un error de la API de Google, intentar extraer el mensaje
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as any
        const apiErrorMessage = apiError.response?.data?.error?.message || error.message
        throw new Error(`Error de Google Calendar API: ${apiErrorMessage}`)
      }
      
      throw error
    }

    throw new Error(
      `Error desconocido al crear evento en Google Calendar: ${String(error)}`
    )
  }
}

/**
 * Obtiene horarios disponibles en una fecha específica
 * 
 * @param date Fecha para consultar disponibilidad
 * @param timeZone Timezone (default: America/Santiago)
 * @returns Array de horarios disponibles en formato HH:mm
 */
export async function getAvailableSlots(
  date: Date,
  timeZone: string = "America/Santiago"
): Promise<string[]> {
  const calendar = await getCalendarClient() // Ahora es async
  const calendarId = await getCalendarId()
  const DEFAULT_SLOTS = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ]

  try {
    const timeMin = new Date(date)
    timeMin.setHours(0, 0, 0, 0)

    const timeMax = new Date(date)
    timeMax.setHours(23, 59, 59, 999)

    // Consultar horarios ocupados
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone,
        items: [{ id: calendarId }],
      },
    })

    const busySlots = response.data.calendars?.[calendarId]?.busy || []

    // Filtrar horarios ocupados
    const availableSlots = DEFAULT_SLOTS.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number)
      const slotStart = new Date(date)
      slotStart.setHours(hours, minutes, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setHours(hours + 1, 0, 0, 0)

      return !busySlots.some((busy) => {
        if (!busy.start || !busy.end) return false
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return slotStart < busyEnd && slotEnd > busyStart
      })
    })

    return availableSlots
  } catch (error) {
    console.error("[Calendar] Error obteniendo horarios disponibles:", error)
    // Retornar slots por defecto si falla
    return DEFAULT_SLOTS
  }
}

