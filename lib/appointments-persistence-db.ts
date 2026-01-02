import type { Appointment } from "./appointments-store"
import { getAllAppointments, saveAppointment } from "./db"

export const appointmentsPersistence = {
  async load(): Promise<Appointment[]> {
    try {
      const appointments = await getAllAppointments()
      return appointments
    } catch (error) {
      console.error("Error cargando citas desde DB:", error)
      return []
    }
  },

  async save(appointments: Appointment[]): Promise<void> {
    try {
      // Guardar todas las citas
      for (const appointment of appointments) {
        await saveAppointment(appointment)
      }
    } catch (error) {
      console.error("Error guardando citas en DB:", error)
      throw error
    }
  },
}

