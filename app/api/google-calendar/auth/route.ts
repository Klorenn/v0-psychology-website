import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  
  // Determinar la URI de redirección:
  // 1. Usar GOOGLE_REDIRECT_URI si está configurado (preferido)
  // 2. Si no, construir usando NEXT_PUBLIC_BASE_URL
  // 3. Solo usar localhost como último recurso (desarrollo local)
  let redirectUri = process.env.GOOGLE_REDIRECT_URI
  
  if (!redirectUri) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    redirectUri = `${baseUrl}/api/google-calendar/callback`
  }
  
  // Log para debugging
  console.log(`[OAuth] 🔍 Configuración de OAuth:`)
  console.log(`[OAuth]   Client ID: ${clientId ? clientId.substring(0, 20) + '...' : 'NO CONFIGURADO'}`)
  console.log(`[OAuth]   Redirect URI: ${redirectUri}`)
  console.log(`[OAuth]   NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'NO CONFIGURADO'}`)
  console.log(`[OAuth]   GOOGLE_REDIRECT_URI: ${process.env.GOOGLE_REDIRECT_URI || 'NO CONFIGURADO (construyendo desde baseUrl)'}`)
  
  // Validar que no estemos usando localhost en producción
  if (redirectUri.includes('localhost') && process.env.VERCEL) {
    console.error(`[OAuth] ❌ ERROR: Se está usando localhost en producción!`)
    console.error(`[OAuth] ❌ Configura GOOGLE_REDIRECT_URI o NEXT_PUBLIC_BASE_URL en Vercel`)
    return NextResponse.json(
      { 
        error: "Configuración incorrecta: Se está usando localhost en producción. " +
               "Configura GOOGLE_REDIRECT_URI o NEXT_PUBLIC_BASE_URL en las variables de entorno de Vercel."
      },
      { status: 500 }
    )
  }
  
  if (!clientId) {
    return NextResponse.json(
      { error: "Google Client ID no configurado. Configure GOOGLE_CLIENT_ID en las variables de entorno." },
      { status: 500 }
    )
  }
  
  // Incluir scope de email para obtener información del usuario
  const scope = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email"
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "consent",
  })}`
  
  console.log(`[OAuth] 🔗 URL de autorización generada`)
  console.log(`[OAuth] ⚠️  Asegúrate de que esta URI esté en Google Cloud Console:`)
  console.log(`[OAuth]    ${redirectUri}`)
  
  return NextResponse.redirect(authUrl)
}

