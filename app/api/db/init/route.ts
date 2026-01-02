import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

/**
 * Inicializar tablas de la base de datos
 * GET /api/db/init
 * POST /api/db/init
 */
async function handleInit() {
  try {
    console.log("Iniciando inicialización de base de datos...")
    
    await initializeDatabase()
    
    console.log("✅ Base de datos inicializada correctamente")
    
    return NextResponse.json({ 
      success: true, 
      message: "Base de datos inicializada correctamente",
      tables: [
        "appointments (con campos: receipt_data, receipt_filename, receipt_mimetype)",
        "site_config",
        "google_calendar_tokens"
      ]
    })
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        success: false,
        error: "Error al inicializar la base de datos", 
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        hint: "Verifica que POSTGRES_URL esté configurado correctamente"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleInit()
}

export async function POST(request: NextRequest) {
  return handleInit()
}

