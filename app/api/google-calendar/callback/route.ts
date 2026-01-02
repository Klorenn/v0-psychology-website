import { type NextRequest, NextResponse } from "next/server"
import { saveGoogleCalendarTokens } from "@/lib/google-calendar-auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const dashboardUrl = `${baseUrl}/dashboard`
  
  if (error) {
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=no_code`)
  }
  
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/google-calendar/callback`
  
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
    
    // Obtener información del calendario principal
    const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })
    
    let calendarId = "primary"
    if (calendarResponse.ok) {
      const calendars = await calendarResponse.json()
      const primaryCalendar = calendars.items?.find((cal: any) => cal.primary)
      if (primaryCalendar) {
        calendarId = primaryCalendar.id
      }
    }
    
    // Guardar tokens
    await saveGoogleCalendarTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiryDate: Date.now() + (tokenData.expires_in * 1000),
      calendarId: calendarId,
    })
    
    return NextResponse.redirect(`${dashboardUrl}?calendar_connected=success`)
  } catch (error) {
    console.error("Error en callback de Google Calendar:", error)
    return NextResponse.redirect(`${dashboardUrl}?calendar_error=server_error`)
  }
}

