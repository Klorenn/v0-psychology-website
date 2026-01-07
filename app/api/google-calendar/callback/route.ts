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
      // Visita directa - mostrar página con botón de Google
      console.log(`[OAuth Callback] ℹ️  Visita directa al callback sin parámetros`)
      
      const authUrl = `${baseUrl}/api/google-calendar/auth`
      
      // Retornar página HTML con botón de Google
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conectar Google Calendar</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .google-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: white;
      border: 1px solid #dadce0;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      color: #3c4043;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      width: 100%;
      max-width: 300px;
    }
    .google-button:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      background: #f8f9fa;
    }
    .google-button:active {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    .google-icon {
      width: 20px;
      height: 20px;
    }
    .features {
      margin-top: 30px;
      text-align: left;
    }
    .features h3 {
      color: #1a1a1a;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    .features ul {
      list-style: none;
      padding: 0;
    }
    .features li {
      color: #666;
      font-size: 14px;
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }
    .features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #34a853;
      font-weight: bold;
    }
    .back-link {
      margin-top: 30px;
      display: block;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }
    .back-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📅</div>
    <h1>Conectar Google Calendar</h1>
    <p>Vincula tu cuenta de Google Calendar para sincronizar automáticamente tus citas y horarios disponibles.</p>
    
    <a href="${authUrl}" class="google-button">
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continuar con Google
    </a>
    
    <div class="features">
      <h3>Beneficios:</h3>
      <ul>
        <li>Creación automática de eventos en tu calendario</li>
        <li>Sincronización de horarios disponibles</li>
        <li>Recordatorios automáticos de citas</li>
        <li>Google Meet para sesiones online</li>
      </ul>
    </div>
    
    <a href="${dashboardUrl}" class="back-link">← Volver al dashboard</a>
  </div>
</body>
</html>`
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
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

