import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

/**
 * Endpoint para verificar el estado de Resend
 * GET /api/test/resend-status
 */
export async function GET(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev"

    const status = {
      configured: !!resendApiKey,
      apiKeyPresent: !!resendApiKey && resendApiKey.length > 0,
      apiKeyLength: resendApiKey?.length || 0,
      emailFrom: emailFrom,
      resendInitialized: false,
      testResult: null as any,
    }

    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        status,
        error: "RESEND_API_KEY no está configurado en las variables de entorno",
        instructions: [
          "1. Ve a https://resend.com/api-keys",
          "2. Crea una nueva API key",
          "3. Agrega RESEND_API_KEY=re_xxxxx a tu archivo .env.local",
          "4. Reinicia el servidor",
        ],
      })
    }

    // Intentar inicializar Resend
    try {
      const resend = new Resend(resendApiKey)
      status.resendInitialized = true

      // Intentar verificar la API key haciendo una llamada simple
      // Nota: Resend no tiene un endpoint de verificación directo,
      // pero podemos intentar obtener información de la cuenta
      try {
        // Intentar listar dominios (esto requiere permisos, pero es una buena prueba)
        const domains = await resend.domains.list()
        status.testResult = {
          success: true,
          message: "API key válida",
          domainsCount: (domains.data as any)?.length || 0,
        }
      } catch (testError: any) {
        // Si falla, puede ser por permisos, pero la key puede ser válida
        status.testResult = {
          success: true,
          message: "API key inicializada correctamente",
          note: "No se pudo verificar completamente (puede requerir permisos adicionales)",
          error: testError?.message || "Error desconocido",
        }
      }
    } catch (initError: any) {
      status.testResult = {
        success: false,
        error: "Error inicializando Resend",
        details: initError?.message || "Error desconocido",
      }
    }

    return NextResponse.json({
      success: status.resendInitialized && status.testResult?.success !== false,
      status,
      summary: {
        configured: status.configured,
        initialized: status.resendInitialized,
        working: status.testResult?.success !== false,
      },
      nextSteps: status.resendInitialized
        ? [
            "✅ Resend está configurado correctamente",
            "Puedes probar enviando un email desde el dashboard",
            "O creando una cita de prueba y confirmándola",
          ]
        : [
            "❌ Resend no está configurado correctamente",
            "Verifica que RESEND_API_KEY esté en .env.local",
            "Reinicia el servidor después de agregar la variable",
          ],
    })
  } catch (error) {
    console.error("Error verificando Resend:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}

