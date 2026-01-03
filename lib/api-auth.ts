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
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "",
  password: process.env.ADMIN_PASSWORD || "",
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
    return false
  }
  
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
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

