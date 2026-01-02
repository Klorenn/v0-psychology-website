import { type NextRequest, NextResponse } from "next/server"
import { deleteGoogleCalendarTokens } from "@/lib/google-calendar-auth"

export async function POST(request: NextRequest) {
  try {
    await deleteGoogleCalendarTokens()
    return NextResponse.json({ success: true, message: "Google Calendar desconectado correctamente" })
  } catch (error) {
    console.error("Error desconectando Google Calendar:", error)
    return NextResponse.json(
      { error: "Error al desconectar Google Calendar" },
      { status: 500 }
    )
  }
}

