import { NextResponse } from "next/server"
import { verifyAdminCredentials } from "@/lib/api-auth"

/**
 * Endpoint de prueba directa de login
 * Permite probar las credenciales directamente
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email y password requeridos",
      }, { status: 400 })
    }

    // Verificar variables de entorno directamente
    const rawEmail = process.env.ADMIN_EMAIL
    const rawPassword = process.env.ADMIN_PASSWORD
    
    const normalizedEmail = (rawEmail || "").trim()
    const normalizedPassword = (rawPassword || "").trim()
    
    const inputEmail = email.trim()
    const inputPassword = password.trim()

    // Comparación manual detallada
    const emailMatch = inputEmail.toLowerCase() === normalizedEmail.toLowerCase()
    const passwordMatch = inputPassword === normalizedPassword

    // Información detallada para debugging
    const debugInfo = {
      input: {
        email: inputEmail,
        emailLength: inputEmail.length,
        passwordLength: inputPassword.length,
        emailFirstChars: inputEmail.substring(0, 10),
        passwordFirstChars: inputPassword.substring(0, 3) + "...",
      },
      config: {
        email: normalizedEmail,
        emailLength: normalizedEmail.length,
        passwordLength: normalizedPassword.length,
        emailFirstChars: normalizedEmail.substring(0, 10),
        passwordFirstChars: normalizedPassword.substring(0, 3) + "...",
        hasRawEmail: !!rawEmail,
        hasRawPassword: !!rawPassword,
      },
      comparison: {
        emailMatch,
        passwordMatch,
        emailCharCodes: {
          input: inputEmail.substring(0, 5).split('').map((c: string) => c.charCodeAt(0)),
          config: normalizedEmail.substring(0, 5).split('').map((c: string) => c.charCodeAt(0)),
        },
        passwordLengths: {
          input: inputPassword.length,
          config: normalizedPassword.length,
        },
      },
    }

    // Intentar verificación con la función
    const isValid = await verifyAdminCredentials(email, password)

    return NextResponse.json({
      success: isValid,
      debug: debugInfo,
      message: isValid 
        ? "✅ Credenciales válidas"
        : "❌ Credenciales inválidas",
      recommendations: !isValid ? [
        emailMatch && !passwordMatch ? "El email es correcto pero el password no coincide" : null,
        !emailMatch && passwordMatch ? "El password es correcto pero el email no coincide" : null,
        !emailMatch && !passwordMatch ? "Ni el email ni el password coinciden" : null,
        normalizedEmail.length !== inputEmail.length ? "Las longitudes de email no coinciden" : null,
        normalizedPassword.length !== inputPassword.length ? "Las longitudes de password no coinciden" : null,
      ].filter(Boolean) : [],
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Error en test",
    }, { status: 500 })
  }
}

