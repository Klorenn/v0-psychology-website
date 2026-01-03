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
        "google_calendar_tokens",
        "reviews"
      ]
    })
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Verificar qué variables están configuradas para dar un hint más específico
    const hasPostgresUrl = !!(process.env.POSTGRES_URL || process.env.storage_POSTGRES_URL)
    const hasPostgresUrlNonPooling = !!(process.env.POSTGRES_URL_NON_POOLING || process.env.storage_POSTGRES_URL_NON_POOLING)
    let hint = "Verifica que POSTGRES_URL o storage_POSTGRES_URL estén configurados en Vercel."
    
    if (!hasPostgresUrl && !hasPostgresUrlNonPooling) {
      hint = "POSTGRES_URL o storage_POSTGRES_URL no están configurados. Si conectaste Supabase desde Vercel, las variables deberían tener el prefijo 'storage_'. Ve a Vercel → Settings → Storage → Supabase para verificar la conexión."
    } else if (errorMessage.includes("connection") || errorMessage.includes("timeout")) {
      hint = "Error de conexión. Verifica que la URL de conexión de Supabase sea correcta y que el proyecto esté activo."
    } else if (errorMessage.includes("authentication") || errorMessage.includes("password")) {
      hint = "Error de autenticación. Verifica que storage_POSTGRES_PASSWORD sea correcto en las variables de entorno."
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "Error al inicializar la base de datos", 
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        hint: hint,
        debug: process.env.NODE_ENV === "development" ? {
          hasPostgresUrl,
          hasPostgresUrlNonPooling,
          postgresUrlLength: process.env.POSTGRES_URL?.length || 0,
          postgresUrlNonPoolingLength: process.env.POSTGRES_URL_NON_POOLING?.length || 0
        } : undefined
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

