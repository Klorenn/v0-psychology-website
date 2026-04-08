"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, Loader2, CalendarDays, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { appointmentsStore } from "@/lib/appointments-store"
import { BankTransferDetails } from "@/components/bank-transfer-details"
import { TermsAndConditions } from "@/components/terms-and-conditions"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { validateEmail, validatePhone, validateName, sanitizeName, sanitizePhone, sanitizeString } from "@/lib/validation"
import { countryCodes, defaultCountryCode, type CountryCode } from "@/lib/country-codes"
import { ChevronDown } from "lucide-react"

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
  const [patientPhone, setPatientPhone] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountryCode)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [emergencyContactCountry, setEmergencyContactCountry] = useState<CountryCode>(defaultCountryCode)
  const [showEmergencyContactCountryDropdown, setShowEmergencyContactCountryDropdown] = useState(false)
  const [consultationReason, setConsultationReason] = useState("")
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState(false)
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  const [appointmentType, setAppointmentType] = useState<"online" | "presencial">("online")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | null>(null)
  const [showPaymentMethod, setShowPaymentMethod] = useState(false)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [hasMadeTransfer, setHasMadeTransfer] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptError, setReceiptError] = useState("")

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

  const handleContinueAfterForm = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    // Validar datos básicos antes de mostrar opciones de pago
    if (!validateForm()) {
      return
    }
    
    setValidationErrors({})
    setShowForm(false)
    // Pequeño delay para asegurar que el diálogo anterior se cierre
    setTimeout(() => {
      setShowPaymentMethod(true)
    }, 100)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!patientName.trim()) {
      errors.name = "El nombre es requerido"
    } else if (!validateName(patientName)) {
      errors.name = "El nombre debe contener solo letras y espacios"
    }

    if (!patientEmail.trim()) {
      errors.email = "El correo electrónico es requerido"
    } else if (!validateEmail(patientEmail)) {
      errors.email = "Ingrese un correo electrónico válido"
    }

    if (!patientPhone.trim()) {
      errors.phone = "El teléfono es requerido"
    } else {
      // Validar teléfono según el tipo de atención
      const phoneToValidate = appointmentType === "online" && selectedCountry
        ? `${selectedCountry.dialCode} ${patientPhone.trim()}`
        : patientPhone
      
      if (!validatePhone(phoneToValidate, appointmentType === "online")) {
        if (appointmentType === "online") {
          errors.phone = "Ingrese un número de teléfono válido"
        } else {
          errors.phone = "Ingrese un número de teléfono válido (ej: +56 9 1234 5678)"
        }
      }
    }

    // Validar contacto de emergencia solo si el checkbox está marcado
    if (includeEmergencyContact) {
      if (!emergencyContactRelation.trim()) {
        errors.emergencyContactRelation = "Debe seleccionar la relación del contacto de emergencia"
      }

      if (!emergencyContactName.trim()) {
        errors.emergencyContactName = "El nombre del contacto de emergencia es requerido"
      } else if (!validateName(emergencyContactName)) {
        errors.emergencyContactName = "El nombre debe contener solo letras y espacios"
      }

      if (!emergencyContactPhone.trim()) {
        errors.emergencyContactPhone = "El teléfono del contacto de emergencia es requerido"
      } else {
        const emergencyPhoneToValidate = emergencyContactCountry
          ? `${emergencyContactCountry.dialCode} ${emergencyContactPhone.trim()}`
          : emergencyContactPhone
        if (!validatePhone(emergencyPhoneToValidate, false)) {
          errors.emergencyContactPhone = "Ingrese un número de teléfono válido"
        }
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }


  const handleSubmitBooking = async () => {
    if (isSubmitting) return

    if (!selectedDate || !selectedTime) return

    // Validar datos básicos
    if (!validateForm()) {
      return
    }

    // Validar checkboxes para transferencia bancaria
    if (paymentMethod === "transfer") {
      if (!hasMadeTransfer) {
        setValidationErrors((prev) => ({ ...prev, transfer: "Debe confirmar que ha realizado la transferencia bancaria" }))
        return
      }
      if (!acceptedTerms) {
        setValidationErrors((prev) => ({ ...prev, terms: "Debe aceptar los términos y condiciones" }))
        return
      }
    }

    setIsSubmitting(true)

    try {
      const appointmentId = crypto.randomUUID()

      // Formatear teléfono con código de país si es online
      let formattedPhone = patientPhone
      if (appointmentType === "online" && selectedCountry) {
        if (!patientPhone.startsWith("+") && !patientPhone.startsWith(selectedCountry.dialCode)) {
          formattedPhone = `${selectedCountry.dialCode} ${patientPhone.trim()}`
        } else if (patientPhone.startsWith(selectedCountry.dialCode)) {
          formattedPhone = patientPhone
        }
      }

      // Formatear teléfono de contacto de emergencia con código de país
      let formattedEmergencyPhone = emergencyContactPhone
      if (emergencyContactCountry) {
        if (!emergencyContactPhone.startsWith("+") && !emergencyContactPhone.startsWith(emergencyContactCountry.dialCode)) {
          formattedEmergencyPhone = `${emergencyContactCountry.dialCode} ${emergencyContactPhone.trim()}`
        } else if (emergencyContactPhone.startsWith(emergencyContactCountry.dialCode)) {
          formattedEmergencyPhone = emergencyContactPhone
        }
      }

      // Leer boleta como base64 si fue adjuntada
      let receiptData: string | undefined
      let receiptFilename: string | undefined
      let receiptMimetype: string | undefined
      if (receiptFile) {
        const buffer = await receiptFile.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        receiptData = btoa(binary)
        receiptFilename = receiptFile.name
        receiptMimetype = receiptFile.type
      }

      const sanitizedData = {
        appointmentId,
        patientName: sanitizeName(patientName),
        patientEmail: sanitizeString(patientEmail).toLowerCase(),
        patientPhone: sanitizePhone(formattedPhone),
        consultationReason: sanitizeString(consultationReason),
        emergencyContactRelation: includeEmergencyContact ? sanitizeString(emergencyContactRelation) : undefined,
        emergencyContactName: includeEmergencyContact ? sanitizeName(emergencyContactName) : undefined,
        emergencyContactPhone: includeEmergencyContact ? sanitizePhone(formattedEmergencyPhone) : undefined,
        appointmentType,
        date: selectedDate.toISOString(),
        time: selectedTime,
        receiptData,
        receiptFilename,
        receiptMimetype,
      }

      const response = await fetch("/api/appointments/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al enviar la solicitud. Por favor, intente nuevamente.")
      }

      // La cita ya se guardó en el servidor, solo recargar el store local para sincronizar
      // Esto asegura que si el usuario está en el dashboard, vea la nueva cita inmediatamente
      try {
        await appointmentsStore.init(true)
      } catch (storeError) {
        console.warn("No se pudo recargar el store local, pero la cita está guardada en el servidor:", storeError)
      }

    setShowForm(false)
      setShowBankDetails(false)
      setSelectedCountry(defaultCountryCode)
      setEmergencyContactCountry(defaultCountryCode)
      setIncludeEmergencyContact(false)
      setConsultationReason("")
      setEmergencyContactRelation("")
      setEmergencyContactName("")
      setEmergencyContactPhone("")
      setHasMadeTransfer(false)
      setAcceptedTerms(false)
      setReceiptFile(null)
      setReceiptError("")
    setShowConfirmation(true)
    } catch (error) {
      console.error("Error al procesar solicitud", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al procesar su solicitud. Por favor, verifique los datos e intente nuevamente."
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setPatientName("")
    setPatientEmail("")
    setPatientPhone("")
    setSelectedCountry(defaultCountryCode)
    setEmergencyContactCountry(defaultCountryCode)
    setIncludeEmergencyContact(false)
    setConsultationReason("")
    setEmergencyContactRelation("")
    setEmergencyContactName("")
    setEmergencyContactPhone("")
    setAppointmentType("online")
    setValidationErrors({})
    setShowBankDetails(false)
    setHasMadeTransfer(false)
    setAcceptedTerms(false)
    setReceiptFile(null)
    setReceiptError("")
  }

  const getPrice = () => {
    return appointmentType === "online" ? "20.000" : "27.000"
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
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Agendar sesión</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Seleccione una fecha y hora disponible para coordinar su atención.
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
                      Seleccione una fecha para ver los horarios disponibles
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
                            
                            // Verificar si la hora ya pasó (solo si es hoy)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const selectedDateOnly = new Date(selectedDate)
                            selectedDateOnly.setHours(0, 0, 0, 0)
                            const isToday = selectedDateOnly.getTime() === today.getTime()
                            
                            let isPast = false
                            if (isToday) {
                              const [hours, minutes] = time.split(":").map(Number)
                              const timeSlot = new Date(selectedDate)
                              timeSlot.setHours(hours, minutes, 0, 0)
                              const now = new Date()
                              // Comparar en zona horaria local (el servidor ya filtró según Santiago)
                              isPast = timeSlot < now
                            }

                            return (
                              <button
                                key={time}
                                onClick={() => isAvailable && !isPast && handleTimeSelect(time)}
                                disabled={!isAvailable || isPast}
                                className={`
                                  py-2.5 px-3 rounded-xl text-sm font-medium transition-all
                                  ${
                                    !isAvailable || isPast
                                      ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through"
                                      : "bg-muted/50 hover:bg-accent/10 cursor-pointer text-foreground"
                                  }
                                  ${isSelected ? "bg-accent text-accent-foreground hover:bg-accent/90 ring-2 ring-accent/30" : ""}
                                `}
                                title={isPast ? "Esta hora ya pasó" : !isAvailable ? "Hora no disponible" : ""}
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

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentMethod} onOpenChange={(open) => {
          setShowPaymentMethod(open)
        if (!open && !isCreatingPayment) {
          // Si se cierra el diálogo sin seleccionar, volver al formulario
          setShowForm(true)
        }
      }}>
        <DialogContent className="sm:max-w-md bg-background border-border/50">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Método de pago</DialogTitle>
            <DialogDescription>
              Seleccione cómo desea realizar el pago de su consulta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
              <p className="font-medium text-foreground mb-1">Resumen de la consulta</p>
              <p className="text-muted-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]} · {selectedTime}
              </p>
              <p className="text-muted-foreground">
                Modalidad: <span className="font-medium text-foreground capitalize">{appointmentType}</span>
              </p>
              <p className="text-muted-foreground">
                Valor: <span className="font-medium text-foreground">${getPrice()} CLP</span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Seleccione su método de pago:</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="h-auto p-4 rounded-xl border-2 border-border/30 bg-muted/30 opacity-75 cursor-not-allowed">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center shrink-0">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-foreground text-base break-words">Pago con Tarjeta</p>
                      <p className="text-xs text-muted-foreground break-words">Próximamente</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">Próximamente</Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentMethod("transfer")}
                  disabled={isCreatingPayment}
                  className={`h-auto p-4 rounded-xl border-2 transition-all text-left justify-start ${
                    paymentMethod === "transfer"
                      ? "border-accent bg-accent/10 hover:bg-accent/15"
                      : "hover:border-accent hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 flex-shrink-0">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <p className="font-semibold text-foreground text-base truncate">Pago con Transferencia Bancaria</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">Transferencia directa y envíe el comprobante</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {paymentMethod && (
              <Button
                onClick={async () => {
                  if (paymentMethod === "transfer") {
                    setShowPaymentMethod(false)
                    setShowBankDetails(true)
                  }
                }}
                disabled={isCreatingPayment}
                className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 mt-4"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Continuar con la reserva"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Details Dialog with Receipt Upload */}
      <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
        <DialogContent className="sm:max-w-lg bg-background border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Datos para transferencia</DialogTitle>
            <DialogDescription>
              Realice la transferencia bancaria y envíe el comprobante por correo para confirmar su consulta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <BankTransferDetails amount={getPrice()} />

            <div className="border border-border/50 rounded-xl p-4 space-y-3">
              <p className="font-medium text-foreground flex items-center gap-2">
                <span>📎</span> Adjuntar comprobante de transferencia
              </p>
              <p className="text-sm text-muted-foreground">
                Suba una foto o PDF del comprobante. Debe mostrar banco, monto, cuenta destino y fecha.
              </p>
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${
                  receiptFile
                    ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                    : "border-border/50 hover:border-accent/50"
                }`}
              >
                <input
                  id="receipt-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 5 * 1024 * 1024) {
                      setReceiptError("El archivo no debe superar los 5 MB")
                      return
                    }
                    setReceiptError("")
                    setReceiptFile(file)
                  }}
                />
                {receiptFile ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{receiptFile.type.startsWith("image/") ? "🖼️" : "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">{receiptFile.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{(receiptFile.size / 1024).toFixed(0)} KB · Haz clic para cambiar</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setReceiptFile(null); setReceiptError("") }}
                      className="text-green-600 hover:text-red-500 dark:text-green-400 p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">Arrastra aquí o <span className="text-accent underline">selecciona archivo</span></p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF · Máx. 5 MB</p>
                  </div>
                )}
              </div>
              {receiptError && <p className="text-sm text-destructive">{receiptError}</p>}

              {/* Alternativa: enviar por WhatsApp */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 border-t border-border/40" />
                <span className="text-xs text-muted-foreground">o</span>
                <div className="flex-1 border-t border-border/40" />
              </div>
              <a
                href={`https://wa.me/56962164811?text=${encodeURIComponent("Hola, adjunto el comprobante de transferencia para mi consulta.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors py-2.5 text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar comprobante por WhatsApp
              </a>
              <p className="text-xs text-muted-foreground text-center">Suba el archivo aquí <strong>o</strong> envíelo por WhatsApp — ambas opciones son válidas</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm">
              <p className="text-amber-900 dark:text-amber-100 font-medium mb-1">⚠️ Importante</p>
              <p className="text-amber-800 dark:text-amber-200 text-xs">
                Tiene un plazo de <strong>24 horas</strong> para enviar el comprobante (adjuntándolo aquí o por WhatsApp).
                Su consulta quedará pendiente hasta que validemos el pago.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="transfer-confirmation"
                  checked={hasMadeTransfer}
                  onCheckedChange={(checked) => {
                    setHasMadeTransfer(checked === true)
                    setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.transfer
        return newErrors
      })
                  }}
                  className="mt-1"
                />
                <label
                  htmlFor="transfer-confirmation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  <span className="text-foreground">
                    He realizado la transferencia bancaria por el monto de ${getPrice()} CLP
                  </span>
                  {validationErrors.transfer && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.transfer}</p>
                  )}
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms-acceptance"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked === true)
                    setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.terms
        return newErrors
      })
                  }}
                  className="mt-1"
                />
                <label
                  htmlFor="terms-acceptance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  <span className="text-foreground">
                    He leído y acepto los{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-accent underline hover:text-accent/80"
                    >
                      términos y condiciones
                    </button>
                  </span>
                  {validationErrors.terms && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.terms}</p>
                  )}
                </label>
              </div>
            </div>

            {isSubmitting ? (
              <Button
                disabled
                className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              >
                Enviando solicitud...
              </Button>
            ) : (
              <div className="flex justify-center w-full mt-4">
                <InteractiveHoverButton
                  onClick={handleSubmitBooking}
                  disabled={!hasMadeTransfer || !acceptedTerms}
                  text="Confirmar consulta"
                  className="w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Sus datos</DialogTitle>
            <DialogDescription>Complete sus datos personales</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleContinueAfterForm} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value)
                  if (validationErrors.name) {
                    setValidationErrors((prev) => ({ ...prev, name: "" }))
                  }
                }}
                placeholder="Su nombre completo"
                className={`rounded-xl border-border/50 ${validationErrors.name ? "border-destructive" : ""}`}
                required
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              {appointmentType === "online" ? (
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-background hover:bg-muted/50 transition-colors min-w-[140px]"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {showCountryDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowCountryDropdown(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto w-64">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country)
                                setShowCountryDropdown(false)
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors ${
                                selectedCountry.code === country.code ? "bg-accent/10" : ""
                              }`}
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="text-sm flex-1 text-left">{country.name}</span>
                              <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => {
                      setPatientPhone(e.target.value)
                      if (validationErrors.phone) {
                        setValidationErrors((prev) => ({ ...prev, phone: "" }))
                      }
                    }}
                    placeholder="9 1234 5678"
                    className={`flex-1 rounded-xl border-border/50 ${validationErrors.phone ? "border-destructive" : ""}`}
                    required
                  />
                </div>
              ) : (
                <Input
                  id="phone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => {
                    setPatientPhone(e.target.value)
                    if (validationErrors.phone) {
                      setValidationErrors((prev) => ({ ...prev, phone: "" }))
                    }
                  }}
                  placeholder="+56 9 1234 5678"
                  className={`rounded-xl border-border/50 ${validationErrors.phone ? "border-destructive" : ""}`}
                  required
                />
              )}
              {validationErrors.phone && (
                <p className="text-sm text-destructive">{validationErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={patientEmail}
                onChange={(e) => {
                  setPatientEmail(e.target.value)
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: "" }))
                  }
                }}
                placeholder="su@correo.com"
                className={`rounded-xl border-border/50 ${validationErrors.email ? "border-destructive" : ""}`}
                required
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
              )}
            </div>

            {/* Checkbox para contacto de emergencia opcional */}
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-xl border border-border/50">
              <Checkbox
                id="includeEmergencyContact"
                checked={includeEmergencyContact}
                onCheckedChange={(checked) => {
                  setIncludeEmergencyContact(checked as boolean)
                  if (!checked) {
                    // Limpiar campos si se desmarca
                    setEmergencyContactRelation("")
                    setEmergencyContactName("")
                    setEmergencyContactPhone("")
                    setEmergencyContactCountry(defaultCountryCode)
                    // Limpiar errores
                    setValidationErrors((prev) => ({
                      ...prev,
                      emergencyContactRelation: "",
                      emergencyContactName: "",
                      emergencyContactPhone: "",
                    }))
                  }
                }}
              />
              <Label
                htmlFor="includeEmergencyContact"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Agregar contacto de emergencia (opcional)
              </Label>
            </div>

            {/* Campos de contacto de emergencia - solo se muestran si el checkbox está marcado */}
            {includeEmergencyContact && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Contacto de emergencia - Relación</Label>
                  <select
                    id="emergencyContactRelation"
                    value={emergencyContactRelation}
                    onChange={(e) => {
                      setEmergencyContactRelation(e.target.value)
                      if (validationErrors.emergencyContactRelation) {
                        setValidationErrors((prev) => ({ ...prev, emergencyContactRelation: "" }))
                      }
                    }}
                    className={`w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ${
                      validationErrors.emergencyContactRelation ? "border-destructive" : ""
                    }`}
                    required={includeEmergencyContact}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="pareja">Pareja</option>
                    <option value="otro">Otro</option>
                  </select>
                  {validationErrors.emergencyContactRelation && (
                    <p className="text-sm text-destructive">{validationErrors.emergencyContactRelation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contacto de emergencia - Nombre</Label>
                  <Input
                    id="emergencyContactName"
                    value={emergencyContactName}
                    onChange={(e) => {
                      setEmergencyContactName(e.target.value)
                      if (validationErrors.emergencyContactName) {
                        setValidationErrors((prev) => ({ ...prev, emergencyContactName: "" }))
                      }
                    }}
                    placeholder="Nombre completo del contacto"
                    className={`rounded-xl border-border/50 ${validationErrors.emergencyContactName ? "border-destructive" : ""}`}
                    required={includeEmergencyContact}
                  />
                  {validationErrors.emergencyContactName && (
                    <p className="text-sm text-destructive">{validationErrors.emergencyContactName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contacto de emergencia - Teléfono</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmergencyContactCountryDropdown(!showEmergencyContactCountryDropdown)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-background hover:bg-muted/50 transition-colors min-w-[140px]"
                      >
                        <span className="text-lg">{emergencyContactCountry.flag}</span>
                        <span className="text-sm font-medium">{emergencyContactCountry.dialCode}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {showEmergencyContactCountryDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowEmergencyContactCountryDropdown(false)}
                          />
                          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto w-64">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setEmergencyContactCountry(country)
                                  setShowEmergencyContactCountryDropdown(false)
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors ${
                                  emergencyContactCountry.code === country.code ? "bg-accent/10" : ""
                                }`}
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-sm flex-1 text-left">{country.name}</span>
                                <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => {
                        setEmergencyContactPhone(e.target.value)
                        if (validationErrors.emergencyContactPhone) {
                          setValidationErrors((prev) => ({ ...prev, emergencyContactPhone: "" }))
                        }
                      }}
                      placeholder="9 1234 5678"
                      className={`flex-1 rounded-xl border-border/50 ${validationErrors.emergencyContactPhone ? "border-destructive" : ""}`}
                      required={includeEmergencyContact}
                    />
                  </div>
                  {validationErrors.emergencyContactPhone && (
                    <p className="text-sm text-destructive">{validationErrors.emergencyContactPhone}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="consultationReason">
                Motivo de consulta
                <span className="text-xs text-muted-foreground font-normal ml-2">(Opcional)</span>
              </Label>
              <textarea
                id="consultationReason"
                value={consultationReason}
                onChange={(e) => {
                  setConsultationReason(e.target.value)
                  if (validationErrors.consultationReason) {
                    setValidationErrors((prev) => ({ ...prev, consultationReason: "" }))
                  }
                }}
                placeholder="Cuénteme brevemente por qué desea atenderse o el motivo de su consulta..."
                rows={4}
                maxLength={500}
                className={`w-full rounded-xl border border-border/50 bg-transparent px-3 py-2 text-sm resize-none ${
                  validationErrors.consultationReason ? "border-destructive" : ""
                }`}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Esta información me ayuda a preparar mejor su consulta y entender sus necesidades
                </p>
                <p className={`text-xs ${consultationReason.length > 450 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {consultationReason.length}/500
                </p>
              </div>
              {validationErrors.consultationReason && (
                <p className="text-sm text-destructive">{validationErrors.consultationReason}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>¿Cómo desea atenderse?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentType("online")
                    setShowCountryDropdown(false)
                  }}
                  className={`
                    py-3 px-4 rounded-xl text-sm font-medium transition-all border-2
                    ${
                      appointmentType === "online"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-muted/50 text-foreground border-border/50 hover:bg-muted"
                    }
                  `}
                >
                  Online
                  <span className="block text-xs mt-1 opacity-80">$20.000</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentType("presencial")
                    setShowCountryDropdown(false)
                  }}
                  className={`
                    py-3 px-4 rounded-xl text-sm font-medium transition-all border-2
                    ${
                      appointmentType === "presencial"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-muted/50 text-foreground border-border/50 hover:bg-muted"
                    }
                  `}
                >
                  Presencial
                  <span className="block text-xs mt-1 opacity-80">$27.000</span>
                </button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
              <p className="font-medium text-foreground mb-1">Resumen de la consulta</p>
              <p className="text-muted-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]} · {selectedTime}
              </p>
              <p className="text-muted-foreground">
                Modalidad: <span className="font-medium text-foreground capitalize">{appointmentType}</span>
              </p>
              <p className="text-muted-foreground">
                Valor: <span className="font-medium text-foreground">${getPrice()} CLP</span>
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-3 text-xs flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                Sus datos son confidenciales y se utilizan únicamente para gestionar su consulta. No comparto
                información con terceros.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleContinueAfterForm}
              className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continuar con el pago
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md bg-background border-border/50">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="font-serif text-2xl text-center">Solicitud enviada</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Su solicitud de consulta para el{" "}
              <span className="font-medium text-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]}
              </span>{" "}
              <span className="font-medium text-foreground">{selectedTime}</span> ha sido enviada.
              <br />
              <br />
              <span className="text-sm">
                Su solicitud está en revisión. La consulta se confirma una vez que se verifique el comprobante de transferencia enviado. Recibirá un correo cuando se confirme su consulta.
              </span>
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

      {/* Terms and Conditions Dialog */}
      <TermsAndConditions open={showTerms} onOpenChange={setShowTerms} />
    </section>
  )
}
