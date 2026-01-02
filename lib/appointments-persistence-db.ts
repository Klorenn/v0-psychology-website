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
        try {
          const success = await saveAppointment(appointment)
          if (!success) {
            console.warn(`No se pudo guardar la cita ${appointment.id} (probablemente no hay DB configurada)`)
          }
        } catch (error) {
          console.error(`Error guardando cita ${appointment.id}:`, error)
          // Continuar con las demás citas en lugar de fallar todo
          if (error instanceof Error && error.message.includes("value too long")) {
            throw new Error("El comprobante es demasiado grande. Por favor, use un archivo más pequeño (máximo 2MB).")
          }
          throw error
        }
      }
    } catch (error) {
      console.error("Error guardando citas en DB:", error)
      throw error
    }
  },
}

