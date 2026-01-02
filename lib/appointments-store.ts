import { appointmentsPersistence } from "./appointments-persistence"

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "expired"
export type AppointmentType = "online" | "presencial"

export interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  consultationReason?: string
  appointmentType: AppointmentType
  date: Date
  time: string
  status: AppointmentStatus
  createdAt: Date
  expiresAt: Date
  receiptUrl?: string
}

// Global in-memory store
let appointments: Appointment[] = []
let listeners: (() => void)[] = []
let isInitialized = false

// Inicializar desde persistencia
async function initialize() {
  if (isInitialized) return
  try {
    appointments = await appointmentsPersistence.load()
    isInitialized = true
  } catch (error) {
    console.error("Error cargando citas:", error)
    appointments = []
    isInitialized = true
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
  async init() {
    await initialize()
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
    appointments = [...appointments, newAppointment]
    await persist()
    notifyListeners()
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
