import { type NextRequest, NextResponse } from "next/server"
import { saveGoogleCalendarTokens } from "@/lib/google-calendar-auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  
  // Obtener la URL completa de la request para debugging
  const fullUrl = request.nextUrl.toString()
  const allParams = Object.fromEntries(searchParams.entries())
  
  // Determinar baseUrl:
  // 1. Usar NEXT_PUBLIC_BASE_URL si está configurado (preferido para producción)
  // 2. Si estamos en Vercel, intentar obtener de headers
  // 3. Solo usar localhost como último recurso (desarrollo local)
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  
  if (!baseUrl && process.env.VERCEL) {
    // En Vercel, podemos obtener el host de los headers
    const host = request.headers.get('host')
    if (host) {
      baseUrl = `https://${host}`
    }
  }
  
  if (!baseUrl) {
    baseUrl = "http://localhost:3000"
  }
  
  const dashboardUrl = `${baseUrl}/dashboard`
  
  // Log detallado para debugging
  console.log(`[OAuth Callback] 🔍 Configuración:`)
  console.log(`[OAuth Callback]   URL completa recibida: ${fullUrl}`)
  console.log(`[OAuth Callback]   Todos los parámetros:`, allParams)
  console.log(`[OAuth Callback]   Base URL: ${baseUrl}`)
  console.log(`[OAuth Callback]   Dashboard URL: ${dashboardUrl}`)
  console.log(`[OAuth Callback]   Code recibido: ${code ? 'Sí' : 'No'}`)
  console.log(`[OAuth Callback]   Error recibido: ${error || 'No'}`)
  console.log(`[OAuth Callback]   NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'NO CONFIGURADO'}`)
  
  if (error) {
    console.error(`[OAuth Callback] ❌ Error de Google: ${error}`)
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    // Si no hay código ni error, puede ser:
    // 1. Se visitó directamente la URL sin parámetros (no es un callback de Google)
    // 2. Google redirigió sin parámetros (URI no coincide)
    
    // Si no hay parámetros en absoluto, es una visita directa
    const hasAnyParams = searchParams.toString().length > 0
    
    if (!hasAnyParams) {
      // Visita directa - mostrar mensaje informativo
      console.log(`[OAuth Callback] ℹ️  Visita directa al callback sin parámetros`)
      return NextResponse.redirect(`${dashboardUrl}?calendar_info=${encodeURIComponent('Para conectar Google Calendar, ve al dashboard y haz clic en "Vincular con Google Calendar"')}`)
    }
    
    // Si hay parámetros pero no code ni error, es un problema de configuración
    console.error(`[OAuth Callback] ❌ No se recibió código de autorización`)
    console.error(`[OAuth Callback] ❌ Esto generalmente significa que la URI de redirección en Google Cloud Console no coincide`)
    console.error(`[OAuth Callback] ❌ URI esperada: ${process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/google-calendar/callback`}`)
    console.error(`[OAuth Callback] ❌ URL recibida: ${fullUrl}`)
    
    // Construir mensaje de error más descriptivo
    const expectedUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/google-calendar/callback`
    const errorMsg = `no_code|Verifica que en Google Cloud Console hayas agregado exactamente: ${expectedUri}`
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=${encodeURIComponent(errorMsg)}`)
  }
  
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  // Determinar redirectUri (debe coincidir con el que se usó en /auth)
  let redirectUri = process.env.GOOGLE_REDIRECT_URI
  if (!redirectUri) {
    redirectUri = `${baseUrl}/api/google-calendar/callback`
  }
  
  console.log(`[OAuth Callback]   Client ID: ${clientId ? clientId.substring(0, 20) + '...' : 'NO CONFIGURADO'}`)
  console.log(`[OAuth Callback]   Client Secret: ${clientSecret ? 'CONFIGURADO' : 'NO CONFIGURADO'}`)
  console.log(`[OAuth Callback]   Redirect URI: ${redirectUri}`)
  
  if (!clientId || !clientSecret) {
    console.error(`[OAuth Callback] ❌ Faltan credenciales: Client ID=${!!clientId}, Secret=${!!clientSecret}`)
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=not_configured`)
  }
  
  try {
    // Intercambiar código por tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error(`[OAuth Callback] ❌ Error intercambiando código:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      })
      
      // Si es un error de redirect_uri_mismatch, dar un mensaje más específico
      if (errorData.error === "redirect_uri_mismatch") {
        console.error(`[OAuth Callback] ❌ redirect_uri_mismatch - La URI debe ser exactamente: ${redirectUri}`)
        return NextResponse.redirect(`${dashboardUrl}?calendar_error=${encodeURIComponent('redirect_uri_mismatch')}`)
      }
      
      return NextResponse.redirect(`${dashboardUrl}?calendar_error=token_exchange_failed`)
    }
    
    const tokenData = await tokenResponse.json()
    
    // Obtener información del usuario y calendario principal
    const [userInfoResponse, calendarResponse] = await Promise.all([
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }),
      fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }),
    ])
    
    // Obtener email del usuario
    let userEmail: string | undefined
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      userEmail = userInfo.email
      console.log(`✅ Email de Google Calendar vinculado: ${userEmail}`)
    }
    
    // Obtener calendario principal o buscar por email
    let calendarId = "primary"
    if (calendarResponse.ok) {
      const calendars = await calendarResponse.json()
      const items = calendars.items || []
      
      // Buscar calendario por email del usuario primero
      if (userEmail) {
        const emailCalendar = items.find((cal: any) => 
          cal.id === userEmail || 
          cal.id?.includes(userEmail) ||
          cal.summary === userEmail
        )
        if (emailCalendar) {
          calendarId = emailCalendar.id
          console.log(`✅ Calendario encontrado por email: ${calendarId}`)
        }
      }
      
      // Si no se encontró por email, usar el calendario principal
      if (calendarId === "primary") {
        const primaryCalendar = items.find((cal: any) => cal.primary)
        if (primaryCalendar) {
          calendarId = primaryCalendar.id
          console.log(`✅ Usando calendario principal: ${calendarId}`)
        }
      }
      
      // Log de todos los calendarios disponibles para debugging
      console.log(`📋 Calendarios disponibles (${items.length}):`)
      items.slice(0, 5).forEach((cal: any) => {
        console.log(`   - ${cal.id} (${cal.summary}) ${cal.primary ? '[PRIMARY]' : ''}`)
      })
    }
    
    // Guardar tokens con email del usuario
    await saveGoogleCalendarTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiryDate: Date.now() + (tokenData.expires_in * 1000),
      calendarId: calendarId,
      userEmail: userEmail,
    })
    
    console.log(`[OAuth Callback] ✅ Tokens guardados exitosamente para: ${userEmail}`)
    return NextResponse.redirect(`${dashboardUrl}?calendar_connected=success`)
  } catch (error) {
    console.error(`[OAuth Callback] ❌ Error en callback de Google Calendar:`, error)
    if (error instanceof Error) {
      console.error(`[OAuth Callback] ❌ Mensaje: ${error.message}`)
      console.error(`[OAuth Callback] ❌ Stack: ${error.stack}`)
    }
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=server_error`)
  }
}

