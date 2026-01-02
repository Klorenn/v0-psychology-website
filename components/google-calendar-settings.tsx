"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react"

export function GoogleCalendarSettings() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/google-calendar/status", {
        cache: "no-store",
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const connected = data.connected === true
      setIsConnected(connected)
      
      // Si se conectó exitosamente, limpiar cualquier error previo
      if (connected) {
        setError("")
      }
    } catch (err) {
      console.error("Error verificando estado:", err)
      setIsConnected(false)
      
      // Solo mostrar errores reales, no timeouts
      if (err instanceof Error && !err.name.includes("Abort") && !err.name.includes("Timeout")) {
        // No mostrar error si es solo un problema de verificación
        // setError(`Error al verificar el estado: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Verificar mensajes de URL primero
    const urlParams = new URLSearchParams(window.location.search)
    const calendarConnected = urlParams.get("calendar_connected")
    const calendarError = urlParams.get("calendar_error")
    
    if (calendarConnected === "success") {
      setSuccess("Google Calendar vinculado correctamente")
      setIsConnected(true)
      setIsLoading(false)
      // Verificar el estado real después de un momento para asegurar que se guardó
      setTimeout(() => {
        checkConnectionStatus()
      }, 1000)
      // Limpiar URL
      window.history.replaceState({}, "", window.location.pathname)
      return
    }
    
    if (calendarError) {
      const errorMsg = decodeURIComponent(calendarError)
      if (errorMsg === "not_configured") {
        setError("Google Calendar no está configurado. Configure GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.")
      } else if (errorMsg === "no_code") {
        setError("No se recibió el código de autorización de Google.")
      } else if (errorMsg === "token_exchange_failed") {
        setError("Error al intercambiar el código de autorización. Por favor, intente nuevamente.")
      } else if (errorMsg === "server_error") {
        setError("Error del servidor al procesar la autorización. Por favor, intente nuevamente.")
      } else if (errorMsg === "access_denied") {
        setError("Acceso denegado. Asegúrese de que su email esté agregado como usuario de prueba en Google Cloud Console.")
      } else {
        setError(`Error: ${errorMsg}`)
      }
      setIsLoading(false)
      // Limpiar URL
      window.history.replaceState({}, "", window.location.pathname)
      return
    }
    
    // Si no hay mensajes de URL, verificar el estado de conexión
    checkConnectionStatus()
  }, [checkConnectionStatus]) // Incluir checkConnectionStatus en las dependencias

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
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-600">Éxito</p>
            <p className="text-sm text-green-600/80 mt-1">{success}</p>
            <p className="text-xs text-green-600/60 mt-2">
              La conexión se ha establecido correctamente. Puede cerrar esta ventana si se abrió en una nueva pestaña.
            </p>
          </div>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Google Calendar vinculado</p>
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
              Vincule su cuenta de Google Calendar para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Crear eventos automáticamente cuando acepte citas</li>
              <li>Sincronizar horarios disponibles con su calendario</li>
              <li>Recibir recordatorios de citas</li>
              <li>Agregar Google Meet para sesiones online</li>
            </ul>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirigiendo a Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Vincular con Google
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

