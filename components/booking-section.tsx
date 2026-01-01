"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, Loader2, CalendarDays } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { appointmentsStore } from "@/lib/appointments-store"

const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]

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

const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]

export function BookingSection() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const fetchAvailability = async () => {
      setIsLoadingSlots(true)
      try {
        const dateStr = selectedDate.toISOString().split("T")[0]
        const res = await fetch(`/api/calendar/availability?date=${dateStr}`)
        if (res.ok) {
          const data = await res.json()
          setAvailableSlots(data.availableSlots)
        } else {
          setAvailableSlots(DEFAULT_SLOTS)
        }
      } catch {
        setAvailableSlots(DEFAULT_SLOTS)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchAvailability()
  }, [selectedDate])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(year, month, day)
    if (date >= today && date.getDay() !== 0 && date.getDay() !== 6) {
      setSelectedDate(date)
      setSelectedTime(null)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleContinueToForm = () => {
    setShowForm(true)
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !patientName || !patientEmail) return

    appointmentsStore.add({
      patientName,
      patientEmail,
      date: selectedDate,
      time: selectedTime,
    })

    setShowForm(false)
    setShowConfirmation(true)
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setPatientName("")
    setPatientEmail("")
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day)
    return date < today || date.getDay() === 0 || date.getDay() === 6
  }

  const isToday = (day: number) => {
    const date = new Date(year, month, day)
    const now = new Date()
    return date.toDateString() === now.toDateString()
  }

  return (
    <section id="agenda" className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 mb-4">
            <CalendarDays className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Agenda tu sesión</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecciona una fecha y hora disponible para tu primera consulta
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr]">
              {/* Compact Calendar */}
              <div className="p-5 border-b md:border-b-0 md:border-r border-border/50">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <h3 className="font-medium text-sm text-foreground">
                    {monthNames[month]} {year}
                  </h3>
                  <button
                    onClick={goToNextMonth}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {dayNames.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1
                    const disabled = isDateDisabled(day)
                    const selected =
                      selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === month &&
                      selectedDate?.getFullYear() === year
                    const todayClass = isToday(day)

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        disabled={disabled}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all
                          ${disabled ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-accent/10 cursor-pointer text-foreground"}
                          ${selected ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                          ${todayClass && !selected ? "ring-1 ring-accent/40" : ""}
                        `}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots Panel */}
              <div className="p-5 flex flex-col min-h-[280px]">
                {!selectedDate ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Selecciona una fecha para ver los horarios disponibles
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 pb-4 border-b border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Fecha seleccionada</p>
                      <p className="font-medium text-foreground">
                        {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
                      </p>
                    </div>

                    {isLoadingSlots ? (
                      <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-3">Horarios disponibles</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {DEFAULT_SLOTS.map((time) => {
                            const isAvailable = availableSlots.includes(time)
                            const isSelected = selectedTime === time

                            return (
                              <button
                                key={time}
                                onClick={() => isAvailable && handleTimeSelect(time)}
                                disabled={!isAvailable}
                                className={`
                                  py-2.5 px-3 rounded-xl text-sm font-medium transition-all
                                  ${
                                    !isAvailable
                                      ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through"
                                      : "bg-muted/50 hover:bg-accent/10 cursor-pointer text-foreground"
                                  }
                                  ${isSelected ? "bg-accent text-accent-foreground hover:bg-accent/90 ring-2 ring-accent/30" : ""}
                                `}
                              >
                                {time}
                              </button>
                            )
                          })}
                        </div>

                        {selectedTime && (
                          <div className="mt-auto pt-4 border-t border-border/50">
                            <Button
                              onClick={handleContinueToForm}
                              className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                              Continuar con la reserva
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                        <p>No hay horarios disponibles para este día</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info text */}
          <p className="text-center text-muted-foreground text-xs mt-4">
            Los horarios se sincronizan automáticamente con Google Calendar
          </p>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md bg-background border-border/50">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Tus datos</DialogTitle>
            <DialogDescription>Completa tus datos para solicitar la cita</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitBooking} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Tu nombre"
                className="rounded-xl border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="rounded-xl border-border/50"
                required
              />
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-sm">
              <p className="font-medium text-foreground mb-1">Resumen de la cita</p>
              <p className="text-muted-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]} a las {selectedTime}{" "}
                hrs
              </p>
            </div>

            <Button type="submit" className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
              Solicitar cita
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md bg-background border-border/50">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="font-serif text-2xl text-center">Solicitud enviada</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Tu solicitud de cita para el{" "}
              <span className="font-medium text-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]}
              </span>{" "}
              a las <span className="font-medium text-foreground">{selectedTime} hrs</span> ha sido enviada.
              <br />
              <br />
              <span className="text-amber-600 font-medium">La psicóloga tiene 5 minutos para confirmar tu cita.</span>
              <br />
              Recibirás un correo cuando sea confirmada.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleCloseConfirmation}
              className="px-8 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
