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
const ADMIN_CREDENTIALS = {
  email: (process.env.ADMIN_EMAIL || "").trim(),
  password: (process.env.ADMIN_PASSWORD || "").trim(),
}

// Log de configuración (solo en desarrollo o si hay problemas)
if (process.env.NODE_ENV === "development" || !ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
  console.log("[Auth] Configuración de credenciales:")
  console.log("   ADMIN_EMAIL:", ADMIN_CREDENTIALS.email ? `${ADMIN_CREDENTIALS.email.substring(0, 5)}...` : "❌ NO CONFIGURADO")
  console.log("   ADMIN_PASSWORD:", ADMIN_CREDENTIALS.password ? `✅ Configurado (${ADMIN_CREDENTIALS.password.length} caracteres)` : "❌ NO CONFIGURADO")
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
  if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
    console.error("⚠️ Credenciales de admin no configuradas en variables de entorno")
    console.error("   ADMIN_EMAIL configurado:", !!ADMIN_CREDENTIALS.email)
    console.error("   ADMIN_PASSWORD configurado:", !!ADMIN_CREDENTIALS.password)
    return false
  }
  
  // Normalizar emails (trim y lowercase para comparación)
  const normalizedInputEmail = email.trim().toLowerCase()
  const normalizedConfigEmail = ADMIN_CREDENTIALS.email.trim().toLowerCase()
  
  // Comparación exacta de password (sin normalizar, case-sensitive)
  const passwordMatch = password === ADMIN_CREDENTIALS.password
  
  // Log de debug (sin exponer valores completos)
  if (normalizedInputEmail !== normalizedConfigEmail) {
    console.log(`[Auth] Email no coincide. Input: ${normalizedInputEmail.substring(0, 5)}..., Config: ${normalizedConfigEmail.substring(0, 5)}...`)
  }
  if (!passwordMatch) {
    console.log(`[Auth] Password no coincide. Longitud input: ${password.length}, Longitud config: ${ADMIN_CREDENTIALS.password.length}`)
  }
  
  return normalizedInputEmail === normalizedConfigEmail && passwordMatch
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

