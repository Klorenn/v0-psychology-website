"use client"

import { useEffect, useState, useSyncExternalStore, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appointmentsStore, type Appointment } from "@/lib/appointments-store"
import { authStore } from "@/lib/auth-store"
import { Check, X, Clock, LogOut, Calendar, FileText, ExternalLink, Settings, Mail, Video, CheckCircle, Bell, BellOff, Loader2, Star, ChevronDown, ChevronUp, Trash2, BarChart3, TrendingUp, Palette, Layout, GraduationCap, User } from "lucide-react"
import { AppointmentMenu } from "@/components/ui/appointment-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { requestNotificationPermission, canSendNotifications, notifyAppointmentApproved, notifyAppointmentRejected } from "@/lib/notifications"
import { VisualPageEditor } from "@/components/visual-page-editor"
import { ThemeSelectorExtended } from "@/components/theme-selector-extended"
import { EmailTemplateEditor } from "@/components/email-template-editor"
import { NavigationOrderEditor } from "@/components/navigation-order-editor"
import { ReviewsPanel } from "@/components/reviews-panel"
import { CoursesAndReadingsEditor } from "@/components/courses-and-readings-editor"
import { ConfigSection } from "@/components/ui/config-section"
import { AboutMeEditor } from "@/components/about-me-editor"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { FreeSlotManager } from "@/components/free-slot-manager"
import { GoogleCalendarSettings } from "@/components/google-calendar-settings"
import { useSiteConfig } from "@/lib/use-site-config"
import { siteConfigStore } from "@/lib/site-config"
import { authenticatedFetch } from "@/lib/api-client"

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

// Formatear fecha con hora de Santiago, Chile
// IMPORTANTE: La fecha viene guardada en UTC desde la BD (ej: "2026-01-03T21:13:38Z")
// pero representa la hora de Santiago (ej: 18:13). Intl.DateTimeFormat con timeZone
// convierte correctamente de UTC a hora de Santiago al formatear.
function formatSantiagoDateTime(date: Date | string): string {
  // Si la fecha es un string, convertirla a Date
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // Crear un formatter que convierta de UTC a hora de Santiago
  // timeZone: "America/Santiago" hace la conversión automáticamente
  const formatter = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  
  // Extraer las partes - estas ya están en hora de Santiago
  const parts = formatter.formatToParts(dateObj)
  const day = parts.find(p => p.type === "day")?.value
  const month = parts.find(p => p.type === "month")?.value
  const hour = parts.find(p => p.type === "hour")?.value
  const minute = parts.find(p => p.type === "minute")?.value
  
  if (!day || !month || !hour || !minute) {
    // Fallback si no se pueden extraer las partes
    const fallbackDate = new Date(dateObj.toLocaleString("es-CL", { timeZone: "America/Santiago" }))
    return `${fallbackDate.getDate()} de ${monthNames[fallbackDate.getMonth()]} a las ${fallbackDate.getHours().toString().padStart(2, "0")}:${fallbackDate.getMinutes().toString().padStart(2, "0")}`
  }
  
  // Capitalizar el mes
  const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1)
  
  return `${day} de ${monthCapitalized} a las ${hour}:${minute}`
}

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
// IMPORTANTE: Usar constantes para los valores de retorno para evitar recrear objetos/arrays

// Valores constantes para los snapshots del servidor
const SERVER_SNAPSHOT_AUTH = false
const SERVER_SNAPSHOT_APPOINTMENTS: Appointment[] = []

// Funciones estables que retornan valores constantes
// Estas funciones nunca cambian su referencia porque están fuera del componente
function getServerSnapshotForAuth() {
  return SERVER_SNAPSHOT_AUTH
}

function getServerSnapshotForAppointments() {
  return SERVER_SNAPSHOT_APPOINTMENTS
}

export default function DashboardPage() {
  const router = useRouter()
  const [timeUpdate, setTimeUpdate] = useState(0)
  const [activeTab, setActiveTab] = useState<"appointments" | "settings" | "reviews" | "history">("appointments")
  const [siteConfig, setSiteConfig] = useState(siteConfigStore.get())
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authRestored, setAuthRestored] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [isInitializingDb, setIsInitializingDb] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showExpiredAppointments, setShowExpiredAppointments] = useState(false)
  const [showPendingAppointments, setShowPendingAppointments] = useState(false)
  const [showConfirmedAppointments, setShowConfirmedAppointments] = useState(false)
  const [isClearingAppointments, setIsClearingAppointments] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showFinalConfirmDialog, setShowFinalConfirmDialog] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // RESTAURAR SESIÓN DESDE LOCALSTORAGE INMEDIATAMENTE AL MONTAR
  // Esto debe ejecutarse ANTES de que useSyncExternalStore se evalúe
  useEffect(() => {
    if (typeof window !== "undefined" && !authRestored) {
      // Restaurar sesión desde localStorage si existe (async)
      authStore.restoreSession().then((restored) => {
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
      }).catch(() => {
        setAuthRestored(true)
        setIsCheckingAuth(false)
        setTimeout(() => {
          router.push("/dashboard/login")
        }, 50)
      })
    }
  }, [authRestored, router])

  // Cachear las funciones de snapshot usando useMemo para evitar recrearlas
  // Esto es necesario porque React requiere que getServerSnapshot sea estable
  const serverSnapshotAuth = useMemo(() => getServerSnapshotForAuth, [])
  const serverSnapshotAppointments = useMemo(() => getServerSnapshotForAppointments, [])

  // useSyncExternalStore siempre se ejecuta, pero el estado interno ya fue restaurado
  // Usar las funciones cacheadas
  const isAuth = useSyncExternalStore(
    authStore.subscribe, 
    authStore.isAuthenticated, 
    serverSnapshotAuth
  )

  const appointments = useSyncExternalStore(
    appointmentsStore.subscribe, 
    appointmentsStore.getAll, 
    serverSnapshotAppointments
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
          // Asegurar que navigation.order tenga valores por defecto si faltan
          if (!config.navigation?.order || !Array.isArray(config.navigation.order)) {
            config.navigation = {
              ...config.navigation,
              order: [
                "menu-items",
                "separator",
                "social-icons",
                "booking-button",
                "theme-toggle",
              ],
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


  const handleConfigChange = (newConfig: typeof siteConfig) => {
    setSiteConfig(newConfig)
    siteConfigStore.set(newConfig)
  }

  const handleSaveConfig = async () => {
    try {
      const response = await authenticatedFetch("/api/site-config", {
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

  const handleClearAllAppointments = async () => {
    setIsClearingAppointments(true)
    try {
      const response = await authenticatedFetch("/api/appointments/clear-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || "Error al limpiar las citas")
      }

      // Recargar las citas
      await appointmentsStore.init(true)
      setTimeUpdate((t) => t + 1)
      alert("✅ Todas las citas han sido eliminadas correctamente")
    } catch (error) {
      console.error("Error limpiando citas:", error)
      alert("❌ Error al limpiar las citas: " + (error instanceof Error ? error.message : "Error desconocido"))
    } finally {
      setIsClearingAppointments(false)
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
      // Cerrar modales de gráficos/estadísticas para evitar errores de Recharts
      setShowChart(false)
      setShowStatistics(false)
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
  const attendedAppointments = appointments.filter((a) => a.status === "attended")
  const expiredAppointments = appointments.filter((a) => a.status === "expired" || a.status === "cancelled")

  // Datos del gráfico memoizados para evitar re-renders innecesarios
  const chartData = useMemo(() => {
    if (!showChart) return []
    return monthNames.map((month, index) => {
      const count = attendedAppointments.filter((apt) => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === index && aptDate.getFullYear() === selectedYear
      }).length
      return {
        mes: month.substring(0, 3),
        pacientes: count,
      }
    })
  }, [showChart, attendedAppointments, selectedYear])

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
            <ThemeToggle className="shrink-0" />
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
          <ContextMenu>
            <ContextMenuTrigger asChild>
          <button
            onClick={() => setActiveTab("appointments")}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isClearingAppointments && appointments.length > 0) {
                    setShowClearDialog(true)
                  }
                }}
                className={`px-4 py-2 font-medium text-sm transition-all rounded-t-lg ${
              activeTab === "appointments"
                ? "text-foreground border-b-2 border-accent"
                    : "text-muted-foreground hover:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 hover:font-semibold"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Citas
          </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogTrigger asChild>
                  <ContextMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20"
                    disabled={isClearingAppointments || appointments.length === 0}
                    onSelect={(e) => {
                      e.preventDefault()
                      setShowClearDialog(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isClearingAppointments ? "Limpiando..." : "Limpiar Todo"}
                  </ContextMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 dark:text-red-400">
                      ⚠️ Advertencia: Eliminar Todas las Citas
                    </AlertDialogTitle>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        Esta acción eliminará <strong>todas las citas</strong> de la base de datos, incluyendo:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Citas pendientes ({pendingAppointments.length})</li>
                        <li>Citas confirmadas ({confirmedAppointments.length})</li>
                        <li>Citas atendidas ({attendedAppointments.length})</li>
                        <li>Citas canceladas/expiradas ({expiredAppointments.length})</li>
                      </ul>
                      <p className="font-semibold text-red-600 dark:text-red-400 mt-4">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      disabled={isClearingAppointments}
                      onClick={() => setShowClearDialog(false)}
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setShowClearDialog(false)
                        setShowFinalConfirmDialog(true)
                      }}
                      disabled={isClearingAppointments}
                      className="bg-red-600 hover:bg-red-700 text-white border border-red-700 dark:border-red-500 shadow-sm hover:shadow-md transition-all font-medium px-4 py-2 text-sm rounded-md"
                    >
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ContextMenuContent>
          </ContextMenu>

          {/* Diálogo de confirmación final */}
          <AlertDialog open={showFinalConfirmDialog} onOpenChange={setShowFinalConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Confirmar Eliminación
                </AlertDialogTitle>
                <div className="space-y-3 text-sm text-muted-foreground pt-2">
                  <p className="font-medium text-foreground">
                    ¿Estás completamente seguro de que deseas eliminar todas las citas?
                  </p>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
                    <p className="text-red-800 dark:text-red-200 font-semibold">
                      Esto eliminará permanentemente:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 ml-2">
                      <li>{pendingAppointments.length} citas pendientes</li>
                      <li>{confirmedAppointments.length} citas confirmadas</li>
                      <li>{attendedAppointments.length} citas atendidas</li>
                      <li>{expiredAppointments.length} citas canceladas/expiradas</li>
                    </ul>
                  </div>
                  <p className="font-semibold text-red-600 dark:text-red-400 pt-2">
                    ⚠️ Esta acción es irreversible y no se puede deshacer.
                  </p>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isClearingAppointments}
                  onClick={() => setShowFinalConfirmDialog(false)}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await handleClearAllAppointments()
                    setShowFinalConfirmDialog(false)
                  }}
                  disabled={isClearingAppointments}
                  className="bg-red-600 hover:bg-red-700 text-white border border-red-700 dark:border-red-500 shadow-sm hover:shadow-md transition-all font-medium px-4 py-2 text-sm rounded-md"
                >
                  {isClearingAppointments ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Confirmar Eliminación
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 font-medium text-sm transition-all rounded-t-lg ${
              activeTab === "reviews"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 hover:font-semibold"
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Reseñas
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium text-sm transition-all rounded-t-lg ${
              activeTab === "history"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 hover:font-semibold"
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Historial
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-medium text-sm transition-all rounded-t-lg ${
              activeTab === "settings"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 hover:font-semibold"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuración del Sitio
          </button>
        </div>

        {activeTab === "reviews" ? (
          <ReviewsPanel />
        ) : activeTab === "history" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground mb-2">Historial de Pacientes Atendidos</h2>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{attendedAppointments.length}</span> pacientes atendidos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowStatistics(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Estadísticas
                </Button>
                <Button
                  onClick={() => setShowChart(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Ver en Gráfico
                </Button>
              </div>
            </div>
            {attendedAppointments.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center shadow-sm">
                <CheckCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay citas atendidas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendedAppointments
                  .sort((a, b) => {
                    // Ordenar por fecha más reciente primero
                    const dateA = new Date(a.date).getTime()
                    const dateB = new Date(b.date).getTime()
                    return dateB - dateA
                  })
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-card rounded-xl p-4 shadow-sm border-l-4 border-indigo-400"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
                            <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
                            {appointment.consultationReason && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {appointment.consultationReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground">
                            {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]} · {appointment.time}
                          </p>
                          <Badge variant="outline" className="mt-1 capitalize text-xs bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                            {appointment.appointmentType}
                          </Badge>
                          {appointment.createdAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Atendido el {formatSantiagoDateTime(appointment.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Modal de Estadísticas */}
            <Dialog open={showStatistics} onOpenChange={setShowStatistics}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-foreground">
                    Estadísticas de Pacientes Atendidos
                  </DialogTitle>
                  <DialogDescription>
                    Filtra por mes y año para ver las estadísticas detalladas
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Filtros */}
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">Mes</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {monthNames.map((month, index) => (
                          <option key={index} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">Año</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  {(() => {
                    const filteredAppointments = attendedAppointments.filter((apt) => {
                      const aptDate = new Date(apt.date)
                      return aptDate.getMonth() === selectedMonth && aptDate.getFullYear() === selectedYear
                    })

                    const totalMonth = filteredAppointments.length
                    const onlineCount = filteredAppointments.filter((apt) => apt.appointmentType === "online").length
                    const presencialCount = filteredAppointments.filter((apt) => apt.appointmentType === "presencial").length

                    return (
                      <div className="space-y-4">
                        <div className="bg-card rounded-xl p-6 border border-border">
                          <h3 className="font-semibold text-lg text-foreground mb-4">
                            {monthNames[selectedMonth]} {selectedYear}
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-foreground">{totalMonth}</p>
                              <p className="text-sm text-muted-foreground">Total Atendidos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{onlineCount}</p>
                              <p className="text-sm text-muted-foreground">Online</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{presencialCount}</p>
                              <p className="text-sm text-muted-foreground">Presencial</p>
                            </div>
                          </div>
                        </div>

                        {totalMonth === 0 ? (
                          <div className="bg-muted/50 rounded-xl p-8 text-center">
                            <p className="text-muted-foreground">No hay pacientes atendidos en este período</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="font-medium text-foreground">Pacientes:</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {filteredAppointments.map((apt) => (
                                <div key={apt.id} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-foreground">{apt.patientName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {apt.date.getDate()} de {monthNames[apt.date.getMonth()]} · {apt.time}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="capitalize">
                                    {apt.appointmentType}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de Gráfico */}
            <Dialog open={showChart} onOpenChange={setShowChart}>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-foreground">
                    Gráfico de Pacientes Atendidos
                  </DialogTitle>
                  <DialogDescription>
                    Visualización de pacientes atendidos por mes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Filtro de año para el gráfico */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-foreground">Año:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gráfico */}
                  {showChart && chartData.length > 0 && (
                    <div className="w-full h-96" key={`chart-${selectedYear}-${chartData.length}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartData} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          key={`barchart-${selectedYear}`}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="mes" 
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Bar 
                            dataKey="pacientes" 
                            fill="hsl(var(--accent))"
                            name="Pacientes Atendidos"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {showChart && chartData.length === 0 && (
                    <div className="w-full h-96 flex items-center justify-center bg-muted/50 rounded-xl">
                      <p className="text-muted-foreground">No hay datos para mostrar</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : activeTab === "settings" ? (
          <div className="space-y-4">
            <ConfigSection
              title="Sobre mí"
              icon={<User className="w-5 h-5" />}
            >
              <AboutMeEditor
                config={siteConfig}
                onConfigChange={handleConfigChange}
                onSave={handleSaveConfig}
              />
            </ConfigSection>

            <ConfigSection
              title="Personalización de Colores"
              icon={<Palette className="w-5 h-5" />}
            >
            <ThemeSelectorExtended />
            </ConfigSection>

            <ConfigSection
              title="Plantilla de Email"
              icon={<Mail className="w-5 h-5" />}
            >
            <EmailTemplateEditor
              config={siteConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
            </ConfigSection>

            <ConfigSection
              title="Google Calendar"
              icon={<Calendar className="w-5 h-5" />}
            >
              <GoogleCalendarSettings />
            </ConfigSection>

            <ConfigSection
              title="Orden de Navegación"
              icon={<Layout className="w-5 h-5" />}
            >
              <NavigationOrderEditor
                config={siteConfig}
                onConfigChange={handleConfigChange}
                onSave={handleSaveConfig}
              />
            </ConfigSection>

            <ConfigSection
              title="Editor Visual de Página"
              icon={<Layout className="w-5 h-5" />}
            >
            <VisualPageEditor
              config={siteConfig}
              onConfigChange={handleConfigChange}
              onSave={handleSaveConfig}
            />
            </ConfigSection>

            <ConfigSection
              title="Cursos, Diplomados y Recomendaciones"
              icon={<GraduationCap className="w-5 h-5" />}
            >
              <CoursesAndReadingsEditor
                config={siteConfig}
                onConfigChange={handleConfigChange}
                onSave={handleSaveConfig}
              />
            </ConfigSection>

            <ConfigSection
              title="Liberar Horarios"
              icon={<Clock className="w-5 h-5" />}
            >
              <FreeSlotManager />
            </ConfigSection>
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
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{pendingAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{confirmedAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
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
          <button
            onClick={() => setShowPendingAppointments(!showPendingAppointments)}
            className="w-full flex items-center justify-between p-4 bg-card rounded-xl shadow-sm border border-border/50 hover:bg-muted/50 transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-xl text-foreground">
                Solicitudes pendientes ({pendingAppointments.length})
          </h2>
            </div>
            {showPendingAppointments ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {showPendingAppointments && (
            <>
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
                      const response = await authenticatedFetch("/api/appointments/update-status", {
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
                      const response = await authenticatedFetch("/api/appointments/update-status", {
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
            </>
          )}
        </section>

        {/* Confirmed Appointments */}
        <section className="mb-8">
          <button
            onClick={() => setShowConfirmedAppointments(!showConfirmedAppointments)}
            className="w-full flex items-center justify-between p-4 bg-card rounded-xl shadow-sm border border-border/50 hover:bg-muted/50 transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
              <h2 className="font-serif text-xl text-foreground">
                Citas confirmadas ({confirmedAppointments.length})
          </h2>
            </div>
            {showConfirmedAppointments ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {showConfirmedAppointments && (
            <>
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
            </>
          )}
        </section>

        {/* Expired/Cancelled - Colapsable */}
        {expiredAppointments.length > 0 && (
          <section>
            <button
              onClick={() => setShowExpiredAppointments(!showExpiredAppointments)}
              className="w-full flex items-center justify-between p-4 bg-card rounded-xl shadow-sm border border-border/50 hover:bg-muted/50 transition-colors mb-4"
            >
              <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
                <h2 className="font-serif text-xl text-foreground">
                  Canceladas / Expiradas ({expiredAppointments.length})
            </h2>
              </div>
              {showExpiredAppointments ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {showExpiredAppointments && (
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
            )}
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
                Pedido el {formatSantiagoDateTime(appointment.createdAt)}
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

          <AppointmentMenu
            items={[
              {
                label: isApproving ? "Confirmando..." : "Confirmar cita",
                icon: isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />,
                onClick: async () => {
                setIsApproving(true)
                try {
                  await onApprove()
                } finally {
                  setIsApproving(false)
                }
                },
                disabled: isApproving || isRejecting,
              },
              {
                label: isRejecting ? "Rechazando..." : "Rechazar cita",
                icon: isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />,
                onClick: async () => {
                setIsRejecting(true)
                try {
                  await onReject()
                } finally {
                  setIsRejecting(false)
                }
                },
                disabled: isApproving || isRejecting,
                variant: 'destructive',
              },
            ]}
          />
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
  const [meetLink, setMeetLink] = useState<string | null>(appointment.meetLink || null)
  const [showMeetDialog, setShowMeetDialog] = useState(false)
  const [newMeetLink, setNewMeetLink] = useState<string | null>(null)

  // Actualizar meetLink cuando el appointment cambie
  useEffect(() => {
    if (appointment.meetLink) {
      setMeetLink(appointment.meetLink)
    }
  }, [appointment.meetLink])
  
  // Escuchar cambios en el store para actualizar el meetLink automáticamente
  useEffect(() => {
    const unsubscribe = appointmentsStore.subscribe(() => {
      const updatedAppointments = appointmentsStore.getAll()
      const updatedAppointment = updatedAppointments.find((a) => a.id === appointment.id)
      if (updatedAppointment?.meetLink && updatedAppointment.meetLink !== meetLink) {
        console.log("[Dashboard] MeetLink actualizado desde store:", updatedAppointment.meetLink)
        setMeetLink(updatedAppointment.meetLink)
      }
    })
    return unsubscribe
  }, [appointment.id, meetLink])

  const handleSendEmail = async (createMeet: boolean = false) => {
    setIsSendingEmail(true)
    try {
      const response = await authenticatedFetch("/api/appointments/send-confirmation-email", {
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
        // Recargar appointments para obtener el meetLink actualizado
        await appointmentsStore.init(true)
      }
      alert("✅ Correo enviado correctamente")
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
      const response = await authenticatedFetch("/api/appointments/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, createMeet: true }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || "Error al crear Google Meet"
        console.error("[Dashboard] Error del servidor:", errorMessage)
        
        // Mensaje más amigable para errores de calendario
        if (errorMessage.includes("Calendario no encontrado") || errorMessage.includes("No se pudo encontrar ningún calendario") || errorMessage.includes("no está conectado")) {
          alert(
            `❌ Error de configuración de Google Calendar\n\n` +
            `Google Calendar no está conectado o hay un problema con la conexión.\n\n` +
            `Para solucionarlo:\n` +
            `1. Ve al dashboard → Configuración del Sitio\n` +
            `2. Busca la sección de Google Calendar\n` +
            `3. Haz clic en "Conectar con Google Calendar"\n` +
            `4. O visita: /api/google-calendar/auth\n\n` +
            `Luego intenta crear el Meet nuevamente.`
          )
        } else {
          alert(`❌ ${errorMessage}`)
        }
        return
      }

        const data = await response.json()
      
      // Si la respuesta indica que falló, mostrar error
      if (!data.success) {
        const errorMessage = data.error || "Error al crear Google Meet"
        console.error("[Dashboard] Error en respuesta:", errorMessage)
        alert(`❌ ${errorMessage}`)
        return
      }
      
      // Recargar appointments para obtener el meetLink actualizado desde BD
      await appointmentsStore.init(true)
      const updatedAppointments = appointmentsStore.getAll()
      const updatedAppointment = updatedAppointments.find((a) => a.id === appointment.id)
      
      // Obtener meetLink y meetStatus de la respuesta
      const finalMeetLink = data.meetLink || updatedAppointment?.meetLink || null
      const meetStatus = data.meetStatus || (finalMeetLink ? "created" : "not_supported")
      
      if (meetStatus === "created" && finalMeetLink) {
        // Google Meet fue creado exitosamente
        setMeetLink(finalMeetLink)
        setNewMeetLink(finalMeetLink)
        setShowMeetDialog(true)
        await appointmentsStore.init(true)
      } else if (meetStatus === "not_supported") {
        // Google Meet no está disponible - mostrar mensaje honesto
        const calendarLink = updatedAppointment?.calendarEventId 
          ? `https://calendar.google.com/calendar/event?eid=${updatedAppointment.calendarEventId}`
          : "Google Calendar"
        
        alert(
          `✅ Evento creado en Google Calendar\n\n` +
          `🚫 Google Meet no pudo generarse automáticamente.\n\n` +
          `Esto es una limitación de Google cuando se usa Service Account sin OAuth.\n\n` +
          `Puedes agregar Google Meet manualmente desde Google Calendar:\n` +
          `${calendarLink}\n\n` +
          `O abrir el evento y agregar una videollamada desde allí.`
        )
        await appointmentsStore.init(true)
      } else {
        // Estado desconocido - mostrar mensaje genérico
        alert(data.message || "✅ Evento creado en Google Calendar")
        await appointmentsStore.init(true)
      }
    } catch (error) {
      console.error("Error:", error)
      alert(`❌ Error al crear Google Meet: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsCreatingMeet(false)
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
              {(meetLink || appointment.meetLink) && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-300 dark:border-green-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        ✅ Google Meet creado y listo
                      </p>
                      <a 
                        href={meetLink || appointment.meetLink || ""} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100 hover:underline break-all block font-mono bg-white dark:bg-green-900/30 p-2 rounded mt-1 border border-green-200 dark:border-green-700"
                      >
                        {meetLink || appointment.meetLink}
                      </a>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-2 italic">
                        El evento está guardado en Google Calendar
                      </p>
                    </div>
                  </div>
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
                Pedido el {formatSantiagoDateTime(appointment.createdAt)}
              </p>
            )}
          </div>

          <AppointmentMenu
            items={[
              ...(appointment.appointmentType === "online" ? [
                {
                  label: (meetLink || appointment.meetLink) ? "Ver Meet" : (isCreatingMeet ? "Creando Meet..." : "Crear Meet"),
                  icon: <Video className="w-4 h-4" />,
                  onClick: (meetLink || appointment.meetLink) 
                    ? () => {
                        const link = meetLink || appointment.meetLink
                        if (link) {
                          window.open(link, "_blank", "noopener,noreferrer")
                        }
                      }
                    : handleCreateMeet,
                  disabled: isCreatingMeet && !(meetLink || appointment.meetLink),
                },
              ] : []),
              {
                label: isSendingEmail ? "Enviando..." : "Enviar Correo",
                icon: <Mail className="w-4 h-4" />,
                onClick: () => handleSendEmail(false),
                disabled: isSendingEmail,
              },
              ...(appointment.appointmentType === "online" ? [
                {
                  label: isSendingEmail ? "Enviando..." : "Correo + Meet",
                  icon: <Mail className="w-4 h-4" />,
                  onClick: () => handleSendEmail(true),
                  disabled: isSendingEmail,
                },
              ] : []),
              {
                label: "Ya Atendido",
                icon: <CheckCircle className="w-4 h-4" />,
                onClick: async () => {
                  if (confirm(`¿Marcar la cita de ${appointment.patientName} como ya atendida?`)) {
                    try {
                      const response = await authenticatedFetch("/api/appointments/update-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: appointment.id, status: "attended" }),
                      })
                      if (response.ok) {
                        await appointmentsStore.init(true)
                        alert("✅ Cita marcada como atendida")
                      } else {
                        throw new Error("Error al actualizar")
                      }
                    } catch (error) {
                      alert("❌ Error al marcar como atendida")
                    }
                  }
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Dialog para mostrar el link de Google Meet creado */}
      <Dialog open={showMeetDialog} onOpenChange={setShowMeetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Google Meet creado exitosamente
            </DialogTitle>
            <DialogDescription>
              El evento ha sido creado en Google Calendar y el link de la reunión está listo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Link de la reunión:
              </p>
              {newMeetLink && (
                <a 
                  href={newMeetLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-green-800 dark:text-green-200 hover:underline break-all block"
                >
                  {newMeetLink}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Evento guardado en Google Calendar</span>
          </div>
            </div>
          <div className="flex justify-end gap-2">
                <Button
              variant="outline"
              onClick={() => {
                setShowMeetDialog(false)
                setNewMeetLink(null)
              }}
            >
              Cerrar
                </Button>
            {newMeetLink && (
                <Button
                onClick={() => {
                  window.open(newMeetLink, "_blank")
                }}
              >
                Abrir Meet
                </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
