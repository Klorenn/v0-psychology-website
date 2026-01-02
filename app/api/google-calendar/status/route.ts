import { type NextRequest, NextResponse } from "next/server"
import { getGoogleCalendarTokens } from "@/lib/google-calendar-auth"

export async function GET(request: NextRequest) {
  try {
    const tokens = await getGoogleCalendarTokens()
    
    if (!tokens) {
      return NextResponse.json({ connected: false }, { status: 200 })
    }
    
    // Verificar que el token aún funciona
    try {
      // Usar Promise.race para timeout más limpio
      const fetchPromise = fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Timeout"))
        }, 5000) // 5 segundos timeout
      })
      
      const response = await Promise.race([fetchPromise, timeoutPromise])
      
      if (!response.ok) {
        return NextResponse.json({ connected: false }, { status: 200 })
      }
      
      return NextResponse.json({
        connected: true,
        calendarId: tokens.calendarId || "primary",
        userEmail: tokens.userEmail || null,
      }, { status: 200 })
    } catch (error) {
      // Si hay error (incluyendo timeout), asumir que no está conectado
      return NextResponse.json({ connected: false }, { status: 200 })
    }
  } catch (error) {
    console.error("Error verificando estado de Google Calendar:", error)
    return NextResponse.json({ connected: false }, { status: 200 })
  }
}

