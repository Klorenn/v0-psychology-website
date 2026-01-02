import { type NextRequest, NextResponse } from "next/server"

/**
 * Endpoint temporal para probar conexión directa con Supabase
 * GET /api/test-supabase
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.SUPABASE_URL
    
    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Variables de Supabase no configuradas",
        environment: {
          hasUrl: !!supabaseUrl,
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "N/A",
        },
        recommendation: "Verifica que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configurados en Vercel.",
      })
    }

    // Importación dinámica para evitar problemas en build
    const { createClient } = await import("@supabase/supabase-js")
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Probar conexión consultando la tabla appointments
    const { data, error } = await supabase
      .from("appointments")
      .select("id")
      .limit(1)

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({
          success: false,
          error: "La tabla 'appointments' no existe",
          recommendation: "Ejecuta el script SQL en Supabase SQL Editor (ver init-supabase-tables.sql)",
          connectionStatus: "connected_but_table_missing",
        })
      }
      
      return NextResponse.json({
        success: false,
        error: "Error consultando tabla",
        details: error.message,
        code: error.code,
        hint: error.hint,
        connectionStatus: "error",
      })
    }

    // Intentar crear una cita de prueba
    const testAppointment = {
      id: `test-direct-${Date.now()}`,
      patient_name: "Test Directo",
      patient_email: "test@direct.com",
      patient_phone: "+56912345678",
      consultation_reason: "Prueba de conexión directa",
      appointment_type: "online",
      date: new Date().toISOString(),
      time: "10:00",
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      payment_method: "transfer",
    }

    const { data: insertData, error: insertError } = await supabase
      .from("appointments")
      .upsert(testAppointment, {
        onConflict: "id",
      })
      .select()

    if (insertError) {
      return NextResponse.json({
        success: true,
        message: "Conexión exitosa, pero error al crear cita",
        connectionStatus: "connected",
        testQuery: "OK",
        insertError: insertError.message,
        insertCode: insertError.code,
      })
    }

    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa y cita creada correctamente",
      connectionStatus: "connected",
      testQuery: "OK",
      testAppointment: {
        id: insertData?.[0]?.id,
        patientName: insertData?.[0]?.patient_name,
      },
      appointmentsCount: data?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Error en prueba",
        details: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}

