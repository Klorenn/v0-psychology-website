import { type NextRequest, NextResponse } from "next/server"
import { appointmentsStore } from "@/lib/appointments-store"

export async function GET(request: NextRequest, { params }: { params: { appointmentId: string } }) {
  try {
    const appointmentId = params.appointmentId

    if (!appointmentId) {
      return NextResponse.json({ error: "ID de cita requerido" }, { status: 400 })
    }

    // Inicializar el store y buscar la cita
    await appointmentsStore.init()
    const appointments = appointmentsStore.getAll()
    const appointment = appointments.find((a) => a.id === appointmentId)

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    // Verificar que tenga comprobante
    if (!appointment.receiptData || !appointment.receiptFilename || !appointment.receiptMimetype) {
      return NextResponse.json({ error: "Comprobante no encontrado" }, { status: 404 })
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(appointment.receiptData, 'base64')

    // Retornar el archivo
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": appointment.receiptMimetype,
        "Content-Disposition": `inline; filename="${appointment.receiptFilename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error sirviendo comprobante:", error)
    return NextResponse.json(
      { error: "Error al obtener el comprobante" },
      { status: 500 }
    )
  }
}

