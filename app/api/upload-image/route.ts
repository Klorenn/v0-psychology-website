import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { requireAuth } from "@/lib/api-auth"
import { validateImageFile, sanitizeFileName, getFileExtension } from "@/lib/file-validation"

const UPLOAD_DIR = path.join(process.cwd(), "public", "images")

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null // "profile", "logo", or "additional"

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    if (!type || (type !== "profile" && type !== "logo" && type !== "additional")) {
      return NextResponse.json({ error: "Tipo de imagen inválido. Debe ser 'profile', 'logo' o 'additional'" }, { status: 400 })
    }

    // Validación completa del archivo (incluyendo magic bytes)
    const validation = await validateImageFile(file, {
      validateDimensions: true,
      maxWidth: 4000,
      maxHeight: 4000,
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const sanitizedOriginalName = sanitizeFileName(file.name)
    const extension = getFileExtension(sanitizedOriginalName, file.type)
    const timestamp = Date.now()
    const fileName = `${type}-${timestamp}.${extension}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    await writeFile(filePath, buffer)

    const fileUrl = `/images/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
    })
  } catch (error) {
    console.error("Error subiendo imagen:", error)
    return NextResponse.json(
      { error: "Error al subir la imagen", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

