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
  }
  
  // Navigation
  navigation: {
    logo: string
    logoText: string
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
}

const defaultConfig: SiteConfig = {
  hero: {
    subtitle: "Psicóloga Clínica",
    title: "Soy María Jesús Chavez San Luis",
    description: "Le acompaño en su proceso de crecimiento personal con calidez, respeto y profesionalismo. Juntos encontraremos el camino hacia una vida más plena.",
    profileImage: "/images/whatsapp-20image-202026-01-01-20at-2019.jpeg",
    imagePosition: "center 25%",
    ctaPrimary: "Agende su primera sesión",
    ctaSecondary: "Conozca más",
  },
  navigation: {
    logo: "",
    logoText: "María San Luis",
  },
  values: {
    subtitle: "Mi enfoque",
    title: "Valores que guían mi práctica",
    description: "Cada sesión está fundamentada en principios que priorizan su bienestar integral",
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
        icon: "Users",
        title: "Acompañamiento",
        description: "Caminaremos juntos en cada paso de su proceso de sanación.",
      },
      {
        icon: "Lock",
        title: "Confidencialidad",
        description: "Absoluta privacidad y respeto por su historia personal.",
      },
    ],
  },
  location: {
    subtitle: "Encuéntrame",
    title: "Ubicación de la consulta",
    address: "Temuco",
    city: "Temuco",
    country: "Chile",
    schedule: {
      days: "Lunes a Viernes",
      hours: "9:00 - 18:00 hrs",
    },
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2990.123456789!2d-72.5902778!3d-38.7358333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9614e3b2b3b3b3b3%3A0x1234567890abcdef!2sTemuco%2C%20Araucan%C3%ADa%2C%20Chile!5e0!3m2!1ses!2scl!4v1704067200000!5m2!1ses!2scl",
  },
  social: {
    instagram: "https://www.instagram.com/ps.msanluis/",
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
    subject: "Confirmación de Sesión - {{date}}",
    body: [
      "Hola {{patientName}},",
      "",
      "Espero que estés teniendo un lindo día.",
      "Quería escribirte para confirmarte con cariño los detalles de tu próxima sesión:",
      "",
      "🗓 **{{date}}**",
      "⏰ **{{time}} hrs**",
      "📍 **Modalidad:** {{appointmentType}}",
      "💰 **Valor:** $" + "{{price}} CLP",
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
    ].join("\n"),
  },
}

let currentConfig: SiteConfig = defaultConfig
let listeners: Set<() => void> = new Set()

export const siteConfigStore = {
  get(): SiteConfig {
    return currentConfig
  },
  
  set(config: SiteConfig) {
    currentConfig = config
    listeners.forEach((listener) => listener())
  },
  
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  
  getDefault(): SiteConfig {
    return defaultConfig
  },
}

