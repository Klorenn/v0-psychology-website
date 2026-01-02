import { neon } from "@neondatabase/serverless"

// Obtener la conexión SQL solo si POSTGRES_URL está disponible (Supabase)
export function getDatabaseConnection() {
  // Vercel agrega variables con prefijo "storage_" cuando conectas Supabase desde el dashboard
  // Priorizar NON_POOLING porque puede tener mejor compatibilidad con Vercel
  const dbUrl = 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.storage_POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL || 
    process.env.storage_POSTGRES_URL
  
  if (!dbUrl) {
    return null
  }
  
  // Configurar neon para mejor compatibilidad en Vercel
  try {
    return neon(dbUrl)
  } catch (error) {
    console.error("Error creando conexión neon:", error)
    return null
  }
}

/**
 * Inicializar tablas de la base de datos
 */
export async function initializeDatabase() {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    const dbUrl = 
      process.env.POSTGRES_URL || 
      process.env.storage_POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING || 
      process.env.storage_POSTGRES_URL_NON_POOLING
    const errorMsg = !dbUrl 
      ? "POSTGRES_URL o storage_POSTGRES_URL no están configurados. Si conectaste Supabase desde Vercel, las variables deberían tener el prefijo 'storage_'. Verifica en Vercel Settings → Environment Variables."
      : "No se pudo establecer conexión con la base de datos. Verifica que las credenciales sean correctas."
    throw new Error(errorMsg)
  }
  
  try {
    // Crear tabla de citas
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        patient_email TEXT NOT NULL,
        patient_phone TEXT NOT NULL,
        consultation_reason TEXT,
        emergency_contact_relation TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        appointment_type TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        receipt_url TEXT,
        receipt_data TEXT,
        receipt_filename TEXT,
        receipt_mimetype TEXT,
        payment_method TEXT,
        payment_id TEXT
      )
    `

    // Crear índice por fecha para búsquedas rápidas
    await sql`
      CREATE INDEX IF NOT EXISTS idx_appointments_date 
      ON appointments(date)
    `

    // Crear índice por estado
    await sql`
      CREATE INDEX IF NOT EXISTS idx_appointments_status 
      ON appointments(status)
    `

    // Crear tabla de configuración del sitio
    await sql`
      CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        config JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Crear tabla de tokens de Google Calendar
    await sql`
      CREATE TABLE IF NOT EXISTS google_calendar_tokens (
        id INTEGER PRIMARY KEY DEFAULT 1,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expiry_date BIGINT NOT NULL,
        calendar_id TEXT,
        user_email TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Agregar columna user_email si no existe (para migraciones)
    try {
      await sql`
        ALTER TABLE google_calendar_tokens 
        ADD COLUMN IF NOT EXISTS user_email TEXT
      `
    } catch (error) {
      // Ignorar si la columna ya existe
      console.log("Columna user_email ya existe o no se pudo agregar")
    }

    // Agregar columnas de contacto de emergencia si no existen (para migraciones)
    try {
      await sql`
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT
      `
    } catch (error) {
      console.log("Columna emergency_contact_relation ya existe o no se pudo agregar")
    }
    
    try {
      await sql`
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT
      `
    } catch (error) {
      console.log("Columna emergency_contact_name ya existe o no se pudo agregar")
    }
    
    try {
      await sql`
        ALTER TABLE appointments 
        ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT
      `
    } catch (error) {
      console.log("Columna emergency_contact_phone ya existe o no se pudo agregar")
    }

    console.log("✅ Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error inicializando base de datos:", error)
    throw error
  }
}

/**
 * Guardar una cita en la base de datos
 * Inicializa automáticamente las tablas si no existen
 */
export async function saveAppointment(appointment: any) {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    console.warn("⚠️ No hay conexión a base de datos (POSTGRES_URL no configurado)")
    console.warn("Variables disponibles:", {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasStoragePostgresUrl: !!process.env.storage_POSTGRES_URL,
      hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
      hasStoragePostgresUrlNonPooling: !!process.env.storage_POSTGRES_URL_NON_POOLING,
    })
    return false
  }
  
  try {
    console.log(`💾 Intentando guardar cita ${appointment.id} en BD...`)
    // Intentar guardar primero
    const result = await trySaveAppointment(sql, appointment)
    console.log(`✅ Cita ${appointment.id} guardada exitosamente en BD`)
    return result
  } catch (error: any) {
    console.error(`❌ Error guardando cita ${appointment.id}:`, error)
    
    // Si el error es porque la tabla no existe, inicializar y reintentar
    if (error?.message?.includes("does not exist") || error?.message?.includes("relation") || error?.code === "42P01") {
      console.log("⚠️ Tablas no existen, inicializando automáticamente...")
      try {
        await initializeDatabase()
        console.log("✅ Base de datos inicializada automáticamente")
        // Reintentar guardar
        const result = await trySaveAppointment(sql, appointment)
        console.log(`✅ Cita ${appointment.id} guardada después de inicializar`)
        return result
      } catch (initError) {
        console.error("❌ Error inicializando base de datos:", initError)
        throw initError
      }
    }
    
    // Si es error de conexión
    if (error?.message?.includes("fetch failed") || error?.message?.includes("connection") || error?.message?.includes("ECONNREFUSED")) {
      console.error("❌ Error de conexión a la base de datos")
      console.error("Verifica que POSTGRES_URL esté configurado correctamente en Vercel")
      throw new Error("Error de conexión a la base de datos. Verifica las variables de entorno.")
    }
    
    // Si es otro error, lanzarlo
    console.error("Error details:", error?.message, error?.code, error?.stack)
    throw error
  }
}

/**
 * Intentar guardar una cita (sin inicialización)
 */
async function trySaveAppointment(sql: any, appointment: any): Promise<boolean> {
  // Limitar tamaño de receipt_data si es muy grande
  let receiptData = appointment.receiptData || null
  if (receiptData && receiptData.length > 10485760) { // 10MB en caracteres base64
    console.warn(`Receipt data muy grande (${(receiptData.length / 1024 / 1024).toFixed(2)}MB), truncando`)
    receiptData = receiptData.substring(0, 10485760)
  }

  await sql`
    INSERT INTO appointments (
      id, patient_name, patient_email, patient_phone, consultation_reason,
      emergency_contact_relation, emergency_contact_name, emergency_contact_phone,
      appointment_type, date, time, status, created_at, expires_at,
      receipt_url, receipt_data, receipt_filename, receipt_mimetype,
      payment_method, payment_id
    ) VALUES (
      ${appointment.id},
      ${appointment.patientName},
      ${appointment.patientEmail},
      ${appointment.patientPhone},
      ${appointment.consultationReason || null},
      ${appointment.emergencyContactRelation || null},
      ${appointment.emergencyContactName || null},
      ${appointment.emergencyContactPhone || null},
      ${appointment.appointmentType},
      ${appointment.date.toISOString()},
      ${appointment.time},
      ${appointment.status},
      ${appointment.createdAt.toISOString()},
      ${appointment.expiresAt.toISOString()},
      ${appointment.receiptUrl || null},
      ${receiptData},
      ${appointment.receiptFilename || null},
      ${appointment.receiptMimetype || null},
      ${appointment.paymentMethod || null},
      ${appointment.mercadoPagoPaymentId || null}
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      patient_name = EXCLUDED.patient_name,
      patient_email = EXCLUDED.patient_email,
      patient_phone = EXCLUDED.patient_phone,
      consultation_reason = EXCLUDED.consultation_reason,
      emergency_contact_relation = EXCLUDED.emergency_contact_relation,
      emergency_contact_name = EXCLUDED.emergency_contact_name,
      emergency_contact_phone = EXCLUDED.emergency_contact_phone,
      appointment_type = EXCLUDED.appointment_type,
      date = EXCLUDED.date,
      time = EXCLUDED.time,
      status = EXCLUDED.status,
      expires_at = EXCLUDED.expires_at,
      receipt_url = EXCLUDED.receipt_url,
      receipt_data = EXCLUDED.receipt_data,
      receipt_filename = EXCLUDED.receipt_filename,
      receipt_mimetype = EXCLUDED.receipt_mimetype,
      payment_method = EXCLUDED.payment_method,
      payment_id = EXCLUDED.payment_id
  `
  return true
}

/**
 * Obtener todas las citas
 * Inicializa automáticamente las tablas si no existen
 */
export async function getAllAppointments() {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    console.warn("⚠️ No hay conexión a base de datos (POSTGRES_URL no configurado)")
    return []
  }
  
  try {
    console.log("🔍 Consultando citas en Supabase...")
    const result = await sql`
      SELECT * FROM appointments 
      ORDER BY created_at DESC
    `
    
    console.log(`📊 Resultado de consulta: ${result.length} filas encontradas`)
    
    if (result.length === 0) {
      console.log("ℹ️ No hay citas en la base de datos")
      return []
    }
    
    const mappedAppointments = result.map((row: any) => {
      try {
        return {
          id: row.id,
          patientName: row.patient_name,
          patientEmail: row.patient_email,
          patientPhone: row.patient_phone,
          consultationReason: row.consultation_reason || undefined,
          emergencyContactRelation: row.emergency_contact_relation || undefined,
          emergencyContactName: row.emergency_contact_name || undefined,
          emergencyContactPhone: row.emergency_contact_phone || undefined,
          appointmentType: row.appointment_type,
          date: row.date instanceof Date ? row.date : new Date(row.date),
          time: row.time,
          status: row.status,
          createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
          expiresAt: row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at),
          receiptUrl: row.receipt_url || undefined,
          receiptData: row.receipt_data || undefined,
          receiptFilename: row.receipt_filename || undefined,
          receiptMimetype: row.receipt_mimetype || undefined,
          paymentMethod: row.payment_method || undefined,
          mercadoPagoPaymentId: row.payment_id || undefined,
        }
      } catch (mapError) {
        console.error(`Error mapeando cita ${row.id}:`, mapError)
        return null
      }
    }).filter((apt: any): apt is NonNullable<typeof apt> => apt !== null)
    
    console.log(`✅ Mapeadas ${mappedAppointments.length} citas correctamente`)
    if (mappedAppointments.length > 0) {
      console.log("📋 Ejemplo de cita mapeada:", {
        id: mappedAppointments[0].id,
        name: mappedAppointments[0].patientName,
        status: mappedAppointments[0].status,
        date: mappedAppointments[0].date
      })
    }
    return mappedAppointments
  } catch (error: any) {
    // Si el error es porque la tabla no existe, inicializar y retornar vacío
    if (error?.message?.includes("does not exist") || error?.message?.includes("relation") || error?.code === "42P01") {
      console.log("⚠️ Tablas no existen, inicializando automáticamente...")
      try {
        await initializeDatabase()
        console.log("✅ Base de datos inicializada automáticamente")
        return [] // Retornar vacío después de inicializar
      } catch (initError) {
        console.error("❌ Error inicializando base de datos:", initError)
        return []
      }
    }
    console.error("❌ Error obteniendo citas:", error)
    
    // Si es error de conexión
    if (error?.message?.includes("fetch failed") || error?.message?.includes("connection") || error?.message?.includes("ECONNREFUSED")) {
      console.error("❌ Error de conexión a la base de datos")
      console.error("Verifica que POSTGRES_URL esté configurado correctamente en Vercel")
    }
    
    console.error("Detalles del error:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    })
    return []
  }
}

/**
 * Actualizar estado de una cita
 */
export async function updateAppointmentStatus(id: string, status: string) {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    return false
  }
  
  try {
    await sql`
      UPDATE appointments 
      SET status = ${status}
      WHERE id = ${id}
    `
    return true
  } catch (error) {
    console.error("Error actualizando estado:", error)
    return false
  }
}

/**
 * Obtener configuración del sitio
 */
export async function getSiteConfig() {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    return null
  }
  
  try {
    const result = await sql`
      SELECT config FROM site_config WHERE id = 1
    `
    
    if (result.length > 0) {
      return result[0].config
    }
    return null
  } catch (error) {
    console.error("Error obteniendo configuración:", error)
    return null
  }
}

/**
 * Guardar configuración del sitio
 */
export async function saveSiteConfig(config: any) {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    return false
  }
  
  try {
    await sql`
      INSERT INTO site_config (id, config, updated_at)
      VALUES (1, ${JSON.stringify(config)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET 
        config = EXCLUDED.config,
        updated_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error("Error guardando configuración:", error)
    return false
  }
}

/**
 * Guardar tokens de Google Calendar
 */
export async function saveGoogleTokens(tokens: any) {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    return false
  }
  
  try {
    await sql`
      INSERT INTO google_calendar_tokens (
        id, access_token, refresh_token, expiry_date, calendar_id, user_email, updated_at
      )
      VALUES (
        1, 
        ${tokens.accessToken},
        ${tokens.refreshToken},
        ${tokens.expiryDate},
        ${tokens.calendarId || null},
        ${tokens.userEmail || null},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expiry_date = EXCLUDED.expiry_date,
        calendar_id = EXCLUDED.calendar_id,
        user_email = EXCLUDED.user_email,
        updated_at = CURRENT_TIMESTAMP
    `
    return true
  } catch (error) {
    console.error("Error guardando tokens de Google:", error)
    return false
  }
}

/**
 * Obtener tokens de Google Calendar
 */
export async function getGoogleTokens() {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    return null
  }
  
  try {
    const result = await sql`
      SELECT * FROM google_calendar_tokens WHERE id = 1
    `
    
    if (result.length > 0) {
      const row = result[0]
      return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiryDate: parseInt(row.expiry_date),
        calendarId: row.calendar_id,
        userEmail: row.user_email,
      }
    }
    return null
  } catch (error) {
    console.error("Error obteniendo tokens de Google:", error)
    return null
  }
}

/**
 * Eliminar tokens de Google Calendar
 */
export async function deleteGoogleTokens() {
  const sql = getDatabaseConnection()
  
  if (!sql) {
    return false
  }
  
  try {
    await sql`
      DELETE FROM google_calendar_tokens WHERE id = 1
    `
    return true
  } catch (error) {
    console.error("Error eliminando tokens de Google:", error)
    return false
  }
}

