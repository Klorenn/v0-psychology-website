/**
 * Manejo centralizado de errores para APIs
 */

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: unknown
}

export class AppError extends Error {
  statusCode: number
  code?: string
  details?: unknown

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Manejar errores de forma segura sin exponer información sensible
 */
export function handleApiError(error: unknown, isProduction: boolean = process.env.NODE_ENV === "production"): ApiError {
  // Si es un AppError, usarlo directamente
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: isProduction ? undefined : error.details,
    }
  }

  // Si es un Error estándar
  if (error instanceof Error) {
    // En producción, no exponer stack traces
    return {
      message: isProduction ? "Error interno del servidor" : error.message,
      statusCode: 500,
      details: isProduction ? undefined : { stack: error.stack },
    }
  }

  // Error desconocido
  return {
    message: "Error interno del servidor",
    statusCode: 500,
    details: isProduction ? undefined : { error },
  }
}

/**
 * Crear respuesta de error estandarizada
 */
export function createErrorResponse(error: unknown, isProduction: boolean = process.env.NODE_ENV === "production") {
  const apiError = handleApiError(error, isProduction)
  return {
    error: apiError.message,
    ...(apiError.code && { code: apiError.code }),
    ...(apiError.details && { details: apiError.details }),
  }
}

