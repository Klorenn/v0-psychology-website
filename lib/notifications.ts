/**
 * Sistema de notificaciones del navegador
 * Funciona en PC y móvil cuando el usuario da permisos
 */

export type NotificationPermission = "default" | "granted" | "denied"

/**
 * Solicitar permisos de notificación
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador no soporta notificaciones")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission === "denied") {
    console.warn("Permisos de notificación denegados")
    return false
  }

  // Solicitar permiso
  const permission = await Notification.requestPermission()
  return permission === "granted"
}

/**
 * Verificar si las notificaciones están disponibles y permitidas
 */
export function canSendNotifications(): boolean {
  if (!("Notification" in window)) {
    return false
  }
  return Notification.permission === "granted"
}

/**
 * Enviar notificación
 */
export function sendNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!canSendNotifications()) {
    console.warn("No se pueden enviar notificaciones: permisos no otorgados")
    return null
  }

  try {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      requireInteraction: false,
      ...options,
    })

    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  } catch (error) {
    console.error("Error enviando notificación:", error)
    return null
  }
}

/**
 * Notificación de cita aceptada
 */
export function notifyAppointmentApproved(patientName: string, date: string, time: string) {
  return sendNotification("✅ Cita Confirmada", {
    body: `La cita de ${patientName} ha sido confirmada para el ${date} a las ${time}`,
    tag: "appointment-approved",
    icon: "/favicon.ico",
  })
}

/**
 * Notificación de cita rechazada
 */
export function notifyAppointmentRejected(patientName: string) {
  return sendNotification("❌ Cita Rechazada", {
    body: `La cita de ${patientName} ha sido rechazada`,
    tag: "appointment-rejected",
    icon: "/favicon.ico",
  })
}

/**
 * Notificación de nueva cita pendiente
 */
export function notifyNewAppointment(patientName: string, date: string, time: string) {
  return sendNotification("🆕 Nueva Solicitud de Cita", {
    body: `${patientName} ha solicitado una cita para el ${date} a las ${time}`,
    tag: "new-appointment",
    icon: "/favicon.ico",
    requireInteraction: true, // Mantener visible hasta que el usuario la cierre
  })
}

