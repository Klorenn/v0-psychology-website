/**
 * Validación de transiciones de estado para appointments
 */

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "expired" | "attended"

// Transiciones válidas de estado
const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled", "expired"],
  confirmed: ["cancelled", "attended", "expired"],
  cancelled: [], // No se puede cambiar desde cancelled
  expired: [], // No se puede cambiar desde expired
  attended: [], // No se puede cambiar desde attended
}

/**
 * Validar si una transición de estado es válida
 */
export function isValidStatusTransition(
  currentStatus: AppointmentStatus,
  newStatus: AppointmentStatus
): boolean {
  // No permitir cambiar al mismo estado
  if (currentStatus === newStatus) {
    return false
  }

  // Verificar si la transición está permitida
  const allowedTransitions = VALID_TRANSITIONS[currentStatus]
  return allowedTransitions.includes(newStatus)
}

/**
 * Obtener mensaje de error para transición inválida
 */
export function getInvalidTransitionMessage(
  currentStatus: AppointmentStatus,
  newStatus: AppointmentStatus
): string {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus]
  
  if (allowedTransitions.length === 0) {
    return `No se puede cambiar el estado de una cita ${currentStatus}`
  }
  
  return `No se puede cambiar el estado de "${currentStatus}" a "${newStatus}". Transiciones válidas: ${allowedTransitions.join(", ")}`
}

