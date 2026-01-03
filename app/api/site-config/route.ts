import { type NextRequest, NextResponse } from "next/server"
import { siteConfigStore, type SiteConfig } from "@/lib/site-config"
import { siteConfigPersistence } from "@/lib/site-config-persistence"
import { requireAuth } from "@/lib/api-auth"

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
    const defaultConfig = siteConfigStore.getDefault()
    
    // Fusionar con valores por defecto para asegurar que siempre tenga los textos correctos
    const mergedConfig: SiteConfig = {
      ...defaultConfig,
      ...config,
      hero: {
        ...defaultConfig.hero,
        ...config.hero,
        // Asegurar valores correctos - usar defaults si están vacíos o son los antiguos
        title: (config.hero?.title && config.hero.title !== "Soy María Jesús Chavez San Luis") 
          ? config.hero.title 
          : defaultConfig.hero.title,
        ctaPrimary: config.hero?.ctaPrimary || defaultConfig.hero.ctaPrimary,
        ctaSecondary: (config.hero?.ctaSecondary && config.hero.ctaSecondary !== "Conozca más")
          ? config.hero.ctaSecondary
          : defaultConfig.hero.ctaSecondary,
        description: config.hero?.description || defaultConfig.hero.description,
        aboutMe: config.hero?.aboutMe || defaultConfig.hero.aboutMe,
      },
      values: {
        ...defaultConfig.values,
        ...config.values,
        title: config.values?.title || defaultConfig.values.title,
        subtitle: config.values?.subtitle || defaultConfig.values.subtitle,
        description: config.values?.description || defaultConfig.values.description,
      },
      location: {
        ...defaultConfig.location,
        ...config.location,
        subtitle: config.location?.subtitle || defaultConfig.location.subtitle,
        title: config.location?.title || defaultConfig.location.title,
      },
    }
    
    return NextResponse.json(mergedConfig)
  } catch (error) {
    console.error("Error obteniendo configuración:", error)
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await requireAuth(request)
  if (!authResult.authenticated) {
    return authResult.response!
  }

  try {
    await initializeConfig()
    const body = await request.json()
    
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido" },
        { status: 400 }
      )
    }
    
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
      config.emailTemplate.subject = "Confirmación de Sesión - {{date}}"
    }
    if (!config.emailTemplate.body) {
      config.emailTemplate.body = [
        "Hola {{patientName}},",
        "",
        "Espero que estés teniendo un lindo día.",
        "Quería escribirte para confirmarte con cariño los detalles de tu próxima sesión:",
        "",
        "🗓 **{{date}}**",
        "⏰ **{{time}} hrs**",
        "📍 **Modalidad:** {{appointmentType}}",
        "💰 **Valor:** ${{price}} CLP",
        "{{#if meetLink}}",
        "🔗 **Enlace de Google Meet:** {{meetLink}}",
        "{{/if}}",
        "",
        "Para cuidar tu espacio y dejar la hora reservada, te agradeceré realizar el pago por **transferencia bancaria antes de la sesión**.",
        "",
        "Si necesitas decirme algo antes de venir, tienes alguna inquietud o te surge la necesidad de reprogramar, puedes escribirme con total confianza. Estoy aquí para acompañarte 🌿",
        "",
        "Un abrazo grande,",
        "**María Jesús Chávez**",
        "Psicóloga Clínica"
      ].join("\n")
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
    
    // Asegurar que navigation.order tenga valores por defecto si faltan
    if (!config.navigation.order || !Array.isArray(config.navigation.order)) {
      config.navigation.order = [
        "menu-items",
        "separator",
        "social-icons",
        "booking-button",
        "theme-toggle",
      ]
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

