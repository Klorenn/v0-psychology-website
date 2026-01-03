/**
 * Store de reseñas
 */

export type ReviewStatus = "pending" | "approved" | "rejected"

export interface Review {
  id: string
  content: string
  rating?: number // Calificación de 1 a 5 estrellas
  authorName?: string // Opcional: solo si el usuario eligió mostrar nombre
  authorPillName?: string // Opcional: nombre de píldora (ej: "María P.")
  isAnonymous: boolean
  status: ReviewStatus
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
}

let reviews: Review[] = []
let listeners: (() => void)[] = []
let isInitialized = false

export const reviewsStore = {
  async init(force = false) {
    if (isInitialized && !force) return
    
    try {
      // Cargar desde API
      const response = await fetch("/api/reviews/list")
      if (response.ok) {
        const data = await response.json()
        reviews = (data.reviews || []).map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          approvedAt: r.approvedAt ? new Date(r.approvedAt) : undefined,
          rejectedAt: r.rejectedAt ? new Date(r.rejectedAt) : undefined,
        }))
      }
      isInitialized = true
      notifyListeners()
    } catch (error) {
      console.error("Error inicializando reseñas:", error)
    }
  },

  subscribe(listener: () => void) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  },

  getAll(): Review[] {
    return [...reviews]
  },

  getApproved(): Review[] {
    return reviews.filter(r => r.status === "approved")
  },

  getPending(): Review[] {
    return reviews.filter(r => r.status === "pending")
  },
}

function notifyListeners() {
  listeners.forEach(listener => listener())
}

