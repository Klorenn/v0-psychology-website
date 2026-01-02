import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

/**
 * Health check endpoint que también inicializa la BD automáticamente
 * GET /api/health
 * Este endpoint se puede llamar automáticamente o manualmente para verificar el estado
 */
export async function GET(request: NextRequest) {
  try {
    // Intentar inicializar la base de datos automáticamente
    // Si ya está inicializada, no hará nada (CREATE TABLE IF NOT EXISTS)
    try {
      await initializeDatabase()
    } catch (initError) {
      // Si falla, puede ser que ya esté inicializada o que no haya conexión
      // No es crítico, solo loguear
      console.log("ℹ️ Base de datos ya inicializada o sin conexión:", initError instanceof Error ? initError.message : "Unknown")
    }

    return NextResponse.json({
      status: "ok",
      message: "Sistema funcionando correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error en health check",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

