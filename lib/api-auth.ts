import { NextRequest, NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"

// Secret key para JWT - debe estar en variables de entorno del servidor
// Si no está configurado, se genera uno basado en ADMIN_EMAIL para desarrollo
const getJWTSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET
  if (secret) {
    return new TextEncoder().encode(secret)
  }
  // Fallback para desarrollo: usar ADMIN_EMAIL como base (no recomendado para producción)
  const fallback = process.env.ADMIN_EMAIL 
    ? `dev-secret-${process.env.ADMIN_EMAIL}-${process.env.ADMIN_PASSWORD || 'default'}`
    : "fallback-secret-key-change-in-production"
  console.warn("⚠️ JWT_SECRET no configurado, usando fallback. Configura JWT_SECRET en producción.")
  return new TextEncoder().encode(fallback)
}

const JWT_SECRET = getJWTSecret()

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 horas

// Credenciales de admin - solo en servidor
// Normalizar y trim para evitar problemas con espacios
// FALLBACK: Si no hay variables de entorno, usar valores hardcodeados
const DEFAULT_ADMIN_EMAIL = "ps.msanluis@gmail.com"
const DEFAULT_ADMIN_PASSWORD = "misakki12_"

export const ADMIN_CREDENTIALS = {
  email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim(),
  password: (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).trim(),
}

// Log de configuración (solo en desarrollo o si hay problemas)
if (process.env.NODE_ENV === "development" || !ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
  console.log("[Auth] Configuración de credenciales:")
  const usingEnvEmail = !!process.env.ADMIN_EMAIL
  const usingEnvPassword = !!process.env.ADMIN_PASSWORD
  console.log("   ADMIN_EMAIL:", ADMIN_CREDENTIALS.email ? `${ADMIN_CREDENTIALS.email.substring(0, 5)}...` : "❌ NO CONFIGURADO")
  console.log("   ADMIN_EMAIL source:", usingEnvEmail ? "✅ Variables de entorno" : "⚠️ Valores hardcodeados (fallback)")
  console.log("   ADMIN_PASSWORD:", ADMIN_CREDENTIALS.password ? `✅ Configurado (${ADMIN_CREDENTIALS.password.length} caracteres)` : "❌ NO CONFIGURADO")
  console.log("   ADMIN_PASSWORD source:", usingEnvPassword ? "✅ Variables de entorno" : "⚠️ Valores hardcodeados (fallback)")
  console.log("   JWT_SECRET:", process.env.JWT_SECRET ? `✅ Configurado (${process.env.JWT_SECRET.length} caracteres)` : "⚠️ Usando fallback")
}

export interface AuthSession {
  email: string
  timestamp: number
}

/**
 * Verificar credenciales de admin
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  // Log detallado de lo que recibimos
  console.log("[Auth] Verificando credenciales...")
  console.log("   Input email length:", email?.length || 0)
  console.log("   Input password length:", password?.length || 0)
  console.log("   Config email length:", ADMIN_CREDENTIALS.email?.length || 0)
  console.log("   Config password length:", ADMIN_CREDENTIALS.password?.length || 0)
  
  if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
    console.error("⚠️ Credenciales de admin no configuradas en variables de entorno")
    console.error("   ADMIN_EMAIL configurado:", !!ADMIN_CREDENTIALS.email)
    console.error("   ADMIN_EMAIL valor raw:", process.env.ADMIN_EMAIL ? "✅ Existe" : "❌ No existe")
    console.error("   ADMIN_PASSWORD configurado:", !!ADMIN_CREDENTIALS.password)
    console.error("   ADMIN_PASSWORD valor raw:", process.env.ADMIN_PASSWORD ? "✅ Existe" : "❌ No existe")
    return false
  }
  
  // Normalizar emails (trim y lowercase para comparación)
  const normalizedInputEmail = (email || "").trim().toLowerCase()
  const normalizedConfigEmail = (ADMIN_CREDENTIALS.email || "").trim().toLowerCase()
  
  // Comparación de password - múltiples estrategias
  const passwordInput = password || ""
  const passwordConfig = ADMIN_CREDENTIALS.password || ""
  
  // Estrategia 1: Comparación exacta
  let passwordMatch = passwordInput === passwordConfig
  
  // Estrategia 2: Si no coincide, intentar con trim
  if (!passwordMatch) {
    const trimmedInput = passwordInput.trim()
    const trimmedConfig = passwordConfig.trim()
    passwordMatch = trimmedInput === trimmedConfig
    if (passwordMatch) {
      console.log("[Auth] ⚠️ Password coincide después de trim - posible espacio en variable de entorno")
    }
  }
  
  // Estrategia 3: Comparación byte a byte (para detectar caracteres invisibles)
  if (!passwordMatch && passwordInput.length === passwordConfig.length) {
    // Comparar cada carácter
    let allMatch = true
    for (let i = 0; i < passwordInput.length; i++) {
      if (passwordInput.charCodeAt(i) !== passwordConfig.charCodeAt(i)) {
        allMatch = false
        console.log(`[Auth] Carácter diferente en posición ${i}: input=${passwordInput.charCodeAt(i)}, config=${passwordConfig.charCodeAt(i)}`)
        break
      }
    }
    if (allMatch) {
      passwordMatch = true
      console.log("[Auth] ⚠️ Password coincide byte a byte pero no con === - posible problema de encoding")
    }
  }
  
  // Log detallado de comparación (sin exponer valores completos)
  const emailMatch = normalizedInputEmail === normalizedConfigEmail
  
  console.log(`[Auth] Comparación de email: ${emailMatch ? "✅" : "❌"}`)
  if (!emailMatch) {
    console.log(`   Input: "${normalizedInputEmail.substring(0, 10)}..." (length: ${normalizedInputEmail.length})`)
    console.log(`   Config: "${normalizedConfigEmail.substring(0, 10)}..." (length: ${normalizedConfigEmail.length})`)
    // Mostrar códigos de caracteres para debugging
    console.log(`   Input char codes (first 5):`, normalizedInputEmail.substring(0, 5).split('').map(c => c.charCodeAt(0)))
    console.log(`   Config char codes (first 5):`, normalizedConfigEmail.substring(0, 5).split('').map(c => c.charCodeAt(0)))
  }
  
  console.log(`[Auth] Comparación de password: ${passwordMatch ? "✅" : "❌"}`)
  if (!passwordMatch) {
    console.log(`   Input length: ${passwordInput.length}, Config length: ${passwordConfig.length}`)
    // Mostrar códigos de caracteres del password (solo primeros y últimos para seguridad)
    if (passwordInput.length > 0 && passwordConfig.length > 0) {
      const inputFirst = passwordInput.substring(0, 3).split('').map(c => c.charCodeAt(0))
      const configFirst = passwordConfig.substring(0, 3).split('').map(c => c.charCodeAt(0))
      console.log(`   Input first 3 char codes:`, inputFirst)
      console.log(`   Config first 3 char codes:`, configFirst)
    }
  }
  
  const result = emailMatch && passwordMatch
  console.log(`[Auth] Resultado final: ${result ? "✅ AUTENTICACIÓN EXITOSA" : "❌ AUTENTICACIÓN FALLIDA"}`)
  
  return result
}

/**
 * Crear token JWT para sesión autenticada
 */
export async function createAuthToken(email: string): Promise<string> {
  const session: AuthSession = {
    email,
    timestamp: Date.now(),
  }

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)

  return token
}

/**
 * Verificar token JWT y extraer sesión
 */
export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const session = payload as unknown as AuthSession

    // Verificar expiración personalizada (24 horas)
    const isExpired = Date.now() - session.timestamp > SESSION_DURATION
    if (isExpired) {
      return null
    }

    // Verificar que el email sea el correcto
    if (session.email !== ADMIN_CREDENTIALS.email) {
      return null
    }

    return session
  } catch (error) {
    return null
  }
}

/**
 * Extraer token del header Authorization
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Middleware para verificar autenticación en APIs
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ authenticated: boolean; response?: NextResponse }> {
  const token = extractToken(request)

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "No autorizado. Token de autenticación requerido." },
        { status: 401 }
      ),
    }
  }

  const session = await verifyAuthToken(token)

  if (!session) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "No autorizado. Token inválido o expirado." },
        { status: 401 }
      ),
    }
  }

  return { authenticated: true }
}

/**
 * Verificar si las credenciales están configuradas
 */
export function areCredentialsConfigured(): boolean {
  return !!(ADMIN_CREDENTIALS.email && ADMIN_CREDENTIALS.password)
}

