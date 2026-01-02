import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]
const UPLOAD_DIR = path.join(process.cwd(), "public", "receipts")

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "")
    .replace(/\.\./g, "")
    .substring(0, 100)
}

function getFileExtension(fileName: string, mimeType: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""
  
  if (ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
    }
    
    if (mimeToExt[mimeType] && mimeToExt[mimeType] === extension) {
      return extension
    }
    
    return mimeToExt[mimeType] || "pdf"
  }
  
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
  }
  
  return mimeToExt[mimeType] || "pdf"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const appointmentId = formData.get("appointmentId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    if (!appointmentId) {
      return NextResponse.json({ error: "ID de cita requerido" }, { status: 400 })
    }

    if (!isValidUUID(appointmentId)) {
      return NextResponse.json({ error: "ID de cita inválido" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido. Solo se aceptan JPG, PNG o PDF." }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const sanitizedOriginalName = sanitizeFileName(file.name)
    const extension = getFileExtension(sanitizedOriginalName, file.type)
    const sanitizedAppointmentId = sanitizeFileName(appointmentId)
    const fileName = `${sanitizedAppointmentId}-${Date.now()}.${extension}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    await writeFile(filePath, buffer)

    const fileUrl = `/receipts/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
    })
  } catch (error) {
    console.error("Error subiendo archivo:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

