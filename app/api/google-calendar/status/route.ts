import { type NextRequest, NextResponse } from "next/server"
import { getGoogleCalendarTokens } from "@/lib/google-calendar-auth"

export async function GET(request: NextRequest) {
  try {
    const tokens = await getGoogleCalendarTokens()
    
    if (!tokens) {
      return NextResponse.json({ connected: false })
    }
    
    // Verificar que el token aún funciona
    try {
      const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      
      if (!response.ok) {
        return NextResponse.json({ connected: false })
      }
      
      return NextResponse.json({
        connected: true,
        calendarId: tokens.calendarId || "primary",
      })
    } catch {
      return NextResponse.json({ connected: false })
    }
  } catch (error) {
    console.error("Error verificando estado de Google Calendar:", error)
    return NextResponse.json({ connected: false })
  }
}

