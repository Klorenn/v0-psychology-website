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
    
    // Validar estructura básica
    if (!config.hero || !config.navigation || !config.values || !config.location || !config.social || !config.theme || !config.emailTemplate) {
      return NextResponse.json(
        { error: "Configuración inválida" },
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
    await siteConfigPersistence.save(config)
    
    // Actualizar store
    siteConfigStore.set(config)
    
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("Error guardando configuración:", error)
    return NextResponse.json(
      { error: "Error al guardar la configuración" },
      { status: 500 }
    )
  }
}

