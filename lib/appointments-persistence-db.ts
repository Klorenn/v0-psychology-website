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
            // Continuar aunque falle, para que al menos se guarde en memoria
          }
        } catch (error: any) {
          console.error(`Error guardando cita ${appointment.id}:`, error)
          
          // Si es error de tabla no existe, ya se inicializó automáticamente, reintentar
          if (error?.message?.includes("does not exist") || error?.message?.includes("relation") || error?.code === "42P01") {
            console.log("Reintentando guardar después de inicializar...")
            try {
              const success = await saveAppointment(appointment)
              if (success) {
                continue // Éxito, continuar con la siguiente
              }
            } catch (retryError) {
              console.error("Error en reintento:", retryError)
            }
          }
          
          // Si es error de tamaño, lanzar error específico
          if (error instanceof Error && error.message.includes("value too long")) {
            throw new Error("El comprobante es demasiado grande. Por favor, use un archivo más pequeño (máximo 2MB).")
          }
          
          // Para otros errores, continuar con las demás citas en lugar de fallar todo
          console.warn(`Continuando con otras citas después de error en ${appointment.id}`)
        }
      }
    } catch (error) {
      console.error("Error guardando citas en DB:", error)
      // No lanzar el error, permitir que se guarde al menos en memoria
      console.warn("Las citas se guardaron en memoria aunque hubo error en DB")
    }
  },
}

