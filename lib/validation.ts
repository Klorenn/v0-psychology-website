export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string, allowInternational: boolean = false): boolean {
  if (allowInternational) {
    // Validación internacional: debe empezar con + seguido de 1-15 dígitos
    const cleaned = phone.trim()
    // Acepta formato: +[código] [número] o +[código][número]
    return /^\+\d{1,4}\s?\d{4,15}$/.test(cleaned) || /^\+\d{5,15}$/.test(cleaned.replace(/\s/g, ""))
  }
  // Validación chilena (presencial)
  const phoneRegex = /^(\+56\s?)?[9]\s?\d{4}\s?\d{4}$/
  const cleaned = phone.replace(/\s/g, "")
  return /^(\+56)?9\d{8}$/.test(cleaned)
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}

export function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,50}$/
  return nameRegex.test(name.trim())
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
    .replace(/\s+/g, " ")
    .substring(0, 50)
}

