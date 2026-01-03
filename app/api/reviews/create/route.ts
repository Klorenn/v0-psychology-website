import { type NextRequest, NextResponse } from "next/server"
import { saveReview } from "@/lib/db"
import { containsProfanity } from "@/lib/profanity-filter"

const MIN_LENGTH = 50 // Mínimo de caracteres (aproximadamente 1 párrafo corto)
const MAX_LENGTH = 1000 // Máximo de caracteres (aproximadamente 3 párrafos)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, rating, authorName, authorPillName, isAnonymous } = body

    // Validaciones
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "El contenido de la reseña es requerido" },
        { status: 400 }
      )
    }

    // Validar rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Debes seleccionar una calificación de 1 a 5 estrellas" },
        { status: 400 }
      )
    }

    // Validar longitud
    if (content.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `La reseña debe tener al menos ${MIN_LENGTH} caracteres` },
        { status: 400 }
      )
    }

    if (content.length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `La reseña no puede exceder ${MAX_LENGTH} caracteres` },
        { status: 400 }
      )
    }

    // Verificar palabras vulgares
    if (containsProfanity(content)) {
      return NextResponse.json(
        { error: "La reseña contiene lenguaje inapropiado. Por favor, usa un lenguaje respetuoso." },
        { status: 400 }
      )
    }

    // Validar opciones de anonimato
    if (isAnonymous === false) {
      // Si no es anónimo, debe tener al menos nombre o nombre de píldora
      if (!authorName && !authorPillName) {
        return NextResponse.json(
          { error: "Debes proporcionar un nombre o nombre de píldora si no es anónimo" },
          { status: 400 }
        )
      }
    }

    // Crear reseña
    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const review = {
      id: reviewId,
      content: content.trim(),
      rating: rating,
      authorName: isAnonymous ? undefined : (authorName?.trim() || undefined),
      authorPillName: isAnonymous ? undefined : (authorPillName?.trim() || undefined),
      isAnonymous: isAnonymous !== false, // Por defecto anónimo
      status: "pending" as const,
      createdAt: new Date(),
    }

    try {
      const success = await saveReview(review)

      if (!success) {
        console.error("❌ No se pudo guardar la reseña en la base de datos")
        return NextResponse.json(
          { error: "Error al guardar la reseña en la base de datos. Por favor, verifica que la tabla 'reviews' exista y tenga los permisos correctos." },
          { status: 500 }
        )
      }

      console.log(`✅ Reseña ${reviewId} creada exitosamente`)
      return NextResponse.json({
        success: true,
        message: "Reseña enviada correctamente. Será revisada antes de publicarse.",
        reviewId,
      })
    } catch (dbError: any) {
      console.error("❌ Error de base de datos al guardar reseña:", dbError)
      
      // Si el error tiene un mensaje específico, usarlo
      if (dbError?.message) {
        return NextResponse.json(
          { error: dbError.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: "Error al guardar la reseña en la base de datos. Por favor, verifica la configuración." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Error creando reseña:", error)
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

