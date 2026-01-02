import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    return NextResponse.json({ 
      success: true, 
      message: "Base de datos inicializada correctamente" 
    })
  } catch (error) {
    console.error("Error inicializando base de datos:", error)
    return NextResponse.json(
      { error: "Error al inicializar la base de datos", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

