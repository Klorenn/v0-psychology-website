"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appointmentsStore, type Appointment } from "@/lib/appointments-store"
import { authStore } from "@/lib/auth-store"
import { Check, X, Clock, LogOut, Calendar, FileText, ExternalLink, Settings } from "lucide-react"
import { VisualPageEditor } from "@/components/visual-page-editor"
import { GoogleCalendarSettings } from "@/components/google-calendar-settings"
import { ThemeSelectorExtended } from "@/components/theme-selector-extended"
import { useSiteConfig } from "@/lib/use-site-config"
import { siteConfigStore } from "@/lib/site-config"

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  if (diff <= 0) return "Expirado"
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// Funciones de snapshot en caché para evitar loops infinitos
const getServerSnapshotForAuth = () => false // En el servidor siempre false
const getServerSnapshotForAppointments = () => []

export default function DashboardPage() {
  const router = useRouter()
  const [timeUpdate, setTimeUpdate] = useState(0)
  const [activeTab, setActiveTab] = useState<"appointments" | "settings">("appointments")
  const [siteConfig, setSiteConfig] = useState(siteConfigStore.get())
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [initialAuthCheck, setInitialAuthCheck] = useState(false)

  // RESTAURAR SESIÓN DESDE LOCALSTORAGE INMEDIATAMENTE AL MONTAR
  useEffect(() => {
    if (typeof window !== "undefined" && !initialAuthCheck) {
      // Restaurar sesión desde localStorage si existe
      const restored = authStore.restoreSession()
      setInitialAuthCheck(true)
      setIsCheckingAuth(false)
      
      // Si no se pudo restaurar, redirigir al login después de un pequeño delay
      if (!restored) {
        setTimeout(() => {
          router.push("/dashboard/login")
        }, 100)
      }
    }
  }, [initialAuthCheck, router])

  const isAuth = useSyncExternalStore(authStore.subscribe, authStore.isAuthenticated, getServerSnapshotForAuth)

  const appointments = useSyncExternalStore(appointmentsStore.subscribe, appointmentsStore.getAll, getServerSnapshotForAppointments)

  // Load site config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const config = await response.json()
          // Asegurar que el tema tenga valores por defecto si no existen
          if (!config.theme) {
            config.theme = {
              themeId: "lavender",
              darkThemeId: "dark-lavender",
              darkMode: false,
            }
          }
          siteConfigStore.set(config)
          setSiteConfig(config)
        }
      } catch (error) {
        console.error("Error cargando configuración:", error)
      }
    }
    loadConfig()

    const unsubscribe = siteConfigStore.subscribe(() => {
      setSiteConfig(siteConfigStore.get())
    })

    return unsubscribe
  }, [])

  // Si hay parámetros de Google Calendar en la URL, cambiar a la pestaña de settings
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("calendar_connected") || urlParams.get("calendar_error")) {
      setActiveTab("settings")
    }
  }, [])

  const handleConfigChange = (newConfig: typeof siteConfig) => {
    setSiteConfig(newConfig)
    siteConfigStore.set(newConfig)
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfig),
      })
      if (!response.ok) {
        throw new Error("Error al guardar")
      }
    } catch (error) {
      console.error("Error guardando configuración:", error)
      throw error
    }
  }

  // Initialize store and check auth on mount
  useEffect(() => {
    // Esperar a que se complete la verificación inicial
    if (!initialAuthCheck) return
    
    const checkAuth = () => {
      const authenticated = authStore.isAuthenticated()
      
      if (!authenticated) {
        // Solo redirigir si realmente no está autenticado
        router.push("/dashboard/login")
      } else {
        // Inicializar el store cuando el usuario está autenticado
        appointmentsStore.init()
      }
    }
    
    // Verificar después de que se complete la verificación inicial
    checkAuth()
    
    // También verificar cuando cambie el estado
    const unsubscribe = authStore.subscribe(() => {
      checkAuth()
    })
    
    return unsubscribe
  }, [router, initialAuthCheck])

  // Update timer every second and check for expired appointments
  useEffect(() => {
    const interval = setInterval(async () => {
      await appointmentsStore.checkExpired()
      setTimeUpdate((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    authStore.logout()
    router.push("/dashboard/login")
  }

  const pendingAppointments = appointments.filter((a) => a.status === "pending")
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed")
  const expiredAppointments = appointments.filter((a) => a.status === "expired" || a.status === "cancelled")

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth || !initialAuthCheck) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </main>
    )
  }

  if (!isAuth) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-foreground">{siteConfig.navigation.logoText || "Dashboard"}</h1>
            <p className="text-sm text-muted-foreground">Gestión de citas</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "appointments"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Citas
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "settings"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuración del Sitio
          </button>
        </div>

        {activeTab === "settings" ? (
          <div className="space-y-6">
            <GoogleCalendarSettings />
            <ThemeSelectorExtended />
            <VisualPageEditor
              config={siteConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{pendingAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{confirmedAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{expiredAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Canceladas/Expiradas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Appointments */}
        <section className="mb-8">
          <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Solicitudes pendientes
          </h2>

          {pendingAppointments.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-sm">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onApprove={async () => await appointmentsStore.approve(appointment.id)}
                  onReject={async () => await appointmentsStore.reject(appointment.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Confirmed Appointments */}
        <section className="mb-8">
          <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Citas confirmadas
          </h2>

          {confirmedAppointments.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-sm">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No hay citas confirmadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {confirmedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-card rounded-xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
                      <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
                      {appointment.consultationReason && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Motivo de consulta:</p>
                          <p className="text-xs text-foreground italic">{appointment.consultationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.time} hrs</p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {appointment.appointmentType}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Expired/Cancelled */}
        {expiredAppointments.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              Canceladas / Expiradas
            </h2>
            <div className="space-y-3 opacity-60">
              {expiredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-card rounded-xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground line-through">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
                      <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="rounded-full">
                    {appointment.status === "expired" ? "Expirada" : "Cancelada"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </div>
    </main>
  )
}

function AppointmentCard({
  appointment,
  onApprove,
  onReject,
}: {
  appointment: Appointment
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
}) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(appointment.expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(appointment.expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [appointment.expiresAt])

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border-l-4 border-amber-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">{appointment.patientName}</p>
            <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
            <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
            {appointment.consultationReason && (
              <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Motivo de consulta:</p>
                <p className="text-xs text-foreground italic">{appointment.consultationReason}</p>
              </div>
            )}
            {appointment.receiptUrl && (
              <div className="mt-2">
                <a
                  href={appointment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Ver comprobante
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-foreground">
              {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]}
            </p>
            <p className="text-sm text-muted-foreground">{appointment.time} hrs</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {appointment.appointmentType}
            </Badge>
            {appointment.receiptUrl && (
              <Badge variant="secondary" className="mt-1 text-xs">
                ✓ Comprobante
              </Badge>
            )}
          </div>

          <Badge variant="secondary" className="rounded-full font-mono">
            {timeRemaining}
          </Badge>

          <div className="flex gap-2">
            <Button size="sm" onClick={onApprove} className="rounded-full bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
