import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/google-calendar/callback`
  
  if (!clientId) {
    return NextResponse.json(
      { error: "Google Client ID no configurado. Configure GOOGLE_CLIENT_ID en las variables de entorno." },
      { status: 500 }
    )
  }
  
  const scope = "https://www.googleapis.com/auth/calendar"
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "consent",
  })}`
  
  return NextResponse.redirect(authUrl)
}

