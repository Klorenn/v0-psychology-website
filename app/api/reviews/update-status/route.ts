import { type NextRequest, NextResponse } from "next/server"
import { updateReviewStatus } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID y estado son requeridos" },
        { status: 400 }
      )
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "Estado inválido. Debe ser 'approved' o 'rejected'" },
        { status: 400 }
      )
    }

    const success = await updateReviewStatus(id, status)

    if (!success) {
      return NextResponse.json(
        { error: "Error al actualizar el estado de la reseña" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Reseña ${status === "approved" ? "aprobada" : "rechazada"} correctamente`,
    })
  } catch (error) {
    console.error("Error actualizando estado de reseña:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

