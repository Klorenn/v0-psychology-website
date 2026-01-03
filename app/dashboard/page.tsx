"use client"

import { useEffect, useState, useSyncExternalStore, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appointmentsStore, type Appointment } from "@/lib/appointments-store"
import { authStore } from "@/lib/auth-store"
import { Check, X, Clock, LogOut, Calendar, FileText, ExternalLink, Settings, Mail, Video, Copy, CheckCircle, Bell, BellOff, Loader2 } from "lucide-react"
import { requestNotificationPermission, canSendNotifications, notifyAppointmentApproved, notifyAppointmentRejected } from "@/lib/notifications"
import { VisualPageEditor } from "@/components/visual-page-editor"
import { GoogleCalendarSettings } from "@/components/google-calendar-settings"
import { ThemeSelectorExtended } from "@/components/theme-selector-extended"
import { EmailTemplateEditor } from "@/components/email-template-editor"
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
// Estas funciones deben estar fuera del componente y ser estables (misma referencia)
const getServerSnapshotForAuth = () => false // En el servidor siempre false
const getServerSnapshotForAppointments = () => [] // En el servidor siempre array vacío

export default function DashboardPage() {
  const router = useRouter()
  const [timeUpdate, setTimeUpdate] = useState(0)
  const [activeTab, setActiveTab] = useState<"appointments" | "settings">("appointments")
  const [siteConfig, setSiteConfig] = useState(siteConfigStore.get())
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authRestored, setAuthRestored] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [isInitializingDb, setIsInitializingDb] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // RESTAURAR SESIÓN DESDE LOCALSTORAGE INMEDIATAMENTE AL MONTAR
  // Esto debe ejecutarse ANTES de que useSyncExternalStore se evalúe
  useEffect(() => {
    if (typeof window !== "undefined" && !authRestored) {
      // Restaurar sesión desde localStorage si existe
      const restored = authStore.restoreSession()
      setAuthRestored(true)
      
      // Si no se pudo restaurar, redirigir al login
      if (!restored) {
        setIsCheckingAuth(false)
        // Pequeño delay para evitar flash de contenido
        setTimeout(() => {
          router.push("/dashboard/login")
        }, 50)
        return
      }
      
      // Si se restauró correctamente, marcar como no checking
      setIsCheckingAuth(false)
    }
  }, [authRestored, router])

  // Cachear las funciones de snapshot para evitar recrearlas en cada render
  const serverSnapshotForAuth = useMemo(() => getServerSnapshotForAuth, [])
  const serverSnapshotForAppointments = useMemo(() => getServerSnapshotForAppointments, [])

  // useSyncExternalStore siempre se ejecuta, pero el estado interno ya fue restaurado
  const isAuth = useSyncExternalStore(
    authStore.subscribe, 
    authStore.isAuthenticated, 
    serverSnapshotForAuth
  )

  const appointments = useSyncExternalStore(
    appointmentsStore.subscribe, 
    appointmentsStore.getAll, 
    serverSnapshotForAppointments
  )

  // Verificar permisos de notificación al cargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotificationsEnabled(canSendNotifications())
    }
  }, [])

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
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        console.error("Error del servidor:", errorData)
        throw new Error(errorData.error || "Error al guardar la configuración")
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error guardando configuración:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la configuración"
      throw new Error(errorMessage)
    }
  }

  // Initialize store when authenticated and force refresh
  useEffect(() => {
    // Solo inicializar si la sesión fue restaurada y está autenticado
    if (!authRestored) return
    
    if (isAuth) {
      // Inicializar el store cuando el usuario está autenticado
      const initStore = async () => {
        try {
          console.log("🔄 Inicializando store de citas...")
          
          // Llamar al health check que inicializa automáticamente la BD
          try {
            await fetch("/api/health").catch(() => {
              // Ignorar errores del health check, no es crítico
            })
          } catch {
            // Ignorar
          }
          
          await appointmentsStore.init(true) // Forzar recarga
          console.log("✅ Store inicializado")
          
          // Si se cargaron citas o no hubo error, asumir que la DB está inicializada
          const loadedAppointments = appointmentsStore.getAll()
          setDbInitialized(true) // Marcar como inicializada siempre que no haya error
          
          if (loadedAppointments.length > 0) {
            console.log(`📊 ${loadedAppointments.length} citas cargadas`)
          }
          
          // Forzar actualización después de inicializar
          setTimeUpdate((t) => t + 1)
        } catch (error) {
          console.error("❌ Error inicializando store:", error)
          // Intentar inicializar la base de datos si hay error
          try {
            const initResponse = await fetch("/api/db/init")
            const initData = await initResponse.json()
            if (initData.success) {
              console.log("✅ Base de datos inicializada, reintentando carga...")
              setDbInitialized(true)
              await appointmentsStore.init(true)
              setTimeUpdate((t) => t + 1)
            }
          } catch (initError) {
            console.error("❌ Error inicializando base de datos:", initError)
          }
        }
      }
      initStore()
    } else if (!isCheckingAuth) {
      // Solo redirigir si realmente no está autenticado y ya terminamos de verificar
      router.push("/dashboard/login")
    }
  }, [authRestored, isAuth, isCheckingAuth, router])

  // Recargar citas periódicamente para asegurar sincronización
  useEffect(() => {
    if (!isAuth || !authRestored) return
    
    const refreshInterval = setInterval(async () => {
      try {
        await appointmentsStore.init(true) // Forzar recarga
        setTimeUpdate((t) => t + 1)
      } catch (error) {
        console.error("Error en refresh periódico:", error)
      }
    }, 5000) // Recargar cada 5 segundos

    return () => clearInterval(refreshInterval)
  }, [isAuth, authRestored])

  // Update timer every second and check for expired appointments, also refresh appointments
  useEffect(() => {
    if (!isAuth || !authRestored) return
    
    const interval = setInterval(async () => {
      try {
        await appointmentsStore.checkExpired()
        // Recargar citas cada 3 segundos para asegurar sincronización
        if (timeUpdate % 3 === 0) {
          await appointmentsStore.init(true) // Forzar recarga
        }
        setTimeUpdate((t) => t + 1)
      } catch (error) {
        console.error("Error en timer:", error)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isAuth, authRestored, timeUpdate])

  const handleLogout = () => {
    authStore.logout()
    router.push("/dashboard/login")
  }

  const handleManualRefresh = async () => {
    try {
      console.log("🔄 Recarga manual iniciada...")
      setIsInitializingDb(true)
      await appointmentsStore.init(true)
      setTimeUpdate((t) => t + 1)
      console.log("✅ Recarga manual completada")
      // Mostrar feedback visual
      const button = document.querySelector('[data-refresh-button]') as HTMLElement
      if (button) {
        const originalText = button.textContent
        button.textContent = "✓ Recargado"
        setTimeout(() => {
          if (button) button.textContent = originalText
        }, 2000)
      }
    } catch (error) {
      console.error("❌ Error en recarga manual:", error)
      alert("Error al recargar. Por favor, intenta nuevamente.")
    } finally {
      setIsInitializingDb(false)
    }
  }

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Ya están habilitadas, no podemos deshabilitarlas (es configuración del navegador)
      alert("Para deshabilitar notificaciones, ve a la configuración de tu navegador y bloquea las notificaciones para este sitio.")
      return
    }

    // Solicitar permisos
    const granted = await requestNotificationPermission()
    if (granted) {
      setNotificationsEnabled(true)
      notifyAppointmentApproved("Sistema", "ahora", "ahora")
      alert("✅ Notificaciones activadas. Recibirás alertas cuando aceptes o rechaces citas.")
    } else {
      alert("❌ Permisos de notificación denegados. Puedes activarlos más tarde desde la configuración de tu navegador.")
    }
  }

  const pendingAppointments = appointments.filter((a) => a.status === "pending")
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed")
  const expiredAppointments = appointments.filter((a) => a.status === "expired" || a.status === "cancelled")

  // Debug: Log appointments cuando cambian
  useEffect(() => {
    if (isAuth && authRestored) {
      console.log(`📊 Dashboard - Total citas: ${appointments.length}`)
      console.log(`⏳ Pendientes: ${pendingAppointments.length}`)
      console.log(`✅ Confirmadas: ${confirmedAppointments.length}`)
      console.log(`❌ Canceladas/Expiradas: ${expiredAppointments.length}`)
      if (appointments.length > 0) {
        console.log("📋 Todas las citas:", appointments.map(a => ({
          id: a.id,
          name: a.patientName,
          status: a.status,
          date: a.date,
          time: a.time
        })))
      } else {
        console.log("⚠️ No hay citas en el store. Verificando base de datos...")
        // Forzar recarga inmediata si no hay citas
        appointmentsStore.init(true).catch(err => {
          console.error("Error forzando recarga:", err)
        })
      }
    }
  }, [appointments.length, isAuth, authRestored, pendingAppointments.length, confirmedAppointments.length])

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth || !authRestored) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </main>
    )
  }

  // Si no está autenticado después de restaurar, no renderizar nada (ya se redirigió)
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
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleToggleNotifications} 
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              className={notificationsEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "text-muted-foreground hover:text-foreground"}
              title={notificationsEnabled ? "Notificaciones activadas" : "Activar notificaciones"}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones ON
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Activar Notificaciones
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleManualRefresh} 
              disabled={isInitializingDb}
              className="text-muted-foreground hover:text-foreground"
              size="sm"
              data-refresh-button
            >
              {isInitializingDb ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recargando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Recargar
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
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
            <EmailTemplateEditor
              config={siteConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
            <VisualPageEditor
              config={siteConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
          </div>
        ) : (
          <>
            {/* Botón para inicializar DB si es necesario - solo mostrar si no está inicializada y no hay citas */}
            {!dbInitialized && appointments.length === 0 && pendingAppointments.length === 0 && confirmedAppointments.length === 0 && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                      ⚠️ Base de datos puede no estar inicializada
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Si acabas de configurar Supabase, haz clic en el botón para crear las tablas necesarias.
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      setIsInitializingDb(true)
                      try {
                        const response = await fetch("/api/db/init", { method: "POST" })
                        const data = await response.json()
                        if (data.success) {
                          setDbInitialized(true) // Marcar como inicializada
                          // Esperar un momento antes de recargar
                          setTimeout(async () => {
                            await appointmentsStore.init(true)
                            setTimeUpdate((t) => t + 1)
                            setIsInitializingDb(false)
                          }, 500)
                        } else {
                          alert(`Error: ${data.error || data.details || "Error desconocido"}\n\n${data.hint || ""}`)
                          setIsInitializingDb(false)
                        }
                      } catch (error) {
                        console.error("Error:", error)
                        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
                        alert(`Error al inicializar la base de datos: ${errorMessage}\n\nRevisa la consola para más detalles.`)
                        setIsInitializingDb(false)
                      }
                    }}
                    disabled={isInitializingDb}
                    className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                  >
                    {isInitializingDb ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                        Inicializando...
                      </>
                    ) : (
                      "Inicializar Base de Datos"
                    )}
                  </Button>
                </div>
              </div>
            )}

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
                  onApprove={async () => {
                    try {
                      // Actualizar en el servidor primero
                      const response = await fetch("/api/appointments/update-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: appointment.id, status: "confirmed" }),
                      })
                      
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}))
                        throw new Error(errorData.error || "Error al confirmar la cita")
                      }
                      
                      // Esperar un momento para que se propague el cambio en la BD
                      await new Promise(resolve => setTimeout(resolve, 500))
                      
                      // Recargar desde la BD para asegurar sincronización
                      await appointmentsStore.init(true)
                      
                      // Forzar actualización de la UI
                      setTimeUpdate((t) => t + 1)
                      
                      // Enviar notificación si está habilitada
                      if (notificationsEnabled) {
                        const dateStr = `${appointment.date.getDate()} de ${monthNames[appointment.date.getMonth()]}`
                        notifyAppointmentApproved(appointment.patientName, dateStr, appointment.time)
                      }
                      
                      // Mostrar feedback
                      alert(`✅ Cita de ${appointment.patientName} confirmada correctamente`)
                    } catch (error) {
                      console.error("Error aprobando cita:", error)
                      alert(`❌ Error: ${error instanceof Error ? error.message : "Error al confirmar la cita"}`)
                    }
                  }}
                  onReject={async () => {
                    // Confirmación antes de rechazar
                    const confirmMessage = `¿Estás seguro de que deseas rechazar la cita de ${appointment.patientName}?\n\nEsta acción no se puede deshacer.`
                    if (!window.confirm(confirmMessage)) {
                      return
                    }
                    
                    try {
                      // Actualizar en el servidor primero
                      const response = await fetch("/api/appointments/update-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: appointment.id, status: "cancelled" }),
                      })
                      
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}))
                        throw new Error(errorData.error || "Error al rechazar la cita")
                      }
                      
                      // Esperar un momento para que se propague el cambio en la BD
                      await new Promise(resolve => setTimeout(resolve, 500))
                      
                      // Recargar desde la BD para asegurar sincronización
                      await appointmentsStore.init(true)
                      
                      // Forzar actualización de la UI
                      setTimeUpdate((t) => t + 1)
                      
                      // Enviar notificación si está habilitada
                      if (notificationsEnabled) {
                        notifyAppointmentRejected(appointment.patientName)
                      }
                      
                      // Mostrar feedback
                      alert(`✅ Cita de ${appointment.patientName} rechazada correctamente`)
                    } catch (error) {
                      console.error("Error rechazando cita:", error)
                      alert(`❌ Error: ${error instanceof Error ? error.message : "Error al rechazar la cita"}`)
                    }
                  }}
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
                <ConfirmedAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  siteConfig={siteConfig}
                  onConfigChange={handleConfigChange}
                  onSaveConfig={handleSaveConfig}
                />
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
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

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
          <div className="flex-1">
            <div className="space-y-2">
              <div>
                <p className="font-medium text-foreground">{appointment.patientName}</p>
                <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
                <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
              </div>
              {appointment.consultationReason && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Motivo de consulta:</p>
                  <p className="text-xs text-foreground italic">{appointment.consultationReason}</p>
                </div>
              )}
              {appointment.emergencyContactName && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Contacto de emergencia:</p>
                  {appointment.emergencyContactRelation && (
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Relación:</span> {appointment.emergencyContactRelation.charAt(0).toUpperCase() + appointment.emergencyContactRelation.slice(1)}
                    </p>
                  )}
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Nombre:</span> {appointment.emergencyContactName}
                  </p>
                  {appointment.emergencyContactPhone && (
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Teléfono:</span> {appointment.emergencyContactPhone}
                    </p>
                  )}
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
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-foreground">
              {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]} · {appointment.time}
            </p>
            <Badge variant="outline" className="mt-1 capitalize text-xs">
              {appointment.appointmentType}
            </Badge>
            {appointment.createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Pedido el {appointment.createdAt.getDate()} de {monthNames[appointment.createdAt.getMonth()]} a las {appointment.createdAt.getHours().toString().padStart(2, "0")}:{appointment.createdAt.getMinutes().toString().padStart(2, "0")}
              </p>
            )}
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
            <Button 
              size="sm" 
              onClick={async () => {
                setIsApproving(true)
                try {
                  await onApprove()
                } finally {
                  setIsApproving(false)
                }
              }}
              disabled={isApproving || isRejecting}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Confirmar cita"
            >
              {isApproving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={async () => {
                setIsRejecting(true)
                try {
                  await onReject()
                } finally {
                  setIsRejecting(false)
                }
              }}
              disabled={isApproving || isRejecting}
              className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Rechazar cita"
            >
              {isRejecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmedAppointmentCard({ 
  appointment,
  siteConfig,
  onConfigChange,
  onSaveConfig,
}: { 
  appointment: Appointment
  siteConfig: any
  onConfigChange: (config: any) => void
  onSaveConfig: () => Promise<void>
}) {
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isCreatingMeet, setIsCreatingMeet] = useState(false)
  const [showEmailPreset, setShowEmailPreset] = useState(false)
  const [emailPreset, setEmailPreset] = useState<{ subject: string; body: string } | null>(null)
  const [editingPreset, setEditingPreset] = useState(false)
  const [editedSubject, setEditedSubject] = useState("")
  const [editedBody, setEditedBody] = useState("")
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [copied, setCopied] = useState(false)
  const [meetLink, setMeetLink] = useState<string | null>(null)

  const handleSendEmail = async (createMeet: boolean = false) => {
    setIsSendingEmail(true)
    try {
      const response = await fetch("/api/appointments/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, createMeet }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el correo")
      }

      const data = await response.json()
      if (data.meetLink) {
        setMeetLink(data.meetLink)
      }
      alert("Correo enviado correctamente")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al enviar el correo")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleCreateMeet = async () => {
    setIsCreatingMeet(true)
    try {
      const response = await fetch("/api/appointments/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, createMeet: true }),
      })

      if (!response.ok) {
        throw new Error("Error al crear Google Meet")
      }

      const data = await response.json()
      if (data.meetLink) {
        setMeetLink(data.meetLink)
        alert(`Google Meet creado: ${data.meetLink}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear Google Meet")
    } finally {
      setIsCreatingMeet(false)
    }
  }

  const handleShowEmailPreset = async () => {
    try {
      const response = await fetch(`/api/appointments/send-confirmation-email?appointmentId=${appointment.id}`)
      if (response.ok) {
        const data = await response.json()
        const preset = { subject: data.emailSubject, body: data.emailBody }
        setEmailPreset(preset)
        setEditedSubject(preset.subject)
        setEditedBody(preset.body)
        setShowEmailPreset(true)
        setEditingPreset(false)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleEditPreset = () => {
    setEditingPreset(true)
  }

  const handleSavePreset = async () => {
    setIsSavingPreset(true)
    try {
      // Actualizar el siteConfig con el nuevo template
      const updatedConfig = {
        ...siteConfig,
        emailTemplate: {
          subject: editedSubject,
          body: editedBody,
        },
      }
      onConfigChange(updatedConfig)
      await onSaveConfig()
      
      // Actualizar el preset mostrado
      setEmailPreset({ subject: editedSubject, body: editedBody })
      setEditingPreset(false)
      alert("✅ Plantilla de correo guardada correctamente")
    } catch (error) {
      console.error("Error guardando preset:", error)
      alert("❌ Error al guardar la plantilla")
    } finally {
      setIsSavingPreset(false)
    }
  }

  const handleCancelEdit = () => {
    // Restaurar valores originales
    if (emailPreset) {
      setEditedSubject(emailPreset.subject)
      setEditedBody(emailPreset.body)
    }
    setEditingPreset(false)
  }

  const handleCopyPreset = () => {
    if (emailPreset) {
      const text = `Asunto: ${emailPreset.subject}\n\n${emailPreset.body}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border-l-4 border-green-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              <div>
                <p className="font-medium text-foreground">{appointment.patientName}</p>
                <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
                <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
              </div>
              {appointment.consultationReason && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Motivo de consulta:</p>
                  <p className="text-xs text-foreground italic">{appointment.consultationReason}</p>
                </div>
              )}
              {appointment.emergencyContactName && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Contacto de emergencia:</p>
                  {appointment.emergencyContactRelation && (
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Relación:</span> {appointment.emergencyContactRelation.charAt(0).toUpperCase() + appointment.emergencyContactRelation.slice(1)}
                    </p>
                  )}
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <span className="font-medium">Nombre:</span> {appointment.emergencyContactName}
                  </p>
                  {appointment.emergencyContactPhone && (
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Teléfono:</span> {appointment.emergencyContactPhone}
                    </p>
                  )}
                </div>
              )}
              {meetLink && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">Google Meet:</p>
                  <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-800 dark:text-green-200 hover:underline">
                    {meetLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-foreground">
              {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]} · {appointment.time}
            </p>
            <Badge variant="outline" className="mt-1 capitalize text-xs">
              {appointment.appointmentType}
            </Badge>
            {appointment.createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Pedido el {appointment.createdAt.getDate()} de {monthNames[appointment.createdAt.getMonth()]} a las {appointment.createdAt.getHours().toString().padStart(2, "0")}:{appointment.createdAt.getMinutes().toString().padStart(2, "0")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {appointment.appointmentType === "online" && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateMeet}
                disabled={isCreatingMeet || !!meetLink}
                className="text-xs"
              >
                <Video className="w-3.5 h-3.5 mr-1" />
                {meetLink ? "Meet Creado" : "Crear Meet"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleShowEmailPreset}
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Ver Preset
            </Button>
            <Button
              size="sm"
              onClick={() => handleSendEmail(false)}
              disabled={isSendingEmail}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-3.5 h-3.5 mr-1" />
              {isSendingEmail ? "Enviando..." : "Enviar Correo"}
            </Button>
            {appointment.appointmentType === "online" && (
              <Button
                size="sm"
                onClick={() => handleSendEmail(true)}
                disabled={isSendingEmail}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Mail className="w-3.5 h-3.5 mr-1" />
                {isSendingEmail ? "Enviando..." : "Correo + Meet"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {showEmailPreset && emailPreset && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">Preset de Correo:</p>
            <div className="flex gap-2">
              {!editingPreset && (
                <>
                  <Button size="sm" variant="outline" onClick={handleEditPreset} className="text-xs">
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopyPreset} className="text-xs">
                    {copied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => {
                setShowEmailPreset(false)
                setEditingPreset(false)
              }} className="text-xs">
                Cerrar
              </Button>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Asunto:</p>
              {editingPreset ? (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full text-foreground bg-background p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Asunto del correo"
                />
              ) : (
                <p className="text-foreground bg-background p-2 rounded border">{emailPreset.subject}</p>
              )}
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1.5">Cuerpo:</p>
              {editingPreset ? (
                <textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  rows={8}
                  className="w-full text-foreground bg-background p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-accent font-mono text-xs resize-y"
                  placeholder="Contenido del correo"
                />
              ) : (
                <p className="text-foreground bg-background p-2 rounded border whitespace-pre-wrap">{emailPreset.body}</p>
              )}
            </div>
            {editingPreset && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSavePreset}
                  disabled={isSavingPreset}
                  className="text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSavingPreset ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Guardar Plantilla
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSavingPreset}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
