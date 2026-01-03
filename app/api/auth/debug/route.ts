import { NextResponse } from "next/server"

/**
 * Endpoint de diagnóstico para verificar configuración de variables de entorno
 * SOLO PARA DEBUG - Eliminar en producción
 */
export async function GET() {
  // Verificar variables de entorno (sin exponer valores completos)
  const hasAdminEmail = !!process.env.ADMIN_EMAIL
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD
  const hasJwtSecret = !!process.env.JWT_SECRET
  
  // Mostrar primeros y últimos caracteres para verificación (sin exponer completo)
  const adminEmailPreview = process.env.ADMIN_EMAIL 
    ? `${process.env.ADMIN_EMAIL.substring(0, 3)}...${process.env.ADMIN_EMAIL.substring(process.env.ADMIN_EMAIL.length - 10)}`
    : "NO CONFIGURADO"
  
  const adminPasswordLength = process.env.ADMIN_PASSWORD?.length || 0
  const jwtSecretLength = process.env.JWT_SECRET?.length || 0
  
  // Verificar si las credenciales están configuradas
  const credentialsConfigured = hasAdminEmail && hasAdminPassword
  
  return NextResponse.json({
    status: "ok",
    environment: process.env.NODE_ENV || "unknown",
    variables: {
      ADMIN_EMAIL: {
        configured: hasAdminEmail,
        preview: adminEmailPreview,
        length: process.env.ADMIN_EMAIL?.length || 0,
      },
      ADMIN_PASSWORD: {
        configured: hasAdminPassword,
        length: adminPasswordLength,
        // No mostrar preview de password por seguridad
      },
      JWT_SECRET: {
        configured: hasJwtSecret,
        length: jwtSecretLength,
      },
    },
    credentialsReady: credentialsConfigured,
    message: credentialsConfigured 
      ? "✅ Credenciales configuradas correctamente"
      : "❌ Faltan credenciales. Verifica ADMIN_EMAIL y ADMIN_PASSWORD en Vercel",
    recommendations: !credentialsConfigured ? [
      "1. Ve a Vercel Dashboard → Settings → Environment Variables",
      "2. Verifica que ADMIN_EMAIL y ADMIN_PASSWORD estén configuradas",
      "3. Asegúrate de seleccionar Production, Preview y Development",
      "4. Redesplega el proyecto después de agregar variables",
    ] : [],
  })
}

