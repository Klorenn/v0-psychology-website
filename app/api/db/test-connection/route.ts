import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

/**
 * Endpoint de prueba de conexión directa
 * GET /api/db/test-connection
 */
export async function GET(request: NextRequest) {
  try {
    // Probar diferentes URLs
    const urls = [
      { name: "POSTGRES_URL_NON_POOLING", url: process.env.POSTGRES_URL_NON_POOLING },
      { name: "storage_POSTGRES_URL_NON_POOLING", url: process.env.storage_POSTGRES_URL_NON_POOLING },
      { name: "POSTGRES_URL", url: process.env.POSTGRES_URL },
      { name: "storage_POSTGRES_URL", url: process.env.storage_POSTGRES_URL },
    ]

    const results = []

    for (const { name, url } of urls) {
      if (!url) {
        results.push({ name, status: "not_configured" })
        continue
      }

      try {
        console.log(`🔍 Probando ${name}...`)
        const sql = neon(url)
        const result = await sql`SELECT 1 as test, NOW() as current_time`
        results.push({
          name,
          status: "success",
          test: result[0]?.test,
          currentTime: result[0]?.current_time,
          urlLength: url.length,
          urlPreview: url.substring(0, 50) + "...",
        })
        console.log(`✅ ${name} funcionó`)
      } catch (error: any) {
        results.push({
          name,
          status: "error",
          error: error?.message || "Unknown error",
          code: error?.code,
          urlLength: url.length,
        })
        console.error(`❌ ${name} falló:`, error?.message)
      }
    }

    const working = results.find((r) => r.status === "success")

    return NextResponse.json({
      success: true,
      results,
      workingConnection: working?.name || null,
      recommendation: working
        ? `Usa ${working.name} para las conexiones`
        : "Ninguna conexión funcionó. Verifica que el proyecto de Supabase esté activo y las credenciales sean correctas.",
    })
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

