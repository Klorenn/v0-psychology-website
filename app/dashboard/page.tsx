"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { appointmentsStore, type Appointment } from "@/lib/appointments-store"
import { authStore } from "@/lib/auth-store"
import { Check, X, Clock, LogOut, Calendar } from "lucide-react"

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

export default function DashboardPage() {
  const router = useRouter()
  const [timeUpdate, setTimeUpdate] = useState(0)

  const isAuth = useSyncExternalStore(authStore.subscribe, authStore.isAuthenticated, () => false)

  const appointments = useSyncExternalStore(appointmentsStore.subscribe, appointmentsStore.getAll, () => [])

  // Check auth on mount
  useEffect(() => {
    if (!isAuth) {
      router.push("/dashboard/login")
    }
  }, [isAuth, router])

  // Update timer every second and check for expired appointments
  useEffect(() => {
    const interval = setInterval(() => {
      appointmentsStore.checkExpired()
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

  if (!isAuth) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Gestión de citas</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
                  onApprove={() => appointmentsStore.approve(appointment.id)}
                  onReject={() => appointmentsStore.reject(appointment.id)}
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
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.time} hrs</p>
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
  onApprove: () => void
  onReject: () => void
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
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-foreground">
              {appointment.date.getDate()} de {monthNames[appointment.date.getMonth()]}
            </p>
            <p className="text-sm text-muted-foreground">{appointment.time} hrs</p>
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
