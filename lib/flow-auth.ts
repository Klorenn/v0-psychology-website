import { createHmac } from "crypto"

/**
 * Firma parámetros para la API de Flow según su documentación
 * https://developers.flow.cl/docs/intro
 */
export function signFlowParams(params: Record<string, string | number>, secretKey: string): string {
  // 1. Ordenar parámetros alfabéticamente
  const keys = Object.keys(params)
  keys.sort()

  // 2. Concatenar: nombre_parametro valor nombre_parametro valor
  let toSign = ""
  for (const key of keys) {
    toSign += key + params[key]
  }

  // 3. Firmar con HMAC SHA256
  const signature = createHmac("sha256", secretKey).update(toSign).digest("hex")
  return signature
}

/**
 * Obtiene las credenciales de Flow desde variables de entorno
 */
export function getFlowCredentials() {
  const apiKey = process.env.FLOW_API_KEY
  const secretKey = process.env.FLOW_SECRET_KEY
  const isProduction = process.env.FLOW_ENVIRONMENT === "production"
  
  const baseUrl = isProduction 
    ? "https://www.flow.cl/api" 
    : "https://sandbox.flow.cl/api"

  return {
    apiKey,
    secretKey,
    baseUrl,
    isProduction,
  }
}

