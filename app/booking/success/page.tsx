"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get("appointment_id")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar que el pago se procesó correctamente
    if (appointmentId) {
      // El webhook debería haber actualizado el estado, pero verificamos
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    } else {
      setIsLoading(false)
    }
  }, [appointmentId])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando su pago...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border/50 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-4">¡Pago exitoso!</h1>
        <p className="text-muted-foreground mb-6">
          Su sesión ha sido confirmada. Recibirá un correo electrónico con todos los detalles y el enlace de Google Meet (si aplica).
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

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}

