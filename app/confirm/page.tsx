"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Check, X, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function ConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const action = searchParams.get("action")
  const appointmentId = searchParams.get("id")
  const error = searchParams.get("error")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Pequeño delay para mostrar la animación
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-2">Cita no encontrada</h1>
          <p className="text-muted-foreground mb-6">
            La cita que intentas confirmar no existe o ya fue procesada.
          </p>
          <Link href="/">
            <Button className="rounded-xl">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (error === "invalid_params" || error === "invalid_action") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-2">Parámetros inválidos</h1>
          <p className="text-muted-foreground mb-6">
            La solicitud no es válida. Por favor, usa los enlaces del correo electrónico.
          </p>
          <Link href="/">
            <Button className="rounded-xl">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (error === "server_error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-2">Error del servidor</h1>
          <p className="text-muted-foreground mb-6">
            Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.
          </p>
          <Link href="/">
            <Button className="rounded-xl">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isAccepted = action === "accept"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isAccepted ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isAccepted ? (
            <Check className="w-8 h-8 text-green-600" />
          ) : (
            <X className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h1 className="font-serif text-2xl text-foreground mb-2">
          {isAccepted ? "Cita Aceptada" : "Cita Rechazada"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isAccepted
            ? "La cita ha sido confirmada exitosamente. Se ha enviado un correo de confirmación al paciente."
            : "La cita ha sido rechazada. Se ha notificado al paciente."}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl">
              Ir al Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button className="rounded-xl">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  )
}

