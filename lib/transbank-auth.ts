/**
 * Configuración y autenticación para Transbank Webpay Plus
 * https://www.transbankdevelopers.cl/documentacion/webpay-plus
 */

export interface TransbankCredentials {
  commerceCode: string
  apiKey: string
  environment: "integration" | "production"
}

/**
 * Obtiene las credenciales de Transbank desde variables de entorno
 */
export function getTransbankCredentials(): TransbankCredentials {
  const commerceCode = process.env.TRANSBANK_COMMERCE_CODE
  const apiKey = process.env.TRANSBANK_API_KEY
  const environment = process.env.TRANSBANK_ENVIRONMENT === "production" ? "production" : "integration"

  return {
    commerceCode: commerceCode || "",
    apiKey: apiKey || "",
    environment,
  }
}

/**
 * Obtiene la URL base de la API de Transbank según el ambiente
 */
export function getTransbankBaseUrl(environment: "integration" | "production"): string {
  return environment === "production"
    ? "https://webpay3g.transbank.cl"
    : "https://webpay3gint.transbank.cl"
}

/**
 * Crea los headers para las peticiones a Transbank
 * Transbank usa Tbk-Api-Key-Id (commerce code) y Tbk-Api-Key-Secret (API key)
 */
export function getTransbankHeaders(commerceCode: string, apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Tbk-Api-Key-Id": commerceCode,
    "Tbk-Api-Key-Secret": apiKey,
  }
}

