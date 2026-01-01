export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "expired"

export interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  date: Date
  time: string
  status: AppointmentStatus
  createdAt: Date
  expiresAt: Date
}

// Global in-memory store
let appointments: Appointment[] = []
let listeners: (() => void)[] = []

export const appointmentsStore = {
  getAll: () => appointments,

  getPending: () => appointments.filter((a) => a.status === "pending"),

  getConfirmed: () => appointments.filter((a) => a.status === "confirmed"),

  add: (appointment: Omit<Appointment, "id" | "createdAt" | "expiresAt" | "status">) => {
    const now = new Date()
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: now,
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes
    }
    appointments = [...appointments, newAppointment]
    notifyListeners()
    return newAppointment
  },

  approve: (id: string) => {
    appointments = appointments.map((a) => (a.id === id ? { ...a, status: "confirmed" as AppointmentStatus } : a))
    notifyListeners()
  },

  reject: (id: string) => {
    appointments = appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a))
    notifyListeners()
  },

  checkExpired: () => {
    const now = new Date()
    let changed = false
    appointments = appointments.map((a) => {
      if (a.status === "pending" && a.expiresAt < now) {
        changed = true
        return { ...a, status: "expired" as AppointmentStatus }
      }
      return a
    })
    if (changed) notifyListeners()
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
