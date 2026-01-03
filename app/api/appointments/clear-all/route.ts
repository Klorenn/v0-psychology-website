import { NextRequest, NextResponse } from "next/server"
import { deleteAllAppointments } from "@/lib/db"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    const result = await deleteAllAppointments()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al eliminar las citas" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Todas las citas han sido eliminadas correctamente"
    })
  } catch (error) {
    console.error("Error en clear-all:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

