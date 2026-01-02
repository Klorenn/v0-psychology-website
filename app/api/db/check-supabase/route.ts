import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Endpoint de diagnóstico para Supabase
 * GET /api/db/check-supabase
 */
export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "N/A",
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    }

    if (!envCheck.hasSupabaseUrl || (!envCheck.hasServiceRoleKey && !envCheck.hasAnonKey)) {
      return NextResponse.json({
        success: false,
        error: "Variables de Supabase no configuradas",
        environment: envCheck,
        recommendation: "Verifica que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configurados en Vercel.",
      })
    }

    // Intentar crear cliente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "No se pudo crear cliente de Supabase",
        environment: envCheck,
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Probar conexión
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
            environment: envCheck,
            connectionStatus: "connected_but_table_missing",
            recommendation: "Ejecuta el script SQL en Supabase SQL Editor (ver init-supabase-tables.sql)",
          })
        }
        return NextResponse.json({
          success: false,
          error: "Error consultando tabla",
          details: error.message,
          code: error.code,
          environment: envCheck,
          connectionStatus: "error",
        })
      }

      return NextResponse.json({
        success: true,
        message: "Conexión exitosa con Supabase",
        environment: envCheck,
        connectionStatus: "connected",
        testQuery: "OK",
        appointmentsCount: data?.length || 0,
      })
    } catch (testError: any) {
      return NextResponse.json({
        success: false,
        error: "Error probando conexión",
        details: testError?.message || "Unknown error",
        environment: envCheck,
        connectionStatus: "error",
      })
    }
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

