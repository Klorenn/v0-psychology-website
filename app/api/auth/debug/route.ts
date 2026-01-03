import { NextResponse } from "next/server"
import { ADMIN_CREDENTIALS } from "@/lib/api-auth"

/**
 * Endpoint de diagnóstico para verificar configuración de variables de entorno
 * SOLO PARA DEBUG - Eliminar en producción
 */
export async function GET() {
  // Forzar lectura de variables de entorno (por si hay caché)
  // En Next.js, las variables de entorno se leen en tiempo de build para NEXT_PUBLIC_*
  // pero las variables sin NEXT_PUBLIC_ se leen en runtime
  const rawAdminEmail = process.env.ADMIN_EMAIL
  const rawAdminPassword = process.env.ADMIN_PASSWORD
  const rawJwtSecret = process.env.JWT_SECRET
  
  // Verificar también desde ADMIN_CREDENTIALS (ya normalizado)
  const { ADMIN_CREDENTIALS } = await import("@/lib/api-auth")
  
  // Verificar variables de entorno (sin exponer valores completos)
  
  const hasAdminEmail = !!rawAdminEmail
  const hasAdminPassword = !!rawAdminPassword
  const hasJwtSecret = !!rawJwtSecret
  
  // Mostrar primeros y últimos caracteres para verificación (sin exponer completo)
  const adminEmailPreview = rawAdminEmail 
    ? `${rawAdminEmail.substring(0, 5)}...${rawAdminEmail.substring(Math.max(0, rawAdminEmail.length - 8))}`
    : "NO CONFIGURADO"
  
  const adminPasswordLength = rawAdminPassword?.length || 0
  const jwtSecretLength = rawJwtSecret?.length || 0
  
  // Verificar valores normalizados (como los usa el código)
  const normalizedEmail = (rawAdminEmail || "").trim()
  const normalizedPassword = (rawAdminPassword || "").trim()
  
  // Verificar si las credenciales están configuradas
  const credentialsConfigured = hasAdminEmail && hasAdminPassword
  
  // Mostrar información de caracteres especiales
  const emailHasSpaces = rawAdminEmail?.includes(" ") || false
  const passwordHasSpaces = rawAdminPassword?.includes(" ") || false
  const emailHasSpecialChars = rawAdminEmail ? /[^\w@.-]/.test(rawAdminEmail) : false
  const passwordHasSpecialChars = rawAdminPassword ? /[^\w!@#$%^&*()_+-=]/.test(rawAdminPassword) : false
  
  return NextResponse.json({
    status: "ok",
    environment: process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
    variables: {
      ADMIN_EMAIL: {
        configured: hasAdminEmail,
        preview: adminEmailPreview,
        length: rawAdminEmail?.length || 0,
        normalizedLength: normalizedEmail.length,
        hasSpaces: emailHasSpaces,
        hasSpecialChars: emailHasSpecialChars,
        firstChars: rawAdminEmail?.substring(0, 5) || "",
        lastChars: rawAdminEmail?.substring(Math.max(0, (rawAdminEmail?.length || 0) - 5)) || "",
        charCodes: rawAdminEmail?.substring(0, 5).split('').map(c => c.charCodeAt(0)) || [],
      },
      ADMIN_PASSWORD: {
        configured: hasAdminPassword,
        length: adminPasswordLength,
        normalizedLength: normalizedPassword.length,
        hasSpaces: passwordHasSpaces,
        hasSpecialChars: passwordHasSpecialChars,
        firstChars: rawAdminPassword?.substring(0, 3) || "",
        lastChars: rawAdminPassword?.substring(Math.max(0, adminPasswordLength - 3)) || "",
        charCodes: rawAdminPassword?.substring(0, 3).split('').map(c => c.charCodeAt(0)) || [],
      },
      JWT_SECRET: {
        configured: hasJwtSecret,
        length: jwtSecretLength,
      },
    },
    credentialsReady: credentialsConfigured,
    normalizedCredentials: {
      email: normalizedEmail.substring(0, 10) + "...",
      emailLength: normalizedEmail.length,
      passwordLength: normalizedPassword.length,
    },
    fromADMIN_CREDENTIALS: {
      email: ADMIN_CREDENTIALS.email.substring(0, 10) + "...",
      emailLength: ADMIN_CREDENTIALS.email.length,
      passwordLength: ADMIN_CREDENTIALS.password.length,
      matches: {
        email: normalizedEmail === ADMIN_CREDENTIALS.email,
        password: normalizedPassword === ADMIN_CREDENTIALS.password,
      },
    },
    message: credentialsConfigured 
      ? "✅ Credenciales configuradas correctamente"
      : "❌ Faltan credenciales. Verifica ADMIN_EMAIL y ADMIN_PASSWORD en Vercel",
    warnings: [
      ...(emailHasSpaces ? ["⚠️ ADMIN_EMAIL contiene espacios - esto puede causar problemas"] : []),
      ...(passwordHasSpaces ? ["⚠️ ADMIN_PASSWORD contiene espacios - esto puede causar problemas"] : []),
      ...(normalizedEmail.length !== (rawAdminEmail?.length || 0) ? ["⚠️ ADMIN_EMAIL tiene espacios al inicio/final que fueron removidos"] : []),
      ...(normalizedPassword.length !== (rawAdminPassword?.length || 0) ? ["⚠️ ADMIN_PASSWORD tiene espacios al inicio/final que fueron removidos"] : []),
    ],
    recommendations: !credentialsConfigured ? [
      "1. Ve a Vercel Dashboard → Settings → Environment Variables",
      "2. Verifica que ADMIN_EMAIL y ADMIN_PASSWORD estén configuradas",
      "3. Asegúrate de seleccionar Production, Preview y Development",
      "4. Redesplega el proyecto después de agregar variables",
      "5. Verifica que no haya espacios al inicio o final de los valores",
    ] : [
      "✅ Las credenciales están configuradas",
      "Si el login falla, verifica los logs en Vercel para ver detalles de la comparación",
      "Visita /api/auth/debug después de un intento de login fallido para más información",
    ],
  })
}

