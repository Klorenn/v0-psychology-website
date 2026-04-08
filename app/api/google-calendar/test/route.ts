import { type NextRequest, NextResponse } from "next/server"

/**
 * Endpoint de prueba para verificar que la ruta de callback está funcionando
 * Visita: https://psmariasanluis.com/api/google-calendar/test
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/google-calendar/callback`
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  return NextResponse.json({
    status: "ok",
    message: "Endpoint de prueba de Google Calendar",
    configuration: {
      baseUrl,
      redirectUri,
      clientIdConfigured: !!clientId,
      clientSecretConfigured: !!clientSecret,
      callbackUrl: `${baseUrl}/api/google-calendar/callback`,
    },
    instructions: {
      step1: "Verifica que GOOGLE_REDIRECT_URI en Vercel sea exactamente:",
      redirectUriExpected: "https://psmariasanluis.com/api/google-calendar/callback",
      step2: "En Google Cloud Console, agrega esta URI en 'URIs de redirección autorizadas':",
      redirectUriForGoogle: "https://psmariasanluis.com/api/google-calendar/callback",
      step3: "Asegúrate de que coincidan exactamente (sin espacios, sin / al final)",
    },
    testCallback: {
      url: `${baseUrl}/api/google-calendar/callback?test=1`,
      message: "Visita esta URL para probar que el callback responde",
    },
  })
}


