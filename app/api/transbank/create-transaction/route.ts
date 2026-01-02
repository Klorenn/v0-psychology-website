import { type NextRequest, NextResponse } from "next/server"
import { getTransbankCredentials, getTransbankBaseUrl, getTransbankHeaders } from "@/lib/transbank-auth"
import { randomUUID } from "crypto"

/**
 * Crea una transacción en Transbank Webpay Plus
 * POST /api/transbank/create-transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, amount, description, patientEmail, patientName } = body

    if (!appointmentId || !amount || !description || !patientEmail) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const { commerceCode, apiKey, environment } = getTransbankCredentials()

    if (!commerceCode || !apiKey) {
      return NextResponse.json(
        { error: "Transbank no está configurado. Configure TRANSBANK_COMMERCE_CODE y TRANSBANK_API_KEY en las variables de entorno." },
        { status: 500 }
      )
    }

    const baseUrl = getTransbankBaseUrl(environment)
    const baseUrlApp = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Generar buy_order único (máximo 26 caracteres)
    const buyOrder = appointmentId.substring(0, 26)
    const sessionId = randomUUID().substring(0, 61) // Máximo 61 caracteres

    // Crear la transacción en Transbank
    const transactionData = {
      buy_order: buyOrder,
      session_id: sessionId,
      amount: parseFloat(amount.toString()),
      return_url: `${baseUrlApp}/api/transbank/confirm-transaction?appointment_id=${appointmentId}`,
    }

    const headers = getTransbankHeaders(commerceCode, apiKey)

    const response = await fetch(`${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
      method: "POST",
      headers,
      body: JSON.stringify(transactionData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error creando transacción en Transbank:", errorText)
      return NextResponse.json(
        { error: "Error al crear la transacción en Transbank", details: errorText },
        { status: 500 }
      )
    }

    const transbankData = await response.json()

    if (!transbankData.token || !transbankData.url) {
      return NextResponse.json(
        { error: "Respuesta inválida de Transbank" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      token: transbankData.token,
      url: transbankData.url,
      buyOrder,
      sessionId,
    })
  } catch (error) {
    console.error("Error en create-transaction de Transbank:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

