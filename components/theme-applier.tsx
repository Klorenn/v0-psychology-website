"use client"

import { useEffect, useLayoutEffect } from "react"
import { useTheme } from "next-themes"
import { useSiteConfig } from "@/lib/use-site-config"
import { getThemeById } from "@/lib/themes-extended"

// Use useLayoutEffect on client, useEffect on server (SSR safety)
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export function ThemeApplier() {
  const { setTheme } = useTheme()
  const config = useSiteConfig()

  // Apply theme colors synchronously before paint
  useIsomorphicLayoutEffect(() => {
    // Asegurar que el tema tenga valores por defecto
    const themeConfig = config.theme || {
      themeId: "lavender",
      darkThemeId: "dark-lavender",
      darkMode: false,
    }

    // Aplicar modo oscuro
    if (themeConfig.darkMode) {
      setTheme("dark")
    } else {
      setTheme("light")
    }

    // Aplicar colores del tema según el modo actual
    const currentThemeId = themeConfig.darkMode 
      ? (themeConfig.darkThemeId || "dark-lavender")
      : (themeConfig.themeId || "lavender")
    
    const theme = getThemeById(currentThemeId)
    if (theme) {
      const root = document.documentElement
      root.style.setProperty("--accent", theme.colors.accent)
      root.style.setProperty("--accent-foreground", theme.colors.accentForeground)
      root.style.setProperty("--primary", theme.colors.primary)
      root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
    }
  }, [config.theme, setTheme])

  return null
}

