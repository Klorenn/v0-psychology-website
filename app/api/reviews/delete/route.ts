import { NextRequest, NextResponse } from "next/server"
import { deleteReview } from "@/lib/db"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { error: "ID de reseña requerido y debe ser una cadena válida" },
        { status: 400 }
      )
    }

    const success = await deleteReview(id)

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar la reseña" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando reseña:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

