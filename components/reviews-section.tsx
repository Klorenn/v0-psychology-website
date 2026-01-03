"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Star, Send, Loader2, CheckCircle, ChevronLeft, ChevronRight, Calendar, Heart } from "lucide-react"
import type { Review } from "@/lib/reviews-store"
import { TestimonialStack, type Testimonial } from "@/components/ui/glass-testimonial-swiper"

const MIN_LENGTH = 50
const MAX_LENGTH = 1000

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Form state
  const [content, setContent] = useState("")
  const [anonymityOption, setAnonymityOption] = useState<"anonymous" | "name" | "pill">("anonymous")
  const [authorName, setAuthorName] = useState("")
  const [authorPillName, setAuthorPillName] = useState("")

  useEffect(() => {
    loadApprovedReviews()
  }, [])

  useEffect(() => {
    console.log("Reviews loaded:", reviews.length, reviews)
  }, [reviews])

  const loadApprovedReviews = async () => {
    try {
      console.log("🔍 Cargando reseñas aprobadas...")
      const response = await fetch("/api/reviews/list?status=approved")
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
    } catch (error) {
      console.error("❌ Error cargando reseñas:", error)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          isAnonymous: anonymityOption === "anonymous",
          authorName: anonymityOption === "name" ? authorName : undefined,
          authorPillName: anonymityOption === "pill" ? authorPillName : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la reseña")
      }

      setSubmitSuccess(true)
      setContent("")
      setAuthorName("")
      setAuthorPillName("")
      setAnonymityOption("anonymous")
      setShowForm(false)

      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error al enviar la reseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAuthorDisplay = (review: Review) => {
    if (review.isAnonymous) {
      return "Anónimo"
    }
    if (review.authorPillName) {
      return review.authorPillName
    }
    if (review.authorName) {
      return review.authorName
    }
    return "Anónimo"
  }

  // Convertir Review a Testimonial
  const convertReviewToTestimonial = (review: Review): Testimonial => {
    const authorDisplay = getAuthorDisplay(review)
    const initials = review.isAnonymous 
      ? "A" 
      : (review.authorPillName || review.authorName || "A")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    
    // Gradientes de colores cálidos para psicología
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ]
    const gradientIndex = review.id.charCodeAt(0) % gradients.length
    
    // Calcular fecha relativa
    const now = new Date()
    const reviewDate = review.createdAt
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    let dateText = "Reciente"
    if (diffDays === 1) dateText = "Hace 1 día"
    else if (diffDays < 7) dateText = `Hace ${diffDays} días`
    else if (diffDays < 30) dateText = `Hace ${Math.floor(diffDays / 7)} semanas`
    else if (diffDays < 365) dateText = `Hace ${Math.floor(diffDays / 30)} meses`
    else dateText = `Hace ${Math.floor(diffDays / 365)} años`

    return {
      id: review.id,
      initials,
      name: authorDisplay,
      role: review.isAnonymous ? "Paciente" : "Paciente",
      quote: review.content,
      tags: review.isAnonymous 
        ? [{ text: 'Anónimo', type: 'default' as const }]
        : [{ text: 'Verificado', type: 'featured' as const }],
      stats: [
        { icon: Star, text: '5 estrellas' },
        { icon: Calendar, text: dateText }
      ],
      avatarGradient: gradients[gradientIndex],
    }
  }

  const characterCount = content.length
  const isContentValid = characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH

  return (
    <section id="reseñas" className="py-20 px-6 bg-muted/30 min-h-[500px]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Reseñas de Pacientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conoce la experiencia de quienes han confiado en mi acompañamiento profesional
          </p>
        </div>

        {/* Reseñas aprobadas */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="relative mb-12 min-h-[500px] flex items-center justify-center w-full py-8">
            <div className="w-full max-w-2xl mx-auto px-4">
              {(() => {
                try {
                  const testimonials = reviews.map(convertReviewToTestimonial)
                  console.log("🎨 Testimonials convertidos:", testimonials.length, testimonials)
                  
                  if (testimonials.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground bg-card/50 rounded-lg border border-border p-4">
                        No se pudieron convertir las reseñas a testimonios
                      </div>
                    )
                  }
                  
                  return (
                    <div className="w-full" style={{ minHeight: '400px', position: 'relative' }}>
                      <TestimonialStack 
                        testimonials={testimonials} 
                        visibleBehind={2}
                      />
                    </div>
                  )
                } catch (error) {
                  console.error("❌ Error convirtiendo reseñas:", error)
                  return (
                    <div className="text-center py-8 text-destructive bg-destructive/10 rounded-lg border border-destructive/20 p-4">
                      Error al mostrar las reseñas. Por favor, recarga la página.
                    </div>
                  )
                }
              })()}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">Aún no hay reseñas publicadas.</p>
            <p className="text-sm text-muted-foreground">Sé el primero en compartir tu experiencia</p>
          </div>
        )}

        {/* Botón para dejar reseña */}
        {!showForm && !submitSuccess && (
          <div className="text-center">
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              <Star className="w-4 h-4 mr-2" />
              Dejar una reseña
            </Button>
          </div>
        )}

        {/* Mensaje de éxito */}
        {submitSuccess && (
          <div className="max-w-md mx-auto bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              ¡Reseña enviada!
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              Tu reseña será revisada antes de publicarse. Gracias por compartir tu experiencia.
            </p>
          </div>
        )}

        {/* Formulario de reseña */}
        {showForm && !submitSuccess && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-card rounded-xl p-6 shadow-sm border border-border/50">
            <h3 className="font-serif text-2xl text-foreground mb-6">
              Comparte tu experiencia
            </h3>

            <div className="space-y-6">
              {/* Contenido */}
              <div>
                <Label htmlFor="review-content" className="mb-2">
                  Tu reseña
                  <span className="text-xs text-muted-foreground ml-2">
                    ({MIN_LENGTH}-{MAX_LENGTH} caracteres, aproximadamente 1-3 párrafos)
                  </span>
                </Label>
                <Textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Comparte tu experiencia con la sesión..."
                  rows={6}
                  className="resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className={`text-xs ${isContentValid ? "text-muted-foreground" : "text-destructive"}`}>
                    {characterCount} / {MAX_LENGTH} caracteres
                  </p>
                  {characterCount < MIN_LENGTH && (
                    <p className="text-xs text-muted-foreground">
                      Mínimo {MIN_LENGTH} caracteres
                    </p>
                  )}
                </div>
              </div>

              {/* Opciones de anonimato */}
              <div>
                <Label className="mb-3 block">¿Cómo quieres aparecer?</Label>
                <RadioGroup value={anonymityOption} onValueChange={(value) => setAnonymityOption(value as any)}>
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="anonymous" id="anonymous" />
                    <Label htmlFor="anonymous" className="cursor-pointer flex-1">
                      <span className="font-medium">100% Anónimo</span>
                      <span className="text-xs text-muted-foreground block">
                        Tu reseña aparecerá como "Anónimo"
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="pill" id="pill" />
                    <Label htmlFor="pill" className="cursor-pointer flex-1">
                      <span className="font-medium">Nombre de píldora (opcional)</span>
                      <span className="text-xs text-muted-foreground block">
                        Ej: "María P." o "Juan M."
                      </span>
                    </Label>
                  </div>
                  {anonymityOption === "pill" && (
                    <div className="ml-6 mb-3">
                      <Input
                        value={authorPillName}
                        onChange={(e) => setAuthorPillName(e.target.value)}
                        placeholder="Ej: María P."
                        className="max-w-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name" id="name" />
                    <Label htmlFor="name" className="cursor-pointer flex-1">
                      <span className="font-medium">Solo el nombre (opcional)</span>
                      <span className="text-xs text-muted-foreground block">
                        Tu nombre completo o solo el nombre
                      </span>
                    </Label>
                  </div>
                  {anonymityOption === "name" && (
                    <div className="ml-6">
                      <Input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Tu nombre"
                        className="max-w-xs"
                      />
                    </div>
                  )}
                </RadioGroup>
              </div>

              {/* Error */}
              {submitError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isContentValid}
                  className="flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar reseña
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setContent("")
                    setAuthorName("")
                    setAuthorPillName("")
                    setAnonymityOption("anonymous")
                    setSubmitError("")
                  }}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

