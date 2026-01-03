"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X, Loader2, Clock, Trash2 } from "lucide-react"
import type { Review } from "@/lib/reviews-store"
import { AppointmentMenu } from "@/components/ui/appointment-menu"
import { authenticatedFetch } from "@/lib/api-client"

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [filter])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const url = filter === "all" 
        ? "/api/reviews/list"
        : `/api/reviews/list?status=${filter}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        // Convertir fechas de string a Date objects
        const reviewsWithDates = (data.reviews || []).map((review: any) => ({
          ...review,
          createdAt: review.createdAt ? new Date(review.createdAt) : new Date(),
          approvedAt: review.approvedAt ? new Date(review.approvedAt) : undefined,
          rejectedAt: review.rejectedAt ? new Date(review.rejectedAt) : undefined,
        }))
        setReviews(reviewsWithDates)
      }
    } catch (error) {
      console.error("Error cargando reseñas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id)
    try {
      const response = await authenticatedFetch("/api/reviews/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado")
      }

      await loadReviews()
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar el estado de la reseña")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await authenticatedFetch("/api/reviews/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la reseña")
      }

      await loadReviews()
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar la reseña")
    } finally {
      setDeletingId(null)
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

  const getStatusBadge = (status: Review["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 text-white">Aprobada</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazada</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800">Pendiente</Badge>
    }
  }

  const pendingReviews = reviews.filter(r => r.status === "pending")
  const approvedReviews = reviews.filter(r => r.status === "approved")
  const rejectedReviews = reviews.filter(r => r.status === "rejected")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-2">Panel de Reseñas</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona las reseñas de tus pacientes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todas ({reviews.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pendientes ({pendingReviews.length})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("approved")}
        >
          Aprobadas ({approvedReviews.length})
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("rejected")}
        >
          Rechazadas ({rejectedReviews.length})
        </Button>
      </div>

      {/* Lista de reseñas */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === "all" 
              ? "No hay reseñas aún"
              : `No hay reseñas ${filter === "pending" ? "pendientes" : filter === "approved" ? "aprobadas" : "rechazadas"}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-xl p-6 shadow-sm border border-border/50"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 5)
                              ? "fill-yellow-400 dark:fill-yellow-500 text-yellow-400 dark:text-yellow-500"
                              : "fill-gray-200 dark:fill-gray-700 text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Por {getAuthorDisplay(review)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviada el {review.createdAt.getDate()} de {monthNames[review.createdAt.getMonth()]} a las {review.createdAt.getHours().toString().padStart(2, "0")}:{review.createdAt.getMinutes().toString().padStart(2, "0")}
                  </p>
                </div>
                <AppointmentMenu
                  items={[
                    {
                      label: "Eliminar",
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => handleDelete(review.id),
                      disabled: deletingId === review.id,
                      variant: "destructive",
                    },
                  ]}
                />
              </div>

              <p className="text-foreground whitespace-pre-wrap leading-relaxed mb-4">
                {review.content}
              </p>

              {review.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t border-border/50">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(review.id, "approved")}
                    disabled={updatingId === review.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updatingId === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas rechazar esta reseña?")) {
                        handleUpdateStatus(review.id, "rejected")
                      }
                    }}
                    disabled={updatingId === review.id}
                  >
                    {updatingId === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Rechazar
                  </Button>
                </div>
              )}

              {review.status === "approved" && review.approvedAt && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  Aprobada el {review.approvedAt.getDate()} de {monthNames[review.approvedAt.getMonth()]}
                </p>
              )}

              {review.status === "rejected" && review.rejectedAt && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  Rechazada el {review.rejectedAt.getDate()} de {monthNames[review.rejectedAt.getMonth()]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

