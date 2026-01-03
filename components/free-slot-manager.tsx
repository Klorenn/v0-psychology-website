"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Loader2, Unlock } from "lucide-react"
import { appointmentsStore, type Appointment } from "@/lib/appointments-store"
import { authenticatedFetch } from "@/lib/api-client"

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export function FreeSlotManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [freeingSlotId, setFreeingSlotId] = useState<string | null>(null)

  useEffect(() => {
    // Cargar citas al montar
    const loadAppointments = () => {
      const allAppointments = appointmentsStore.getAll()
      // Solo mostrar citas confirmadas y pendientes (las que bloquean horarios)
      const blockingAppointments = allAppointments.filter(
        (a) => a.status === "confirmed" || a.status === "pending"
      )
      setAppointments(blockingAppointments)
    }

    loadAppointments()

    // Suscribirse a cambios
    const unsubscribe = appointmentsStore.subscribe(() => {
      loadAppointments()
    })

    return unsubscribe
  }, [])

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getDate()} de ${monthNames[d.getMonth()]}`
  }

  const formatTime = (time: string) => {
    return time
  }

  const handleFreeSlot = async (appointment: Appointment) => {
    if (!confirm(`¿Estás seguro de que deseas liberar el horario del ${formatDate(appointment.date)} a las ${formatTime(appointment.time)}?`)) {
      return
    }

    setFreeingSlotId(appointment.id)
    try {
      // Cambiar el estado a "cancelled" para liberar el horario
      const response = await authenticatedFetch("/api/appointments/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointment.id, status: "cancelled" }),
      })

      if (!response.ok) {
        throw new Error("Error al liberar el horario")
      }

      // Recargar citas
      await appointmentsStore.init(true)
      
      // Actualizar lista local
      const allAppointments = appointmentsStore.getAll()
      const blockingAppointments = allAppointments.filter(
        (a) => a.status === "confirmed" || a.status === "pending"
      )
      setAppointments(blockingAppointments)

      alert("✅ Horario liberado correctamente")
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error al liberar el horario")
    } finally {
      setFreeingSlotId(null)
    }
  }

  // Agrupar citas por fecha
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const dateKey = new Date(appointment.date).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(appointment)
    return acc
  }, {} as Record<string, Appointment[]>)

  // Ordenar fechas
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Horarios Ocupados</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Gestiona los horarios bloqueados por citas confirmadas o pendientes. Al liberar un horario, la cita será cancelada y el horario volverá a estar disponible.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No hay horarios ocupados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const dateAppointments = appointmentsByDate[dateKey]
            const date = new Date(dateKey)
            
            return (
              <div key={dateKey} className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">
                    {formatDate(date)}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {dateAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {formatTime(appointment.time)}
                            </span>
                            <Badge
                              variant={appointment.status === "confirmed" ? "default" : "outline"}
                              className={
                                appointment.status === "confirmed"
                                  ? "bg-green-600 text-white"
                                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800"
                              }
                            >
                              {appointment.status === "confirmed" ? "Confirmada" : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.patientName}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFreeSlot(appointment)}
                        disabled={freeingSlotId === appointment.id}
                        className="ml-4"
                      >
                        {freeingSlotId === appointment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 mr-2" />
                            Liberar
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

