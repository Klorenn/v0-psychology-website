import { type NextRequest, NextResponse } from "next/server"
import { saveGoogleCalendarTokens } from "@/lib/google-calendar-auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  
  // Forzar uso de localhost para desarrollo (ignorar NEXT_PUBLIC_BASE_URL si apunta a localtunnel)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.includes("localhost") 
    ? process.env.NEXT_PUBLIC_BASE_URL 
    : "http://localhost:3000"
  const dashboardUrl = `${baseUrl}/dashboard`
  
  if (error) {
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=no_code`)
  }
  
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  // Forzar uso de localhost para desarrollo
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google-calendar/callback"
  
  if (!clientId || !clientSecret) {
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
      console.error("Error intercambiando código:", errorData)
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
    
    return NextResponse.redirect(`${dashboardUrl}?calendar_connected=success`)
  } catch (error) {
    console.error("Error en callback de Google Calendar:", error)
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=server_error`)
  }
}

