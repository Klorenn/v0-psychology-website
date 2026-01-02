import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"]
const UPLOAD_DIR = path.join(process.cwd(), "public", "images")

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100)
}

function getFileExtension(fileName: string, mimeType: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""
  
  if (ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
    }
    
    if (mimeToExt[mimeType] && mimeToExt[mimeType] === extension) {
      return extension
    }
    
    return mimeToExt[mimeType] || "jpg"
  }
  
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
  }
  
  return mimeToExt[mimeType] || "jpg"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null // "profile" or "logo"

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    if (!type || (type !== "profile" && type !== "logo")) {
      return NextResponse.json({ error: "Tipo de imagen inválido. Debe ser 'profile' o 'logo'" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido. Solo se aceptan JPG o PNG." }, { status: 400 })
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

