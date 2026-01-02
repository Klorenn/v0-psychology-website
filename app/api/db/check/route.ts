import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/db"

/**
 * Endpoint de diagnóstico para verificar la conexión a Supabase
 * GET /api/db/check
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar qué variables están disponibles (sin mostrar valores completos por seguridad)
    const envCheck = {
      hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasStoragePostgresUrl: !!process.env.storage_POSTGRES_URL,
      supabaseUrlPreview: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)?.substring(0, 30) || "N/A",
    }

    // Intentar obtener cliente de Supabase
    const supabase = getSupabaseClient()
    const hasConnection = !!supabase

    // Si hay conexión, intentar una consulta simple
    let connectionTest = null
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("id")
          .limit(1)
        
        if (error) {
          if (error.code === "42P01") {
            connectionTest = {
              success: false,
              error: "La tabla 'appointments' no existe",
              code: error.code,
              recommendation: "Ejecuta el script SQL en Supabase SQL Editor (ver init-supabase-tables.sql)",
            }
          } else {
            connectionTest = {
              success: false,
              error: error.message || "Error desconocido",
              code: error.code,
            }
          }
        } else {
          connectionTest = {
            success: true,
            message: "Conexión exitosa",
            testQuery: "OK",
            appointmentsCount: data?.length || 0,
          }
        }
      } catch (testError: any) {
        connectionTest = {
          success: false,
          error: testError?.message || "Error desconocido",
          code: testError?.code,
        }
      }
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      hasConnection,
      connectionTest,
      recommendation: !hasConnection
        ? "Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel Settings → Environment Variables"
        : connectionTest?.success
        ? "Conexión funcionando correctamente"
        : connectionTest?.recommendation || "Hay conexión pero falla la consulta. Verifica las credenciales.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error en diagnóstico",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

