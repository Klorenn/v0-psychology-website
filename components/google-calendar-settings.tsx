"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react"

export function GoogleCalendarSettings() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  useEffect(() => {
    checkConnectionStatus()
    
    // Verificar si hay mensajes de URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("calendar_connected") === "success") {
      setSuccess("Google Calendar conectado correctamente")
      checkConnectionStatus()
      // Limpiar URL
      window.history.replaceState({}, "", window.location.pathname)
    }
    if (urlParams.get("calendar_error")) {
      const errorMsg = urlParams.get("calendar_error")
      if (errorMsg === "not_configured") {
        setError("Google Calendar no está configurado. Configure GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.")
      } else if (errorMsg === "no_code") {
        setError("No se recibió el código de autorización de Google.")
      } else if (errorMsg === "token_exchange_failed") {
        setError("Error al intercambiar el código de autorización. Por favor, intente nuevamente.")
      } else {
        setError(`Error: ${errorMsg}`)
      }
      // Limpiar URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const checkConnectionStatus = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/google-calendar/status")
      const data = await response.json()
      setIsConnected(data.connected || false)
    } catch (err) {
      console.error("Error verificando estado:", err)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError("")
    setSuccess("")
    try {
      window.location.href = "/api/google-calendar/auth"
    } catch (err) {
      setError("Error al iniciar la conexión con Google Calendar")
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm("¿Está seguro de que desea desconectar Google Calendar? Las citas futuras no se crearán automáticamente en su calendario.")) {
      return
    }

    setIsDisconnecting(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
      })
      const data = await response.json()
      
      if (data.success) {
        setIsConnected(false)
        setSuccess("Google Calendar desconectado correctamente")
      } else {
        setError(data.error || "Error al desconectar Google Calendar")
      }
    } catch (err) {
      setError("Error al desconectar Google Calendar")
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Verificando estado de Google Calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-accent" />
        <h3 className="font-serif text-xl text-foreground">Google Calendar</h3>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-600">Éxito</p>
            <p className="text-sm text-green-600/80 mt-1">{success}</p>
          </div>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Google Calendar conectado</p>
              <p className="text-sm text-muted-foreground">
                Las citas aceptadas se crearán automáticamente en su calendario de Google.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Las citas aceptadas se sincronizan automáticamente con Google Calendar</p>
            <p>• Los horarios disponibles se actualizan según su calendario</p>
            <p>• Los eventos incluyen información del paciente y recordatorios</p>
          </div>

          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="destructive"
            className="w-full"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Desconectar Google Calendar
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Conecte su cuenta de Google Calendar para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Crear eventos automáticamente cuando acepte citas</li>
              <li>Sincronizar horarios disponibles con su calendario</li>
              <li>Recibir recordatorios de citas</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Configuración requerida
            </p>
            <p className="text-xs text-muted-foreground">
              Antes de conectar, asegúrese de configurar las siguientes variables de entorno:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 font-mono">
              <li>• GOOGLE_CLIENT_ID</li>
              <li>• GOOGLE_CLIENT_SECRET</li>
              <li>• GOOGLE_REDIRECT_URI (opcional)</li>
            </ul>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline mt-2 inline-flex items-center gap-1"
            >
              Ver instrucciones en Google Cloud Console
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Conectar con Google Calendar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

