"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function BookingPendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get("appointment_id")

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border/50 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-4">Pago pendiente</h1>
        <p className="text-muted-foreground mb-6">
          Su pago está siendo procesado. Recibirá un correo electrónico cuando se confirme su sesión.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Volver al inicio
        </Button>
      </div>
    </main>
  )
}

export default function BookingPendingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    }>
      <BookingPendingContent />
    </Suspense>
  )
}

