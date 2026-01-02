"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function BookingFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get("appointment_id")

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border/50 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-4">Pago rechazado</h1>
        <p className="text-muted-foreground mb-6">
          No se pudo procesar su pago. Por favor, verifique los datos de su tarjeta o intente con otro método de pago.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/#agenda")}
            className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Intentar nuevamente
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full rounded-xl"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function BookingFailurePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    }>
      <BookingFailureContent />
    </Suspense>
  )
}

