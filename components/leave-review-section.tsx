"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Star, Send, Loader2, CheckCircle } from "lucide-react"
import { Magnetic } from "@/components/ui/magnetic"

const MIN_LENGTH = 50
const MAX_LENGTH = 1000

export function LeaveReviewSection() {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Form state
  const [content, setContent] = useState("")
  const [rating, setRating] = useState<number>(0) // 0 = no seleccionado, 1-5 = estrellas
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [anonymityOption, setAnonymityOption] = useState<"anonymous" | "name">("anonymous")
  const [authorName, setAuthorName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      if (rating === 0) {
        setSubmitError("Por favor, selecciona una calificación con estrellas")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          rating: rating,
          isAnonymous: anonymityOption === "anonymous",
          authorName: anonymityOption === "name" ? authorName : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el testimonio")
      }

      setSubmitSuccess(true)
      setContent("")
      setRating(0)
      setAuthorName("")
      setAnonymityOption("anonymous")
      setShowForm(false)

      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error al enviar el testimonio")
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = content.length
  const isContentValid = characterCount >= MIN_LENGTH && characterCount <= MAX_LENGTH

  return (
    <section id="dejar-reseña" className="py-20 px-6 bg-card">
      <div className="max-w-4xl mx-auto">
        {/* Sección para dejar reseña */}
        {!showForm && !submitSuccess && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-background rounded-2xl p-8 shadow-sm border border-border/50">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
                  <Star className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-2">
                  Testimonios
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  La experiencia de quienes han confiado en mi acompañamiento profesional.
                </p>
              </div>
              <div className="flex justify-center">
                <Magnetic intensity={0.5} range={120}>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-base font-medium"
                    size="lg"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Escribir testimonio
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {submitSuccess && (
          <div className="max-w-md mx-auto bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Testimonio enviado
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              Tu testimonio será revisado antes de su publicación. Gracias por compartir tu experiencia.
            </p>
          </div>
        )}

        {/* Formulario de reseña */}
        {showForm && !submitSuccess && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-background rounded-xl p-6 shadow-sm border border-border/50">
            <h3 className="font-serif text-2xl text-foreground mb-6">
              Testimonios
            </h3>

            <div className="space-y-6">
              {/* Calificación con Estrellas */}
              <div>
                <Label className="mb-3 block">
                  Calificación
                  <span className="text-xs text-muted-foreground ml-2">(requerido)</span>
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                      aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {rating === 1 && "Muy malo"}
                    {rating === 2 && "Malo"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bueno"}
                    {rating === 5 && "Excelente"}
                  </p>
                )}
              </div>

              {/* Contenido */}
              <div>
                <Label htmlFor="review-content" className="mb-2">
                  Tu testimonio
                  <span className="text-xs text-muted-foreground ml-2">
                    ({MIN_LENGTH}-{MAX_LENGTH} caracteres, aproximadamente 1-3 párrafos)
                  </span>
                </Label>
                <Textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Comparte tu experiencia del proceso terapéutico..."
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
                      <span className="font-medium">Anónimo</span>
                      <span className="text-xs text-muted-foreground block">
                        Tu testimonio aparecerá como "Anónimo"
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name" id="name" />
                    <Label htmlFor="name" className="cursor-pointer flex-1">
                      <span className="font-medium">Nombre y apellido (opcional)</span>
                      <span className="text-xs text-muted-foreground block">
                        Tu nombre completo aparecerá con el testimonio
                      </span>
                    </Label>
                  </div>
                  {anonymityOption === "name" && (
                    <div className="ml-6 mt-2">
                      <Input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ej: María González"
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
                  disabled={isSubmitting || !isContentValid || rating === 0}
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
                      Enviar testimonio
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setContent("")
                    setRating(0)
                    setAuthorName("")
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

