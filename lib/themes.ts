export interface Theme {
  id: string
  name: string
  colors: {
    accent: string
    accentForeground: string
    primary: string
    primaryForeground: string
  }
  description: string
}

export const themes: Theme[] = [
  {
    id: "lavender",
    name: "Lavanda",
    description: "Tranquilo y relajante",
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
    colors: {
      accent: "oklch(0.72 0.12 300)",
      accentForeground: "oklch(0.98 0.005 85)",
      primary: "oklch(0.67 0.1 300)",
      primaryForeground: "oklch(0.98 0.005 85)",
    },
  },
]

export const defaultTheme = themes[0]

export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id)
}

