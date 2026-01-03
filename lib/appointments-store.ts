// Siempre intentar usar DB primero (funciona tanto en cliente como servidor)
// appointments-persistence-db usa API en cliente y BD directa en servidor
let appointmentsPersistence: any

try {
  // Intentar cargar la persistencia de BD (funciona en cliente vía API)
  appointmentsPersistence = require("./appointments-persistence-db").appointmentsPersistence
} catch (error) {
  // Fallback a JSON solo si no se puede cargar la persistencia de BD
  console.warn("No se pudo cargar appointments-persistence-db, usando JSON:", error)
  appointmentsPersistence = require("./appointments-persistence").appointmentsPersistence
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "expired" | "attended"
export type AppointmentType = "online" | "presencial"

export interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  consultationReason?: string
  emergencyContactRelation?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  appointmentType: AppointmentType
  date: Date
  time: string
  status: AppointmentStatus
  createdAt: Date
  expiresAt: Date
  receiptUrl?: string
  receiptData?: string // Base64 del comprobante
  receiptFilename?: string // Nombre original del archivo
  receiptMimetype?: string // Tipo MIME del archivo
  paymentMethod?: "transfer" | "flow" | "webpay"
  mercadoPagoPaymentId?: string // Reutilizado para Flow payment ID y Transbank buy_order
  mercadoPagoPreferenceId?: string
  calendarEventId?: string // ID del evento en Google Calendar
  meetLink?: string // Link de Google Meet (solo para sesiones online)
}

// Global in-memory store
let appointments: Appointment[] = []
let listeners: (() => void)[] = []
let isInitialized = false

// Inicializar desde persistencia
async function initialize(force = false) {
  if (isInitialized && !force) {
    return
  }
  
  // Si se fuerza, resetear el estado de inicialización
  if (force) {
    isInitialized = false
  }
  
  try {
    console.log("🔄 Cargando citas desde persistencia...", { force, wasInitialized: isInitialized })
    const loadedAppointments = await appointmentsPersistence.load()
    console.log(`✅ Cargadas ${loadedAppointments.length} citas desde persistencia`)
    
    if (loadedAppointments.length > 0) {
      console.log("📋 Detalles de citas cargadas:", loadedAppointments.map(a => ({
        id: a.id,
        name: a.patientName,
        status: a.status,
        date: a.date
      })))
    }
    
    // Convertir fechas de string a Date si es necesario
    const processedAppointments = loadedAppointments.map((apt: any) => {
      try {
        return {
          ...apt,
          date: apt.date instanceof Date ? apt.date : new Date(apt.date),
          createdAt: apt.createdAt instanceof Date ? apt.createdAt : new Date(apt.createdAt),
          expiresAt: apt.expiresAt instanceof Date ? apt.expiresAt : new Date(apt.expiresAt),
        }
      } catch (dateError) {
        console.error(`Error procesando fecha de cita ${apt.id}:`, dateError)
        return apt
      }
    })
    
    const previousCount = appointments.length
    appointments = processedAppointments
    isInitialized = true
    
    if (appointments.length !== previousCount) {
      console.log(`📊 Store actualizado: ${previousCount} → ${appointments.length} citas`)
    } else {
      console.log(`📊 Store actualizado con ${appointments.length} citas (sin cambios)`)
    }
    
    notifyListeners() // Notificar después de cargar
  } catch (error) {
    console.error("❌ Error cargando citas:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack)
    }
    appointments = []
    isInitialized = true
    notifyListeners() // Notificar incluso si hay error
  }
}

// Guardar en persistencia
async function persist() {
  try {
    await appointmentsPersistence.save(appointments)
  } catch (error) {
    console.error("Error guardando citas:", error)
  }
}

export const appointmentsStore = {
  async init(force = false) {
    await initialize(force)
  },

  getAll: () => appointments,

  getPending: () => appointments.filter((a) => a.status === "pending"),

  getConfirmed: () => appointments.filter((a) => a.status === "confirmed"),

  async add(appointment: Appointment | Omit<Appointment, "id" | "createdAt" | "expiresAt" | "status">) {
    await initialize()
    const now = new Date()
    const newAppointment: Appointment = {
      ...appointment,
      id: "id" in appointment ? appointment.id : crypto.randomUUID(),
      status: "status" in appointment ? appointment.status : "pending",
      createdAt: "createdAt" in appointment ? appointment.createdAt : now,
      expiresAt: "expiresAt" in appointment ? appointment.expiresAt : new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes
    }
    console.log("➕ Agregando cita:", newAppointment.id, newAppointment.patientName)
    appointments = [...appointments, newAppointment]
    console.log(`📊 Total de citas después de agregar: ${appointments.length}`)
    await persist()
    notifyListeners()
    console.log("✅ Cita agregada y notificada")
    return newAppointment
  },

  async approve(id: string) {
    await initialize()
    appointments = appointments.map((a) => (a.id === id ? { ...a, status: "confirmed" as AppointmentStatus } : a))
    
    // Actualizar estado en BD directamente para asegurar consistencia
    try {
      const { updateAppointmentStatus } = await import("./db")
      await updateAppointmentStatus(id, "confirmed")
    } catch (error) {
      console.error("Error actualizando estado en BD:", error)
      // Continuar aunque falle, al menos se guardará en memoria
    }
    
    await persist()
    notifyListeners()
    
    // La automatización se maneja en la API route /api/appointments/update-status
    // No se importa aquí para evitar problemas con módulos de Node.js en el cliente
  },

  async reject(id: string) {
    await initialize()
    appointments = appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a))
    
    // Actualizar estado en BD directamente para asegurar consistencia
    try {
      const { updateAppointmentStatus } = await import("./db")
      await updateAppointmentStatus(id, "cancelled")
    } catch (error) {
      console.error("Error actualizando estado en BD:", error)
      // Continuar aunque falle, al menos se guardará en memoria
    }
    
    await persist()
    notifyListeners()
  },

  async checkExpired() {
    await initialize()
    const now = new Date()
    let changed = false
    appointments = appointments.map((a) => {
      if (a.status === "pending" && a.expiresAt < now) {
        changed = true
        return { ...a, status: "expired" as AppointmentStatus }
      }
      return a
    })
    if (changed) {
      await persist()
      notifyListeners()
    }
  },

  subscribe: (listener: () => void) => {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}

function notifyListeners() {
  listeners.forEach((l) => l())
}
