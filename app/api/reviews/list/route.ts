import { type NextRequest, NextResponse } from "next/server"
import { getAllReviews } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") // "approved", "pending", o null para todas

    const allReviews = await getAllReviews()

    let reviews = allReviews

    // Filtrar por estado si se especifica
    if (status) {
      reviews = allReviews.filter((r: any) => r.status === status)
    }

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    })
  } catch (error) {
    console.error("Error obteniendo reseñas:", error)
    return NextResponse.json(
      { error: "Error al obtener las reseñas" },
      { status: 500 }
    )
  }
}

