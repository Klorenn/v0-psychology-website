import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/db"

/**
 * Endpoint de prueba de conexión con Supabase
 * GET /api/db/test-connection
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: "No se pudo crear cliente de Supabase",
        environment: {
          hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
          hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        recommendation: "Verifica que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configurados en Vercel.",
      })
    }

    // Probar conexión consultando una tabla
    try {
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
        throw error
      }

      return NextResponse.json({
        success: true,
        connectionStatus: "connected",
        message: "Conexión exitosa con Supabase",
        testQuery: "OK",
        appointmentsCount: data?.length || 0,
      })
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: "Error probando conexión",
        details: error?.message || "Unknown error",
        code: error?.code,
        connectionStatus: "error",
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error en prueba de conexión",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

