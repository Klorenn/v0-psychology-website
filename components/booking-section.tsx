"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Clock, Loader2, CalendarDays, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { appointmentsStore } from "@/lib/appointments-store"
import { BankTransferDetails } from "@/components/bank-transfer-details"
import { FileUpload } from "@/components/file-upload"
import { validateEmail, validatePhone, validateName, sanitizeName, sanitizePhone, sanitizeString } from "@/lib/validation"
import { countryCodes, defaultCountryCode, type CountryCode } from "@/lib/country-codes"
import { ChevronDown } from "lucide-react"

const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]

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
  const [consultationReason, setConsultationReason] = useState("")
  const [appointmentType, setAppointmentType] = useState<"online" | "presencial">("online")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string>("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "flow" | null>(null)
  const [showPaymentMethod, setShowPaymentMethod] = useState(false)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

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

  const handlePaymentMethodSelect = async (method: "transfer" | "flow") => {
    setPaymentMethod(method)
    
    if (method === "transfer") {
      setShowPaymentMethod(false)
      setShowBankDetails(true)
    } else {
      // Crear pago con Flow
      await handleFlowPayment()
    }
  }

  const handleFlowPayment = async () => {
    if (!selectedDate || !selectedTime) return
    
    setIsCreatingPayment(true)
    setUploadError("")
    
    try {
      const appointmentId = crypto.randomUUID()
      const amount = appointmentType === "online" ? 20000 : 27000
      const description = `Sesión ${appointmentType === "online" ? "Online" : "Presencial"} - ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} a las ${selectedTime} hrs`
      
      // Formatear teléfono con código de país si es online
      let formattedPhone = patientPhone
      if (appointmentType === "online" && selectedCountry) {
        if (!patientPhone.startsWith("+") && !patientPhone.startsWith(selectedCountry.dialCode)) {
          formattedPhone = `${selectedCountry.dialCode} ${patientPhone.trim()}`
        } else if (patientPhone.startsWith(selectedCountry.dialCode)) {
          formattedPhone = patientPhone
        }
      }

      // Crear la cita primero (pendiente de pago)
      await appointmentsStore.add({
        id: appointmentId,
        patientName: sanitizeName(patientName),
        patientEmail: sanitizeString(patientEmail).toLowerCase(),
        patientPhone: sanitizePhone(formattedPhone),
        consultationReason: sanitizeString(consultationReason) || undefined,
        appointmentType,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos para pagar
        paymentMethod: "flow",
      })

      // Crear pago en Flow
      const paymentResponse = await fetch("/api/flow/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          amount,
          description,
          patientEmail: sanitizeString(patientEmail).toLowerCase(),
          patientName: sanitizeName(patientName),
        }),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al crear el pago. Por favor, intente nuevamente.")
      }

      const paymentData = await paymentResponse.json()
      
      // Redirigir al checkout de Flow
      if (paymentData.url) {
        window.location.href = paymentData.url
      } else {
        throw new Error("No se pudo obtener la URL de pago")
      }
    } catch (error) {
      console.error("Error creando pago con Flow:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al procesar el pago. Por favor, intente nuevamente."
      setUploadError(errorMessage)
      alert(errorMessage)
      setIsCreatingPayment(false)
    }
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

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateReceipt = (file: File): string | null => {
    // Validación mínima - solo verificar que sea un archivo válido
    if (!file || file.size === 0) {
      return "Por favor, seleccione un archivo válido."
    }

    // Validar tamaño máximo (muy grande puede causar problemas)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB máximo
    if (file.size > MAX_SIZE) {
      return `El archivo es demasiado grande. Tamaño máximo: ${MAX_SIZE / 1024 / 1024}MB`
    }

    // No validar tipo específico - aceptar cualquier imagen o PDF
    // El servidor validará si es necesario
    return null
  }

  const handleSubmitBooking = async () => {
    if (isSubmitting) return

    if (!selectedDate || !selectedTime) return

    // Validar datos básicos
    if (!validateForm()) {
      return
    }

    // Validar comprobante
    if (!receiptFile) {
      setValidationErrors((prev) => ({ ...prev, receipt: "El comprobante de transferencia es requerido" }))
      return
    }

    const receiptValidation = validateReceipt(receiptFile)
    if (receiptValidation) {
      setUploadError(receiptValidation)
      return
    }

    setIsSubmitting(true)
    setUploadError("")

    try {
      const appointmentId = crypto.randomUUID()

      let receiptUrl = ""
      let receiptData = ""
      let receiptFilename = ""
      let receiptMimetype = ""
      
      if (receiptFile) {
        setIsUploading(true)
        setUploadError("")
        try {
          const formData = new FormData()
          formData.append("file", receiptFile)
          formData.append("appointmentId", appointmentId)

          const uploadResponse = await fetch("/api/appointments/upload-receipt", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            let errorMessage = "Error al procesar el comprobante. Por favor, intente nuevamente."
            try {
              const errorData = await uploadResponse.json()
              errorMessage = errorData.error || errorData.details || errorMessage
              console.error("Error del servidor:", errorData)
            } catch (parseError) {
              const textError = await uploadResponse.text().catch(() => "")
              console.error("Error parseando respuesta:", textError)
              errorMessage = textError || errorMessage
            }
            // No lanzar error - solo mostrar mensaje y permitir continuar
            setUploadError(errorMessage)
            setIsUploading(false)
            return // Salir del bloque de upload pero permitir que el usuario reintente
          }

          const uploadData = await uploadResponse.json()
          if (!uploadData.success) {
            // No lanzar error - solo mostrar mensaje
            const errorMsg = uploadData.error || "Error al procesar el comprobante"
            setUploadError(errorMsg)
            setIsUploading(false)
            return // Salir pero permitir reintentar
          }
          
          receiptUrl = uploadData.url || ""
          receiptData = uploadData.receiptData || ""
          receiptFilename = uploadData.receiptFilename || ""
          receiptMimetype = uploadData.receiptMimetype || ""
          
          // Si no hay datos pero el upload fue exitoso, intentar continuar de todas formas
          if (!receiptData) {
            console.warn("No se recibieron datos del comprobante, pero el upload fue exitoso")
            // Permitir continuar sin bloquear - el servidor puede manejar esto
          }
        } catch (uploadError) {
          setIsUploading(false)
          const errorMessage = uploadError instanceof Error ? uploadError.message : "Error al procesar el comprobante. Por favor, intente nuevamente."
          setUploadError(errorMessage)
          console.error("Error en upload:", uploadError)
          // No lanzar el error - solo mostrar mensaje y permitir reintentar
          // Limpiar estado si es error de tipo de archivo
          if (errorMessage.includes("Tipo de archivo") || errorMessage.includes("no permitido")) {
            setReceiptFile(null)
            setReceiptUploaded(false)
          }
          // Salir del bloque pero no bloquear el proceso completo
          return
        } finally {
          setIsUploading(false)
        }
      }

      // Formatear teléfono con código de país si es online
      let formattedPhone = patientPhone
      if (appointmentType === "online" && selectedCountry) {
        // Si el teléfono ya incluye el código, no duplicarlo
        if (!patientPhone.startsWith("+") && !patientPhone.startsWith(selectedCountry.dialCode)) {
          formattedPhone = `${selectedCountry.dialCode} ${patientPhone.trim()}`
        } else if (patientPhone.startsWith(selectedCountry.dialCode)) {
          formattedPhone = patientPhone
        }
      }

      const sanitizedData = {
        appointmentId,
        patientName: sanitizeName(patientName),
        patientEmail: sanitizeString(patientEmail).toLowerCase(),
        patientPhone: sanitizePhone(formattedPhone),
        consultationReason: sanitizeString(consultationReason),
        appointmentType,
        date: selectedDate.toISOString(),
        time: selectedTime,
        receiptUrl,
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

      await appointmentsStore.add({
        id: appointmentId,
        patientName: sanitizedData.patientName,
        patientEmail: sanitizedData.patientEmail,
        patientPhone: sanitizedData.patientPhone,
        consultationReason: sanitizedData.consultationReason || undefined,
        appointmentType,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        receiptUrl: receiptUrl || undefined,
        receiptData: receiptData || undefined,
        receiptFilename: receiptFilename || undefined,
        receiptMimetype: receiptMimetype || undefined,
      })

    setShowForm(false)
      setShowBankDetails(false)
      setReceiptUploaded(false)
      setReceiptFile(null)
      setSelectedCountry(defaultCountryCode)
      setConsultationReason("")
    setShowConfirmation(true)
    } catch (error) {
      console.error("Error al procesar solicitud")
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al procesar su solicitud. Por favor, verifique los datos e intente nuevamente."
      
      if (!uploadError) {
        setUploadError(errorMessage)
      }
      
      if (!isUploading) {
        alert(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
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
    setConsultationReason("")
    setAppointmentType("online")
    setReceiptFile(null)
    setValidationErrors({})
    setUploadError("")
    setReceiptUploaded(false)
    setShowBankDetails(false)
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
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Agende su sesión</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Seleccione una fecha y hora disponible para su primera consulta
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

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentMethod} onOpenChange={(open) => {
        console.log("Payment Method Dialog changed:", open)
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
              Seleccione cómo desea realizar el pago de su sesión
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
              <p className="font-medium text-foreground mb-1">Resumen de la cita</p>
              <p className="text-muted-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]} a las {selectedTime}{" "}
                hrs
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePaymentMethodSelect("flow")}
                  disabled={isCreatingPayment}
                  className="h-auto p-4 rounded-xl border-2 hover:border-accent hover:bg-accent/5 transition-all text-left justify-start"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground text-base">Pago con Tarjeta</p>
                      <p className="text-xs text-muted-foreground">Tarjeta de crédito, débito o cuenta corriente (Flow)</p>
                    </div>
                    {isCreatingPayment && paymentMethod === "flow" && (
                      <Loader2 className="w-5 h-5 animate-spin text-accent shrink-0" />
                    )}
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePaymentMethodSelect("transfer")}
                  disabled={isCreatingPayment}
                  className="h-auto p-4 rounded-xl border-2 hover:border-accent hover:bg-accent/5 transition-all text-left justify-start"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground text-base">Pago con Transferencia Bancaria</p>
                      <p className="text-xs text-muted-foreground">Transferencia directa y suba su comprobante</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Details Dialog with Receipt Upload */}
      <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
        <DialogContent className="sm:max-w-lg bg-background border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Datos para transferencia</DialogTitle>
            <DialogDescription>
              Realice la transferencia bancaria y suba el comprobante para confirmar su reserva
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <BankTransferDetails amount={getPrice()} />

            <div className="space-y-3">
              <Label className="text-base font-medium">Comprobante de transferencia</Label>
              <p className="text-sm text-muted-foreground">
                Suba una foto o PDF del comprobante de transferencia. El archivo debe ser legible y mostrar claramente los datos de la transferencia.
              </p>
              
              <FileUpload
                value={receiptFile}
                onChange={(file) => {
                  if (file) {
                    // Validación mínima - solo verificar tamaño muy grande
                    const validationError = validateReceipt(file)
                    if (validationError) {
                      setUploadError(validationError)
                      setReceiptFile(null)
                      setReceiptUploaded(false)
                      return
                    }
                    // Limpiar errores previos y aceptar el archivo
                    setUploadError("")
                    setReceiptFile(file)
                    setReceiptUploaded(true)
                    // Limpiar errores de validación también
                    setValidationErrors((prev) => ({ ...prev, receipt: undefined }))
                  } else {
                    setReceiptFile(null)
                    setReceiptUploaded(false)
                    setUploadError("")
                  }
                }}
                error={validationErrors.receipt || uploadError}
                required
                isUploading={isUploading}
              />

              {receiptUploaded && !uploadError && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm">
                  <p className="text-green-900 dark:text-green-100 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Comprobante cargado correctamente. Verifique que sea legible antes de continuar.
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm">
                  <p className="text-red-900 dark:text-red-100">{uploadError}</p>
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm">
                <p className="text-amber-900 dark:text-amber-100 font-medium mb-1">⚠️ Importante</p>
                <p className="text-amber-800 dark:text-amber-200 text-xs">
                  El comprobante debe mostrar claramente: banco emisor, monto transferido, número de cuenta destino y fecha. 
                  Los comprobantes ilegibles o falsos serán rechazados.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmitBooking}
              disabled={isSubmitting || isUploading || !receiptFile}
              className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {isUploading ? "Subiendo comprobante..." : isSubmitting ? "Enviando solicitud..." : "Confirmar y enviar solicitud"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 max-h-[90vh] overflow-y-auto">
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

            <div className="space-y-2">
              <Label htmlFor="consultationReason">Motivo de consulta</Label>
              <textarea
                id="consultationReason"
                value={consultationReason}
                onChange={(e) => {
                  setConsultationReason(e.target.value)
                  if (validationErrors.consultationReason) {
                    setValidationErrors((prev) => ({ ...prev, consultationReason: "" }))
                  }
                }}
                placeholder="Cuénteme brevemente el motivo de su consulta..."
                rows={4}
                className={`w-full rounded-xl border border-border/50 bg-transparent px-3 py-2 text-sm resize-none ${
                  validationErrors.consultationReason ? "border-destructive" : ""
                }`}
              />
              {validationErrors.consultationReason && (
                <p className="text-sm text-destructive">{validationErrors.consultationReason}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Esta información me ayuda a preparar mejor su sesión
              </p>
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
              <p className="font-medium text-foreground mb-1">Resumen de la cita</p>
              <p className="text-muted-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]} a las {selectedTime}{" "}
                hrs
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
                Sus datos son confidenciales y se utilizan únicamente para gestionar su cita. No comparto
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
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="font-serif text-2xl text-center">Solicitud enviada</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Su solicitud de cita para el{" "}
              <span className="font-medium text-foreground">
                {selectedDate?.getDate()} de {selectedDate && monthNames[selectedDate.getMonth()]}
              </span>{" "}
              a las <span className="font-medium text-foreground">{selectedTime} hrs</span> ha sido enviada.
              <br />
              <br />
              <span className="text-green-600 font-medium">
                ✓ Comprobante recibido correctamente
              </span>
              <br />
              <br />
              <span className="text-sm">
                La reserva se confirma una vez recibido el comprobante de transferencia. Recibirá un correo cuando
                confirme su cita.
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
    </section>
  )
}
