import { type NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/google-calendar"

// Default available time slots (9am-12pm and 3pm-6pm)
const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get("date")

  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

  try {
    const date = new Date(dateParam)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    // Intentar obtener horarios de Google Calendar (si está conectado)
    const availableSlots = await getAvailableSlots(date)
    
    return NextResponse.json({
      availableSlots,
      source: availableSlots.length === DEFAULT_SLOTS.length ? "default" : "google_calendar",
    })
  } catch (error) {
    console.error("[v0] Error fetching calendar availability:", error)
    return NextResponse.json({
      availableSlots: DEFAULT_SLOTS,
      source: "default",
    })
  }
}
