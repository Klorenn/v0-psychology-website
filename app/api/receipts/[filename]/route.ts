import { type NextRequest, NextResponse } from "next/server"
import { readFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { appointmentsStore } from "@/lib/appointments-store"

const RECEIPTS_DIR = path.join(process.cwd(), "data", "receipts")

// Asegurar que el directorio existe
async function ensureReceiptsDir() {
  if (!existsSync(RECEIPTS_DIR)) {
    await mkdir(RECEIPTS_DIR, { recursive: true })
  }
}

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    // Asegurar que el directorio existe
    await ensureReceiptsDir()
    
    const filename = params.filename

    // Validar nombre de archivo
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 })
    }

    // Extraer appointmentId del nombre del archivo (formato: appointmentId-timestamp.ext)
    const appointmentId = filename.split("-")[0]
    
    if (!appointmentId) {
      return NextResponse.json({ error: "ID de cita inválido" }, { status: 400 })
    }

    // Verificar que la cita existe
    await appointmentsStore.init()
    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    // Leer el archivo
    const filePath = path.join(RECEIPTS_DIR, filename)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    
    // Determinar el tipo de contenido
    const extension = filename.split(".").pop()?.toLowerCase()
    const contentType = 
      extension === "pdf" ? "application/pdf" :
      extension === "png" ? "image/png" :
      extension === "jpg" || extension === "jpeg" ? "image/jpeg" :
      "application/octet-stream"

    // Retornar el archivo
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error sirviendo comprobante:", error)
    return NextResponse.json(
      { error: "Error al obtener el archivo" },
      { status: 500 }
    )
  }
}

