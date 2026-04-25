export interface SiteConfig {
  // Hero Section
  hero: {
    subtitle: string
    title: string
    description: string
    profileImage: string
    imagePosition: string // CSS object-position value (e.g., "center 25%", "center top", "50% 30%")
    ctaPrimary: string
    ctaSecondary: string
    aboutMe?: string // Información sobre María para el modal "Conozca más"
  }
  
  // Navigation
  navigation: {
    logo: string
    logoText: string
    order?: string[] // Orden de elementos: ["menu-items", "separator", "booking-button", "social-icons", "theme-toggle"]
  }
  
  // Values Section
  values: {
    subtitle: string
    title: string
    description: string
    items: Array<{
      icon: string
      title: string
      description: string
    }>
  }
  
  // Location Section
  location: {
    subtitle: string
    title: string
    address: string
    city: string
    country: string
    schedule: {
      days: string
      hours: string
    }
    mapEmbedUrl: string
  }
  
  // Social Media
  social: {
    instagram: string
    linkedin: string
    email: string
  }
  
  // Section Order
  sectionOrder: string[] // ["hero", "values", "location", "booking"]
  
  // Theme
  theme: {
    themeId: string // ID del tema para modo claro (lavender, sage, peach, etc.)
    darkThemeId: string // ID del tema para modo oscuro (dark-lavender, dark-ocean, etc.)
    darkMode: boolean // Modo oscuro activado
  }

  // Email Template
  emailTemplate: {
    subject: string // Asunto del email cuando se confirma una cita
    body: string // Cuerpo del email (puede incluir variables como {{patientName}}, {{date}}, {{time}}, {{meetLink}})
  }

  // Cursos y Diplomados
  courses?: {
    enabled: boolean
    items: Array<{
      id: string
      title: string
      institution?: string
      year?: string
      description?: string
      certificateUrl?: string
    }>
  }

  // Recomendaciones de Lecturas
  readingRecommendations?: {
    enabled: boolean
    items: Array<{
      id: string
      title: string
      author?: string
      description?: string
      coverImage?: string
      link?: string
    }>
  }

  // Imágenes Adicionales
  additionalImages?: {
    enabled: boolean
    images: Array<{
      id: string
      url: string
      alt: string
      caption?: string
    }>
  }
}

const defaultConfig: SiteConfig = {
  hero: {
    subtitle: "Psicóloga Clínica",
    title: "María San Luis",
    description: "Acompaño procesos de transformación desde una mirada profesional, cálida y actualizada. Un espacio para sanar, integrar tus fortalezas y alcanzar el equilibrio emocional necesario para vivir una vida plena y alineada con lo que realmente valoras.",
    profileImage: "/images/whatsapp-20image-202026-01-01-20at-2019.jpeg",
    imagePosition: "center 25%",
    ctaPrimary: "Agendar Sesión",
    ctaSecondary: "Sobre mí",
    aboutMe: "Soy María San Luis, psicóloga clínica. Mi trabajo se centra en acompañar procesos emocionales desde una mirada respetuosa, cercana y profesional, considerando la historia y el ritmo de cada persona.",
  },
  navigation: {
    logo: "",
    logoText: "María San Luis",
    order: ["menu-items", "separator", "booking-button", "social-icons", "theme-toggle"],
  },
  values: {
    subtitle: "Enfoque terapéutico",
    title: "Mi enfoque terapéutico",
    description: "Cada proceso terapéutico se basa en principios que priorizan el bienestar emocional, la singularidad y la confidencialidad.",
    items: [
      {
        icon: "Heart",
        title: "Empatía",
        description: "Escucha activa y comprensión genuina de su experiencia única.",
      },
      {
        icon: "Shield",
        title: "Confianza",
        description: "Un vínculo seguro donde usted puede ser completamente usted mismo.",
      },
      {
        icon: "Star",
        title: "Acompañamiento",
        description: "Caminaremos juntos en cada paso de su proceso de sanación.",
      },
      {
        icon: "Zap",
        title: "Confidencialidad",
        description: "Absoluta privacidad y respeto por su historia personal.",
      },
    ],
  },
  location: {
    subtitle: "Consulta presencial",
    title: "Consulta presencial",
    address: "Temuco",
    city: "Temuco",
    country: "Chile",
    schedule: {
      days: "Lunes a Viernes",
      hours: "9:00 a 18:00 hrs",
    },
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2990.123456789!2d-72.5902778!3d-38.7358333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9614e3b2b3b3b3b3%3A0x1234567890abcdef!2sTemuco%2C%20Araucan%C3%ADa%2C%20Chile!5e0!3m2!1ses!2scl!4v1704067200000!5m2!1ses!2scl",
  },
  social: {
    instagram: "https://www.instagram.com/ps.mariasanluis/",
    linkedin: "https://www.linkedin.com/in/maria-san-luis-03481b337/",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  },
  sectionOrder: ["hero", "values", "location", "booking", "reviews"],
  theme: {
    themeId: "lavender",
    darkThemeId: "dark-lavender",
    darkMode: false,
  },
  emailTemplate: {
    subject: "Confirmación de Consulta - {{date}}",
    body: [
      "Estimado/a {{patientName}},",
      "",
      "Le confirmo los detalles de su consulta programada:",
      "",
      "🗓 **Fecha:** {{date}}",
      "⏰ **Hora:** {{time}} hrs",
      "📍 **Modalidad:** {{appointmentType}}",
      "💰 **Valor:** $" + "{{price}} CLP",
      "{{#if meetLink}}",
      "🔗 **Enlace de Google Meet:** {{meetLink}}",
      "{{/if}}",
      "",
      "Para confirmar su reserva, le solicito realizar el pago mediante **transferencia bancaria antes de la fecha de la consulta**.",
      "",
      "Si tiene alguna consulta, necesita modificar la fecha u hora, o requiere información adicional, puede contactarme con confianza.",
      "",
      "Saludos cordiales,",
      "**María San Luis**",
      "Psicóloga Clínica"
    ].join("\n"),
  },
  courses: {
    enabled: false,
    items: [],
  },
  readingRecommendations: {
    enabled: false,
    items: [],
  },
  additionalImages: {
    enabled: false,
    images: [],
  },
}

let currentConfig: SiteConfig = defaultConfig
let listeners: Set<() => void> = new Set()

export const siteConfigStore = {
  get: (): SiteConfig => {
    return currentConfig
  },
  
  set: (config: SiteConfig) => {
    currentConfig = config
    listeners.forEach((listener) => listener())
  },
  
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  
  getDefault: (): SiteConfig => {
    return defaultConfig
  },
}

