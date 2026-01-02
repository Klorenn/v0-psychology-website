import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseConnection } from "@/lib/db"

/**
 * Endpoint de diagnóstico para verificar la conexión a la base de datos
 * GET /api/db/check
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar qué variables están disponibles (sin mostrar valores completos por seguridad)
    const envCheck = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasStoragePostgresUrl: !!process.env.storage_POSTGRES_URL,
      hasPostgresUrlNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
      hasStoragePostgresUrlNonPooling: !!process.env.storage_POSTGRES_URL_NON_POOLING,
      postgresUrlLength: process.env.POSTGRES_URL?.length || 0,
      storagePostgresUrlLength: process.env.storage_POSTGRES_URL?.length || 0,
      postgresUrlStartsWith: process.env.POSTGRES_URL?.substring(0, 20) || "N/A",
      storagePostgresUrlStartsWith: process.env.storage_POSTGRES_URL?.substring(0, 20) || "N/A",
    }

    // Intentar obtener conexión
    const sql = getDatabaseConnection()
    const hasConnection = !!sql

    // Si hay conexión, intentar una consulta simple
    let connectionTest = null
    if (sql) {
      try {
        const result = await sql`SELECT 1 as test`
        connectionTest = {
          success: true,
          message: "Conexión exitosa",
          testQuery: result[0]?.test === 1 ? "OK" : "Error",
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
        ? "Configura POSTGRES_URL o storage_POSTGRES_URL en Vercel Settings → Environment Variables"
        : connectionTest?.success
        ? "Conexión funcionando correctamente"
        : "Hay conexión pero falla la consulta. Verifica las credenciales.",
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

