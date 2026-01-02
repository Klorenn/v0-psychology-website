import { type NextRequest, NextResponse } from "next/server"
import { siteConfigStore, type SiteConfig } from "@/lib/site-config"
import { siteConfigPersistence } from "@/lib/site-config-persistence"

// Inicializar configuración al cargar
let initialized = false

async function initializeConfig() {
  if (initialized) return
  
  try {
    const savedConfig = await siteConfigPersistence.load()
    if (savedConfig) {
      siteConfigStore.set(savedConfig)
    }
    initialized = true
  } catch (error) {
    console.error("Error inicializando configuración:", error)
  }
}

export async function GET() {
  try {
    await initializeConfig()
    const config = siteConfigStore.get()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error obteniendo configuración:", error)
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeConfig()
    const body = await request.json()
    const config = body as SiteConfig
    
    // Validar estructura básica con mensajes más específicos
    const missingFields: string[] = []
    if (!config.hero) missingFields.push("hero")
    if (!config.navigation) missingFields.push("navigation")
    if (!config.values) missingFields.push("values")
    if (!config.location) missingFields.push("location")
    if (!config.social) missingFields.push("social")
    if (!config.theme) missingFields.push("theme")
    if (!config.emailTemplate) missingFields.push("emailTemplate")
    
    if (missingFields.length > 0) {
      console.error("Campos faltantes en configuración:", missingFields)
      return NextResponse.json(
        { error: `Configuración inválida. Faltan campos: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }
    
    // Asegurar que emailTemplate tenga valores por defecto si faltan
    if (!config.emailTemplate.subject) {
      config.emailTemplate.subject = "Sesión Confirmada - {{date}}"
    }
    if (!config.emailTemplate.body) {
      config.emailTemplate.body = `Estimado/a {{patientName}},\n\nSu sesión ha sido confirmada para:\n- Fecha: {{date}}\n- Hora: {{time}} hrs\n- Modalidad: {{appointmentType}}\n- Valor: {{price}} CLP\n\nPor favor, asegúrese de haber realizado el pago por transferencia antes de la sesión.\n\nSaludos cordiales,\nMaría`
    }
    
    // Asegurar que el tema tenga valores por defecto si faltan
    if (!config.theme.themeId) {
      config.theme.themeId = "lavender"
    }
    if (!config.theme.darkThemeId) {
      config.theme.darkThemeId = "dark-lavender"
    }
    if (typeof config.theme.darkMode !== "boolean") {
      config.theme.darkMode = false
    }
    
    // Guardar en persistencia
    try {
      await siteConfigPersistence.save(config)
    } catch (persistError) {
      console.error("Error en persistencia:", persistError)
      // Si falla la persistencia, intentar continuar de todas formas
      // para que al menos se actualice el store en memoria
    }
    
    // Actualizar store
    siteConfigStore.set(config)
    
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("Error guardando configuración:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al guardar la configuración"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

