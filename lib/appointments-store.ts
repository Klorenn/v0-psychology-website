// Usar DB en producción, JSON en desarrollo
const useDatabase = process.env.POSTGRES_URL !== undefined

let appointmentsPersistence: any

if (useDatabase) {
  // En producción (Vercel con Postgres)
  appointmentsPersistence = require("./appointments-persistence-db").appointmentsPersistence
} else {
  // En desarrollo (archivos JSON)
  appointmentsPersistence = require("./appointments-persistence").appointmentsPersistence
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "expired"
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
    console.log("🔄 Cargando citas desde persistencia...")
    const loadedAppointments = await appointmentsPersistence.load()
    console.log(`✅ Cargadas ${loadedAppointments.length} citas desde persistencia`)
    
    // Convertir fechas de string a Date si es necesario
    const processedAppointments = loadedAppointments.map((apt: any) => ({
      ...apt,
      date: apt.date instanceof Date ? apt.date : new Date(apt.date),
      createdAt: apt.createdAt instanceof Date ? apt.createdAt : new Date(apt.createdAt),
      expiresAt: apt.expiresAt instanceof Date ? apt.expiresAt : new Date(apt.expiresAt),
    }))
    
    appointments = processedAppointments
    isInitialized = true
    console.log(`📊 Store actualizado con ${appointments.length} citas`)
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
    await persist()
    notifyListeners()
  },

  async reject(id: string) {
    await initialize()
    appointments = appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a))
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
