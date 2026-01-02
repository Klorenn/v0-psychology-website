import type { Appointment } from "./appointments-store"

// Solo importar fs en el servidor
let fs: typeof import("fs/promises") | null = null
let path: typeof import("path") | null = null

if (typeof window === "undefined") {
  // Estamos en el servidor
  fs = require("fs/promises")
  path = require("path")
}

const DATA_DIR = typeof window === "undefined" ? path!.join(process.cwd(), "data") : ""
const DATA_FILE = typeof window === "undefined" ? path!.join(DATA_DIR, "appointments.json") : ""

// Asegurar que el directorio existe
async function ensureDataDir() {
  if (typeof window !== "undefined" || !fs || !path) return
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // El directorio ya existe o hay un error, continuar
  }
}

// Convertir Appointment a formato serializable
function serializeAppointment(appointment: Appointment) {
  return {
    ...appointment,
    date: appointment.date.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    expiresAt: appointment.expiresAt.toISOString(),
  }
}

// Convertir de formato serializable a Appointment
function deserializeAppointment(data: any): Appointment {
  return {
    ...data,
    date: new Date(data.date),
    createdAt: new Date(data.createdAt),
    expiresAt: new Date(data.expiresAt),
  }
}

export const appointmentsPersistence = {
  async load(): Promise<Appointment[]> {
    // En el cliente, retornar array vacío
    if (typeof window !== "undefined" || !fs || !path) {
      return []
    }
    try {
      await ensureDataDir()
      const data = await fs.readFile(DATA_FILE, "utf-8")
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed.map(deserializeAppointment) : []
    } catch (error) {
      // Si el archivo no existe, retornar array vacío
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return []
      }
      console.error("Error cargando citas:", error)
      return []
    }
  },

  async save(appointments: Appointment[]): Promise<void> {
    // En el cliente, no hacer nada
    if (typeof window !== "undefined" || !fs || !path) {
      return
    }
    try {
      await ensureDataDir()
      const serialized = appointments.map(serializeAppointment)
      await fs.writeFile(DATA_FILE, JSON.stringify(serialized, null, 2), "utf-8")
    } catch (error) {
      console.error("Error guardando citas:", error)
      throw error
    }
  },
}

