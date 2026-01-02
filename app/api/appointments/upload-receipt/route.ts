import { type NextRequest, NextResponse } from "next/server"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB - aumentado para permitir archivos más grandes
// Aceptar más tipos de archivos - ser más permisivo
const ALLOWED_TYPES = [
  "image/jpeg", 
  "image/jpg", 
  "image/png", 
  "image/webp",
  "image/gif",
  "application/pdf",
  "image/*", // Aceptar cualquier imagen
]

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
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

    // Validación más permisiva - aceptar imágenes y PDFs
    const isImage = file.type.startsWith("image/")
    const isPDF = file.type === "application/pdf"
    
    if (!isImage && !isPDF) {
      return NextResponse.json({ error: "Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, etc.) o PDF." }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    // Convertir archivo a base64 para guardar en la base de datos
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Data = buffer.toString('base64')
      
      // Verificar tamaño del base64 (debe ser menor a ~1MB en base64 para evitar problemas)
      const base64SizeMB = (base64Data.length * 3) / 4 / 1024 / 1024
      if (base64SizeMB > 1) {
        console.warn(`Archivo base64 grande: ${base64SizeMB.toFixed(2)}MB`)
      }

      // Retornar los datos para que se guarden con la cita
      return NextResponse.json({
        success: true,
        receiptData: base64Data,
        receiptFilename: file.name,
        receiptMimetype: file.type,
        // URL temporal que se usará para mostrar el comprobante
        url: `/api/receipts/${appointmentId}`,
      })
    } catch (conversionError) {
      console.error("Error convirtiendo archivo a base64:", conversionError)
      throw new Error("Error al procesar el archivo. Por favor, intente con otro archivo.")
    }
  } catch (error) {
    console.error("Error procesando archivo:", error)
    return NextResponse.json(
      { error: "Error al procesar el archivo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
