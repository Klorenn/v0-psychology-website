export interface ColorTheme {
  id: string
  name: string
  description: string
  colors: {
    accent: string
    accentForeground: string
    primary: string
    primaryForeground: string
  }
  category: "pastel" | "vibrant" | "earth" | "cool" | "warm" | "neutral"
}

// Temas Pasteles (para modo claro)
export const pastelThemes: ColorTheme[] = [
  {
    id: "lavender",
    name: "Lavanda",
    description: "Tranquilo y relajante",
    category: "pastel",
    colors: {
      accent: "oklch(0.7 0.12 280)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.65 0.1 280)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "sage",
    name: "Salvia",
    description: "Fresco y natural",
    category: "pastel",
    colors: {
      accent: "oklch(0.68 0.08 150)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.6 0.06 150)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "peach",
    name: "Durazno",
    description: "Cálido y acogedor",
    category: "pastel",
    colors: {
      accent: "oklch(0.75 0.1 45)",
      accentForeground: "oklch(0.25 0.02 50)",
      primary: "oklch(0.7 0.08 45)",
      primaryForeground: "oklch(0.25 0.02 50)",
    },
  },
  {
    id: "sky",
    name: "Cielo",
    description: "Sereno y claro",
    category: "pastel",
    colors: {
      accent: "oklch(0.72 0.1 220)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.65 0.08 220)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "rose",
    name: "Rosa",
    description: "Suave y delicado",
    category: "pastel",
    colors: {
      accent: "oklch(0.73 0.1 15)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.68 0.08 15)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "mint",
    name: "Menta",
    description: "Refrescante y energizante",
    category: "pastel",
    colors: {
      accent: "oklch(0.75 0.1 170)",
      accentForeground: "oklch(0.25 0.02 50)",
      primary: "oklch(0.7 0.08 170)",
      primaryForeground: "oklch(0.25 0.02 50)",
    },
  },
  {
    id: "cream",
    name: "Crema",
    description: "Elegante y neutro",
    category: "pastel",
    colors: {
      accent: "oklch(0.85 0.05 85)",
      accentForeground: "oklch(0.25 0.02 50)",
      primary: "oklch(0.8 0.04 85)",
      primaryForeground: "oklch(0.25 0.02 50)",
    },
  },
  {
    id: "lilac",
    name: "Lila",
    description: "Dulce y armonioso",
    category: "pastel",
    colors: {
      accent: "oklch(0.72 0.12 300)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.67 0.1 300)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
]

// Temas Vibrantes (para modo claro)
export const vibrantThemes: ColorTheme[] = [
  {
    id: "coral",
    name: "Coral",
    description: "Energético y cálido",
    category: "vibrant",
    colors: {
      accent: "oklch(0.65 0.15 25)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.6 0.12 25)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "ocean",
    name: "Océano",
    description: "Profundo y sereno",
    category: "vibrant",
    colors: {
      accent: "oklch(0.55 0.15 240)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.5 0.12 240)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "emerald",
    name: "Esmeralda",
    description: "Fresco y natural",
    category: "vibrant",
    colors: {
      accent: "oklch(0.6 0.15 160)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.55 0.12 160)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "amber",
    name: "Ámbar",
    description: "Cálido y dorado",
    category: "vibrant",
    colors: {
      accent: "oklch(0.7 0.15 70)",
      accentForeground: "oklch(0.25 0.02 50)",
      primary: "oklch(0.65 0.12 70)",
      primaryForeground: "oklch(0.25 0.02 50)",
    },
  },
]

// Temas Tierra (para modo claro)
export const earthThemes: ColorTheme[] = [
  {
    id: "terracotta",
    name: "Terracota",
    description: "Tierra y cálido",
    category: "earth",
    colors: {
      accent: "oklch(0.6 0.1 40)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.55 0.08 40)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "forest",
    name: "Bosque",
    description: "Natural y profundo",
    category: "earth",
    colors: {
      accent: "oklch(0.5 0.1 140)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.45 0.08 140)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
]

// Temas Otoñales (para modo claro)
export const autumnThemes: ColorTheme[] = [
  {
    id: "autumn",
    name: "Otoño",
    description: "Cálido y acogedor",
    category: "warm",
    colors: {
      accent: "oklch(0.65 0.12 50)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.6 0.1 50)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "maple",
    name: "Arce",
    description: "Rojo otoñal",
    category: "warm",
    colors: {
      accent: "oklch(0.58 0.15 25)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.53 0.12 25)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
  {
    id: "pumpkin",
    name: "Calabaza",
    description: "Naranja otoñal",
    category: "warm",
    colors: {
      accent: "oklch(0.7 0.15 60)",
      accentForeground: "oklch(0.25 0.02 50)",
      primary: "oklch(0.65 0.12 60)",
      primaryForeground: "oklch(0.25 0.02 50)",
    },
  },
  {
    id: "amber-fall",
    name: "Ámbar Otoñal",
    description: "Dorado y cálido",
    category: "warm",
    colors: {
      accent: "oklch(0.68 0.14 75)",
      accentForeground: "oklch(0.25 0.02 50)",
      primary: "oklch(0.63 0.12 75)",
      primaryForeground: "oklch(0.25 0.02 50)",
    },
  },
  {
    id: "rust",
    name: "Óxido",
    description: "Tierra quemada",
    category: "earth",
    colors: {
      accent: "oklch(0.55 0.12 35)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.5 0.1 35)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
]

// Temas para Modo Oscuro
export const darkThemes: ColorTheme[] = [
  {
    id: "dark-lavender",
    name: "Lavanda Oscuro",
    description: "Tranquilo y elegante",
    category: "pastel",
    colors: {
      accent: "oklch(0.65 0.15 280)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.7 0.12 280)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-sage",
    name: "Salvia Oscuro",
    description: "Fresco y sereno",
    category: "pastel",
    colors: {
      accent: "oklch(0.6 0.12 150)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.65 0.1 150)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-ocean",
    name: "Océano Oscuro",
    description: "Profundo y calmante",
    category: "cool",
    colors: {
      accent: "oklch(0.55 0.18 240)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.6 0.15 240)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-emerald",
    name: "Esmeralda Oscuro",
    description: "Vibrante y moderno",
    category: "cool",
    colors: {
      accent: "oklch(0.58 0.18 160)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.63 0.15 160)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-amber",
    name: "Ámbar Oscuro",
    description: "Cálido y acogedor",
    category: "warm",
    colors: {
      accent: "oklch(0.65 0.18 70)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.7 0.15 70)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-rose",
    name: "Rosa Oscuro",
    description: "Suave y elegante",
    category: "warm",
    colors: {
      accent: "oklch(0.65 0.15 15)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.7 0.12 15)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-mint",
    name: "Menta Oscuro",
    description: "Refrescante y moderno",
    category: "cool",
    colors: {
      accent: "oklch(0.6 0.15 170)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.65 0.12 170)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-neutral",
    name: "Neutro Oscuro",
    description: "Elegante y minimalista",
    category: "neutral",
    colors: {
      accent: "oklch(0.65 0.05 85)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.7 0.04 85)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-autumn",
    name: "Otoño Oscuro",
    description: "Cálido y acogedor",
    category: "warm",
    colors: {
      accent: "oklch(0.62 0.15 50)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.67 0.12 50)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-maple",
    name: "Arce Oscuro",
    description: "Rojo profundo",
    category: "warm",
    colors: {
      accent: "oklch(0.55 0.18 25)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.6 0.15 25)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
  {
    id: "dark-pumpkin",
    name: "Calabaza Oscuro",
    description: "Naranja cálido",
    category: "warm",
    colors: {
      accent: "oklch(0.65 0.18 60)",
      accentForeground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.7 0.15 60)",
      primaryForeground: "oklch(0.15 0.02 50)",
    },
  },
]

export const allThemes = [...pastelThemes, ...vibrantThemes, ...earthThemes, ...autumnThemes, ...darkThemes]

export function getThemeById(id: string): ColorTheme | undefined {
  return allThemes.find((theme) => theme.id === id)
}

export function getThemesByCategory(category: string): ColorTheme[] {
  return allThemes.filter((theme) => theme.category === category)
}

