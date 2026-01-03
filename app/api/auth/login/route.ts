import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminCredentials, createAuthToken, areCredentialsConfigured } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    if (!areCredentialsConfigured()) {
      return NextResponse.json(
        { error: "Credenciales de administrador no configuradas" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const isValid = await verifyAdminCredentials(email, password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    const token = await createAuthToken(email)

    return NextResponse.json({
      success: true,
      token,
      expiresIn: 24 * 60 * 60, // 24 horas en segundos
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

