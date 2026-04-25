"use client"

import { useState, useEffect } from "react"
import { Star, Loader2, MessageSquarePlus } from "lucide-react"
import type { Review } from "@/lib/reviews-store"
import { Testimonial } from "@/components/ui/testimonial"
import { LeaveReviewSection } from "@/components/leave-review-section"

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadApprovedReviews()
  }, [])

  useEffect(() => {
    console.log("Reviews loaded:", reviews.length, reviews)
  }, [reviews])

  const loadApprovedReviews = async () => {
    try {
      console.log("🔍 Cargando reseñas aprobadas...")
      
      // Timeout de 10 segundos
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch("/api/reviews/list?status=approved", {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      console.log("📡 Respuesta del servidor:", response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📦 Datos recibidos:", data)
        
        // Asegurar que las fechas se conviertan correctamente
        const reviewsWithDates = (data.reviews || []).map((r: any) => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          approvedAt: r.approvedAt ? new Date(r.approvedAt) : undefined,
          rejectedAt: r.rejectedAt ? new Date(r.rejectedAt) : undefined,
        }))
        console.log("✅ Reseñas procesadas:", reviewsWithDates.length, reviewsWithDates)
        setReviews(reviewsWithDates)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error en respuesta:", response.status, response.statusText, errorData)
        setReviews([])
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error("⏱️ Timeout cargando reseñas")
      } else {
        console.error("❌ Error cargando reseñas:", error)
      }
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }




  return (
    <section id="reseñas" className="py-20 px-6 bg-muted/30 min-h-[500px]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Testimonios
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La experiencia de quienes han confiado en mi acompañamiento profesional.
          </p>
        </div>

        {/* Reseñas aprobadas */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="relative min-h-[500px] flex items-center justify-center w-full py-8">
            <Testimonial reviews={reviews} />
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">Aún no hay testimonios publicados.</p>
            <p className="text-sm text-muted-foreground">Los testimonios se publican con el consentimiento de quienes participan en el proceso terapéutico</p>
          </div>
        )}

        {/* Botón Escribir testimonio */}
        <div className="mt-8">
          <LeaveReviewSection hideHeader />
        </div>

      </div>
    </section>
  )
}

