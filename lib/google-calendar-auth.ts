import { promises as fs } from "fs"
import path from "path"

const TOKEN_FILE = path.join(process.cwd(), "data", "google-calendar-tokens.json")

export interface GoogleCalendarTokens {
  accessToken: string
  refreshToken: string
  expiryDate: number
  calendarId?: string
}

export async function getGoogleCalendarTokens(): Promise<GoogleCalendarTokens | null> {
  try {
    const data = await fs.readFile(TOKEN_FILE, "utf-8")
    const tokens = JSON.parse(data) as GoogleCalendarTokens
    
    // Verificar si el token expiró
    if (tokens.expiryDate && Date.now() >= tokens.expiryDate) {
      // Intentar refrescar el token
      return await refreshAccessToken(tokens.refreshToken)
    }
    
    return tokens
  } catch {
    return null
  }
}

export async function saveGoogleCalendarTokens(tokens: GoogleCalendarTokens): Promise<void> {
  // Asegurar que el directorio existe
  const dataDir = path.dirname(TOKEN_FILE)
  await fs.mkdir(dataDir, { recursive: true })
  
  await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf-8")
}

export async function deleteGoogleCalendarTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE)
  } catch {
    // Archivo no existe, está bien
  }
}

async function refreshAccessToken(refreshToken: string): Promise<GoogleCalendarTokens | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    return null
  }
  
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    const tokens: GoogleCalendarTokens = {
      accessToken: data.access_token,
      refreshToken: refreshToken, // El refresh token no cambia
      expiryDate: Date.now() + (data.expires_in * 1000),
    }
    
    await saveGoogleCalendarTokens(tokens)
    return tokens
  } catch {
    return null
  }
}

