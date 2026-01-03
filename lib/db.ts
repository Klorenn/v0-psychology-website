// Importación dinámica de Supabase para evitar problemas en el cliente
// Solo se carga cuando se ejecuta en el servidor (API routes)

// Obtener cliente de Supabase usando REST API (más confiable que SQL directo en Vercel)
export function getSupabaseClient() {
  // Solo ejecutar en el servidor
  if (typeof window !== "undefined") {
    return null
  }
  
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.SUPABASE_URL ||
    process.env.storage_SUPABASE_URL
  
  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.storage_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.storage_NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Variables de Supabase no configuradas:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
    return null
  }
  
  try {
    // Importación dinámica para evitar problemas en el cliente
    const { createClient } = require("@supabase/supabase-js")
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Error creando cliente Supabase:", error)
    return null
  }
}

// Mantener compatibilidad con código existente
export function getDatabaseConnection() {
  return getSupabaseClient()
}

/**
 * Inicializar tablas de la base de datos
 * Nota: Las tablas deben crearse manualmente en Supabase SQL Editor
 * Este método solo verifica que existan
 */
export async function initializeDatabase() {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    const supabaseUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.SUPABASE_URL
    const errorMsg = !supabaseUrl 
      ? "NEXT_PUBLIC_SUPABASE_URL o SUPABASE_URL no están configurados. Verifica en Vercel Settings → Environment Variables."
      : "No se pudo establecer conexión con Supabase. Verifica que las credenciales sean correctas."
    throw new Error(errorMsg)
  }
  
  try {
    // Verificar que las tablas existan haciendo una consulta simple
    const { error: appointmentsError } = await supabase
      .from("appointments")
      .select("id")
      .limit(1)
    
    if (appointmentsError && appointmentsError.code === "42P01") {
      throw new Error("La tabla 'appointments' no existe. Por favor, ejecuta el script SQL en Supabase SQL Editor (ver init-supabase-tables.sql)")
    }
    
    const { error: configError } = await supabase
      .from("site_config")
      .select("id")
      .limit(1)
    
    if (configError && configError.code === "42P01") {
      throw new Error("La tabla 'site_config' no existe. Por favor, ejecuta el script SQL en Supabase SQL Editor")
    }
    
    const { error: reviewsError } = await supabase
      .from("reviews")
      .select("id")
      .limit(1)
    
    if (reviewsError && reviewsError.code === "42P01") {
      console.warn("⚠️ La tabla 'reviews' no existe. Por favor, ejecuta el script SQL en Supabase SQL Editor (ver init-supabase-tables.sql) para crearla.")
      // No lanzamos error porque reviews es opcional, pero recomendamos crearla
    }
    
    console.log("✅ Base de datos verificada correctamente")
  } catch (error: any) {
    console.error("Error verificando base de datos:", error)
    if (error?.message?.includes("no existe")) {
      throw error
    }
    // Si es otro error, asumir que las tablas existen
    console.log("⚠️ No se pudo verificar, pero continuando...")
  }
}

/**
 * Guardar una cita en la base de datos
 */
export async function saveAppointment(appointment: any) {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    console.warn("⚠️ No hay conexión a Supabase")
    console.warn("Variables disponibles:", {
      hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    return false
  }
  
  try {
    console.log(`💾 Intentando guardar cita ${appointment.id} en Supabase...`)
    
    // Limitar tamaño de receipt_data si es muy grande
    let receiptData = appointment.receiptData || null
    if (receiptData && receiptData.length > 10485760) { // 10MB en caracteres base64
      console.warn(`Receipt data muy grande (${(receiptData.length / 1024 / 1024).toFixed(2)}MB), truncando`)
      receiptData = receiptData.substring(0, 10485760)
    }
    
    const { data, error } = await supabase
      .from("appointments")
      .upsert({
        id: appointment.id,
        patient_name: appointment.patientName,
        patient_email: appointment.patientEmail,
        patient_phone: appointment.patientPhone,
        consultation_reason: appointment.consultationReason || null,
        emergency_contact_relation: appointment.emergencyContactRelation || null,
        emergency_contact_name: appointment.emergencyContactName || null,
        emergency_contact_phone: appointment.emergencyContactPhone || null,
        appointment_type: appointment.appointmentType,
        date: appointment.date.toISOString(),
        time: appointment.time,
        status: appointment.status,
        created_at: appointment.createdAt.toISOString(),
        expires_at: appointment.expiresAt.toISOString(),
        receipt_url: appointment.receiptUrl || null,
        receipt_data: receiptData,
        receipt_filename: appointment.receiptFilename || null,
        receipt_mimetype: appointment.receiptMimetype || null,
        payment_method: appointment.paymentMethod || null,
        payment_id: appointment.mercadoPagoPaymentId || null,
      }, {
        onConflict: "id",
      })
    
    if (error) {
      console.error(`❌ Error guardando cita ${appointment.id}:`, error)
      throw error
    }
    
    console.log(`✅ Cita ${appointment.id} guardada exitosamente en Supabase`)
    return true
  } catch (error: any) {
    console.error(`❌ Error guardando cita ${appointment.id}:`, error)
    
    // Si es error de tabla no existe
    if (error?.code === "42P01" || error?.message?.includes("does not exist") || error?.message?.includes("relation")) {
      throw new Error("La tabla 'appointments' no existe. Por favor, ejecuta el script SQL en Supabase SQL Editor (ver init-supabase-tables.sql)")
    }
    
    // Si es error de conexión
    if (error?.message?.includes("fetch failed") || error?.message?.includes("connection") || error?.message?.includes("ECONNREFUSED")) {
      throw new Error("Error de conexión a la base de datos. Verifica las variables de entorno.")
    }
    
    throw error
  }
}


/**
 * Obtener todas las citas
 */
export async function getAllAppointments() {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    console.warn("⚠️ No hay conexión a Supabase")
    return []
  }
  
  try {
    console.log("🔍 Consultando citas en Supabase...")
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("❌ Error consultando citas:", error)
      
      // Si es error de tabla no existe
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
        console.log("⚠️ Tabla 'appointments' no existe")
        return []
      }
      
      throw error
    }
    
    console.log(`📊 Resultado de consulta: ${data?.length || 0} filas encontradas`)
    
    if (!data || data.length === 0) {
      console.log("ℹ️ No hay citas en la base de datos")
      return []
    }
    
    const mappedAppointments = data.map((row: any) => {
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
    console.error("❌ Error obteniendo citas:", error)
    return []
  }
}

/**
 * Actualizar estado de una cita
 */
export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return false
  }
  
  try {
    console.log(`🔄 Actualizando estado de cita ${id} a "${status}"...`)
    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select()
    
    if (error) {
      console.error("❌ Error actualizando estado:", error)
      return false
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Estado actualizado correctamente: ${data[0].id} → ${data[0].status}`)
    } else {
      console.warn(`⚠️ No se encontró la cita ${id} para actualizar`)
      return false
    }
    
    return true
  } catch (error) {
    console.error("❌ Error actualizando estado:", error)
    return false
  }
}

/**
 * Obtener configuración del sitio
 */
export async function getSiteConfig() {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("config")
      .eq("id", 1)
      .single()
    
    if (error) {
      if (error.code === "PGRST116") {
        // No hay fila
        return null
      }
      console.error("Error obteniendo configuración:", error)
      return null
    }
    
    return data?.config || null
  } catch (error) {
    console.error("Error obteniendo configuración:", error)
    return null
  }
}

/**
 * Guardar configuración del sitio
 */
export async function saveSiteConfig(config: any) {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from("site_config")
      .upsert({
        id: 1,
        config,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "id",
      })
    
    if (error) {
      console.error("Error guardando configuración:", error)
      return false
    }
    
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
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from("google_calendar_tokens")
      .upsert({
        id: 1,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expiry_date: tokens.expiryDate,
        calendar_id: tokens.calendarId || null,
        user_email: tokens.userEmail || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "id",
      })
    
    if (error) {
      console.error("Error guardando tokens de Google:", error)
      return false
    }
    
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
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from("google_calendar_tokens")
      .select("*")
      .eq("id", 1)
      .single()
    
    if (error) {
      if (error.code === "PGRST116") {
        // No hay fila
        return null
      }
      console.error("Error obteniendo tokens de Google:", error)
      return null
    }
    
    if (data) {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiryDate: parseInt(data.expiry_date),
        calendarId: data.calendar_id,
        userEmail: data.user_email,
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
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from("google_calendar_tokens")
      .delete()
      .eq("id", 1)
    
    if (error) {
      console.error("Error eliminando tokens de Google:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Error eliminando tokens de Google:", error)
    return false
  }
}

/**
 * Guardar una reseña en la base de datos
 */
export async function saveReview(review: {
  id: string
  content: string
  authorName?: string
  authorPillName?: string
  isAnonymous: boolean
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}) {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from("reviews")
      .upsert({
        id: review.id,
        content: review.content,
        author_name: review.authorName || null,
        author_pill_name: review.authorPillName || null,
        is_anonymous: review.isAnonymous,
        status: review.status,
        created_at: review.createdAt.toISOString(),
        approved_at: null,
        rejected_at: null,
      }, {
        onConflict: "id",
      })
    
    if (error) {
      console.error("Error guardando reseña:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Error guardando reseña:", error)
    return false
  }
}

/**
 * Obtener todas las reseñas
 */
export async function getAllReviews() {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error obteniendo reseñas:", error)
      return []
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      content: row.content,
      authorName: row.author_name || undefined,
      authorPillName: row.author_pill_name || undefined,
      isAnonymous: row.is_anonymous,
      status: row.status,
      createdAt: new Date(row.created_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      rejectedAt: row.rejected_at ? new Date(row.rejected_at) : undefined,
    }))
  } catch (error) {
    console.error("Error obteniendo reseñas:", error)
    return []
  }
}

/**
 * Actualizar estado de una reseña
 */
export async function updateReviewStatus(id: string, status: "approved" | "rejected") {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return false
  }
  
  try {
    const updateData: any = {
      status,
    }
    
    if (status === "approved") {
      updateData.approved_at = new Date().toISOString()
      updateData.rejected_at = null
    } else {
      updateData.rejected_at = new Date().toISOString()
      updateData.approved_at = null
    }
    
    const { error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", id)
    
    if (error) {
      console.error("Error actualizando estado de reseña:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Error actualizando estado de reseña:", error)
    return false
  }
}

