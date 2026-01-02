import type { Appointment } from "./appointments-store"
// Importación dinámica para evitar problemas en el cliente

export const appointmentsPersistence = {
  async load(): Promise<Appointment[]> {
    try {
      // Solo ejecutar en el servidor
      if (typeof window !== "undefined") {
        return []
      }
      
      console.log("🔄 Cargando citas desde Supabase...")
      
      // Importación dinámica solo en el servidor
      const { getAllAppointments } = await import("./db")
      
      // Intentar cargar citas (esto inicializará automáticamente si las tablas no existen)
      const appointments = await getAllAppointments()
      console.log(`✅ Cargadas ${appointments.length} citas desde Supabase`)
      
      if (appointments.length > 0) {
        console.log("📋 Primeras citas cargadas:", appointments.slice(0, 3).map(a => ({
          id: a.id,
          name: a.patientName,
          status: a.status
        })))
      } else {
        console.log("ℹ️ No hay citas aún. La base de datos está lista para recibir nuevas citas.")
      }
      
      return appointments
    } catch (error) {
      console.error("❌ Error cargando citas desde DB:", error)
      // Si es error de tabla no existe, intentar inicializar
      if (error instanceof Error && (error.message.includes("does not exist") || error.message.includes("relation") || error.message.includes("42P01"))) {
        console.log("⚠️ Tablas no existen, inicializando automáticamente...")
        try {
          const { initializeDatabase } = await import("./db")
          await initializeDatabase()
          console.log("✅ Base de datos inicializada, reintentando carga...")
          // Reintentar cargar
          return await getAllAppointments()
        } catch (initError) {
          console.error("❌ Error inicializando base de datos:", initError)
        }
      }
      return []
    }
  },

  async save(appointments: Appointment[]): Promise<void> {
    try {
      // Solo ejecutar en el servidor
      if (typeof window !== "undefined") {
        return
      }
      
      // Importación dinámica solo en el servidor
      const { saveAppointment } = await import("./db")
      
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

