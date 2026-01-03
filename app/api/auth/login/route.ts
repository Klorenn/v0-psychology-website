import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminCredentials, createAuthToken, areCredentialsConfigured } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    // Verificar configuración de credenciales
    if (!areCredentialsConfigured()) {
      console.error("[Login] ❌ Credenciales no configuradas")
      console.error("   ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "✅ Configurado" : "❌ No configurado")
      console.error("   ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "✅ Configurado" : "❌ No configurado")
      return NextResponse.json(
        { 
          error: "Credenciales de administrador no configuradas",
          details: "Verifica que ADMIN_EMAIL y ADMIN_PASSWORD estén configuradas en Vercel"
        },
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

    console.log(`[Login] Intento de login para: ${email.substring(0, 5)}...`)
    
    const isValid = await verifyAdminCredentials(email, password)

    if (!isValid) {
      console.log(`[Login] ❌ Credenciales inválidas para: ${email.substring(0, 5)}...`)
      return NextResponse.json(
        { 
          error: "Credenciales incorrectas. Verifica tu correo y contraseña.",
          hint: "Asegúrate de que las variables ADMIN_EMAIL y ADMIN_PASSWORD estén correctamente configuradas en Vercel"
        },
        { status: 401 }
      )
    }
    
    console.log(`[Login] ✅ Login exitoso para: ${email.substring(0, 5)}...`)

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

