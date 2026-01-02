import { type NextRequest, NextResponse } from "next/server"
import { signFlowParams, getFlowCredentials } from "@/lib/flow-auth"

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

    const { apiKey, secretKey, baseUrl } = getFlowCredentials()
    
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Flow no está configurado. Configure FLOW_API_KEY y FLOW_SECRET_KEY en las variables de entorno." },
        { status: 500 }
      )
    }

    const baseUrlApp = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    
    // Parámetros para crear el pago en Flow
    const flowParams: Record<string, string | number> = {
      apiKey: apiKey,
      commerceOrder: appointmentId,
      subject: description,
      amount: parseFloat(amount.toString()),
      email: patientEmail,
      urlConfirmation: `${baseUrlApp}/api/flow/webhook`,
      urlReturn: `${baseUrlApp}/booking/success?appointment_id=${appointmentId}`,
      optional: JSON.stringify({
        appointmentId,
        patientName,
        patientEmail,
      }),
    }

    // Firmar parámetros
    const signature = signFlowParams(flowParams, secretKey)
    flowParams.s = signature

    // Crear pago en Flow (endpoint correcto según documentación)
    const formData = new URLSearchParams()
    Object.entries(flowParams).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const response = await fetch(`${baseUrl}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error creando pago en Flow:", errorText)
      return NextResponse.json(
        { error: "Error al crear el pago en Flow", details: errorText },
        { status: 500 }
      )
    }

    const flowData = await response.text()
    
    // Flow devuelve los datos en formato URL-encoded
    const params = new URLSearchParams(flowData)
    const token = params.get("token")
    const url = params.get("url")

    if (!token || !url) {
      return NextResponse.json(
        { error: "Respuesta inválida de Flow" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      token,
      url, // URL para redirigir al checkout de Flow
      paymentId: params.get("flowOrder") || null,
    })
  } catch (error) {
    console.error("Error en create-payment de Flow:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

