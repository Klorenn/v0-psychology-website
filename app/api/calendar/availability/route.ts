import { type NextRequest, NextResponse } from "next/server"

// Default available time slots (9am-12pm and 3pm-6pm)
const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"]

// Google Calendar API configuration
// To enable Google Calendar sync:
// 1. Go to Google Cloud Console (console.cloud.google.com)
// 2. Create a new project or select existing one
// 3. Enable Google Calendar API
// 4. Create an API key (for public calendar access)
// 5. Make sure your calendar's free/busy info is set to public
// 6. Add GOOGLE_CALENDAR_API_KEY and GOOGLE_CALENDAR_ID to your environment variables

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get("date")

  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  // If Google Calendar is not configured, return default slots
  if (!apiKey || !calendarId) {
    console.log("[v0] Google Calendar not configured, returning default slots")
    return NextResponse.json({
      availableSlots: DEFAULT_SLOTS,
      source: "default",
    })
  }

  try {
    // Parse the date and create time range for the query
    const date = new Date(dateParam)
    const timeMin = new Date(date)
    timeMin.setHours(0, 0, 0, 0)

    const timeMax = new Date(date)
    timeMax.setHours(23, 59, 59, 999)

    // Query Google Calendar Free/Busy API
    const response = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: "America/Santiago",
        items: [{ id: calendarId }],
      }),
    })

    if (!response.ok) {
      console.error("[v0] Google Calendar API error:", response.status)
      return NextResponse.json({
        availableSlots: DEFAULT_SLOTS,
        source: "default",
      })
    }

    const data = await response.json()
    const busySlots = data.calendars?.[calendarId]?.busy || []

    // Filter out busy time slots
    const availableSlots = DEFAULT_SLOTS.filter((slot) => {
      const [hours, minutes] = slot.split(":").map(Number)
      const slotStart = new Date(date)
      slotStart.setHours(hours, minutes, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setHours(hours + 1, 0, 0, 0) // Assuming 1-hour slots

      // Check if this slot overlaps with any busy period
      return !busySlots.some((busy: { start: string; end: string }) => {
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return slotStart < busyEnd && slotEnd > busyStart
      })
    })

    return NextResponse.json({
      availableSlots,
      source: "google_calendar",
    })
  } catch (error) {
    console.error("[v0] Error fetching calendar availability:", error)
    return NextResponse.json({
      availableSlots: DEFAULT_SLOTS,
      source: "default",
    })
  }
}
