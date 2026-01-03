/**
 * Servicio para obtener la hora actual de Santiago usando WorldTimeAPI
 */

export interface SantiagoTime {
  datetime: string
  utc_datetime: string
  timezone: string
  utc_offset: string
  day_of_week: number
  day_of_year: number
  unixtime: number
  abbreviation: string
  dst: boolean
}

/**
 * Obtiene la hora actual de Santiago, Chile
 * @returns Información de tiempo de Santiago
 */
export async function getSantiagoTime(): Promise<SantiagoTime> {
  try {
    const response = await fetch("http://worldtimeapi.org/api/timezone/America/Santiago", {
      next: { revalidate: 60 }, // Cache por 60 segundos
    })

    if (!response.ok) {
      throw new Error(`Error obteniendo hora de Santiago: ${response.statusText}`)
    }

    const data = await response.json()
    return data as SantiagoTime
  } catch (error) {
    console.error("[Timezone] Error obteniendo hora de Santiago:", error)
    // Fallback a hora local si falla la API
    const now = new Date()
    return {
      datetime: now.toISOString(),
      utc_datetime: now.toUTCString(),
      timezone: "America/Santiago",
      utc_offset: "-03:00",
      day_of_week: now.getDay(),
      day_of_year: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000),
      unixtime: Math.floor(now.getTime() / 1000),
      abbreviation: "-03",
      dst: true,
    }
  }
}

/**
 * Obtiene la fecha y hora actual de Santiago como Date object
 * IMPORTANTE: El datetime de la API viene como "2026-01-03T18:13:38.812771-03:00"
 * JavaScript interpreta esto correctamente y crea un Date que representa esa hora exacta
 * Cuando se guarda con toISOString(), se convierte a UTC (ej: "2026-01-03T21:13:38.812Z")
 * Al leer y formatear con timeZone: "America/Santiago", se convierte de vuelta correctamente
 */
export async function getSantiagoDateTime(): Promise<Date> {
  const timeData = await getSantiagoTime()
  // El datetime de la API viene en formato ISO con timezone: "2026-01-03T18:13:38.812771-03:00"
  // new Date() interpreta esto correctamente y crea un Date object
  // Este Date representa el momento exacto en Santiago
  const date = new Date(timeData.datetime)
  console.log(`[Timezone] Hora de Santiago obtenida: ${timeData.datetime} -> ${date.toISOString()}`)
  return date
}

/**
 * Obtiene la fecha y hora de Santiago formateada para mostrar
 * Esta función asegura que se muestre la hora correcta de Santiago
 */
export function formatSantiagoDateTimeFromDate(date: Date): string {
  // Crear un formatter que muestre la fecha en hora de Santiago
  const formatter = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  
  const parts = formatter.formatToParts(date)
  const day = parts.find(p => p.type === "day")?.value || date.getDate().toString()
  const month = parts.find(p => p.type === "month")?.value || ""
  const hour = parts.find(p => p.type === "hour")?.value || date.getHours().toString().padStart(2, "0")
  const minute = parts.find(p => p.type === "minute")?.value || date.getMinutes().toString().padStart(2, "0")
  
  // Capitalizar el mes
  const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1)
  
  return `${day} de ${monthCapitalized} a las ${hour}:${minute}`
}

/**
 * Formatea la fecha y hora de Santiago en formato legible
 */
export async function formatSantiagoDateTime(date?: Date): Promise<string> {
  const santiagoDate = date || (await getSantiagoDateTime())
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }

  return new Intl.DateTimeFormat("es-CL", options).format(santiagoDate)
}

/**
 * Obtiene solo la hora actual de Santiago (HH:MM)
 */
export async function getSantiagoTimeString(): Promise<string> {
  const timeData = await getSantiagoTime()
  const date = new Date(timeData.datetime)
  
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  
  return `${hours}:${minutes}`
}

