import { getGoogleTokens, saveGoogleTokens as saveTokensDB, deleteGoogleTokens as deleteTokensDB } from "./db"

export interface GoogleCalendarTokens {
  accessToken: string
  refreshToken: string
  expiryDate: number
  calendarId?: string
  userEmail?: string
}

export async function getGoogleCalendarTokens(): Promise<GoogleCalendarTokens | null> {
  try {
    const tokens = await getGoogleTokens()

    if (!tokens) {
      return null
    }

    // Si el token está expirado, intentar refrescarlo
    if (tokens.expiryDate && Date.now() >= tokens.expiryDate) {
      return await refreshAccessToken(tokens.refreshToken)
    }

    return tokens
  } catch (error) {
    console.error("Error obteniendo tokens:", error)
    return null
  }
}

export async function saveGoogleCalendarTokens(tokens: GoogleCalendarTokens): Promise<void> {
  try {
    await saveTokensDB(tokens)
  } catch (error) {
    console.error("Error guardando tokens:", error)
    throw error
  }
}

export async function deleteGoogleCalendarTokens(): Promise<void> {
  try {
    await deleteTokensDB()
  } catch (error) {
    console.error("Error eliminando tokens:", error)
    throw error
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
      refreshToken: refreshToken,
      expiryDate: Date.now() + (data.expires_in * 1000),
    }

    await saveGoogleCalendarTokens(tokens)
    return tokens
  } catch (error) {
    console.error("Error refrescando token:", error)
    return null
  }
}

