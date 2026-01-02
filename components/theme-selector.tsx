"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Palette, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { themes, type Theme, getThemeById } from "@/lib/themes"
import { useSiteConfig } from "@/lib/use-site-config"
import { siteConfigStore } from "@/lib/site-config"

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useTheme()
  const config = useSiteConfig()
  const [mounted, setMounted] = useState(false)
  const themeConfig = config.theme || { themeId: "lavender", darkMode: false }
  const [selectedThemeId, setSelectedThemeId] = useState(themeConfig.themeId || "lavender")

  useEffect(() => {
    setMounted(true)
    const themeConfig = config.theme || { themeId: "lavender", darkMode: false }
    // Aplicar tema del config
    if (themeConfig.darkMode) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
    setSelectedThemeId(themeConfig.themeId || "lavender")
  }, [config.theme, setTheme])

  useEffect(() => {
    if (!mounted) return
    
    // Aplicar colores del tema seleccionado
    const theme = getThemeById(selectedThemeId)
    if (theme) {
      const root = document.documentElement
      root.style.setProperty("--accent", theme.colors.accent)
      root.style.setProperty("--accent-foreground", theme.colors.accentForeground)
      root.style.setProperty("--primary", theme.colors.primary)
      root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
    }
  }, [selectedThemeId, mounted])

  const handleThemeChange = (themeId: string) => {
    setSelectedThemeId(themeId)
    const currentThemeConfig = config.theme || { themeId: "lavender", darkMode: false }
    const newConfig = {
      ...config,
      theme: {
        ...currentThemeConfig,
        themeId,
      },
    }
    siteConfigStore.set(newConfig)
    
    // Guardar en el servidor
    fetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch(() => {})
  }

  const handleDarkModeToggle = () => {
    const currentThemeConfig = config.theme || { themeId: "lavender", darkMode: false }
    const newDarkMode = !currentThemeConfig.darkMode
    const newConfig = {
      ...config,
      theme: {
        ...currentThemeConfig,
        darkMode: newDarkMode,
      },
    }
    siteConfigStore.set(newConfig)
    setTheme(newDarkMode ? "dark" : "light")
    
    // Guardar en el servidor
    fetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch(() => {})
  }

  if (!mounted) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-accent" />
        <h3 className="font-serif text-xl text-foreground">Tema y Colores</h3>
      </div>

      {/* Modo Oscuro */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Modo Oscuro</p>
            <p className="text-sm text-muted-foreground">Activar tema oscuro para toda la website</p>
          </div>
          <Button
            onClick={handleDarkModeToggle}
            variant={themeConfig.darkMode ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            {themeConfig.darkMode ? (
              <>
                <Moon className="w-4 h-4" />
                Activado
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                Desactivado
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Selector de Colores */}
      <div className="space-y-3">
        <div>
          <p className="font-medium text-foreground mb-2">Colores Pasteles</p>
          <p className="text-sm text-muted-foreground mb-4">
            Seleccione un esquema de colores para personalizar la apariencia
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${
                  selectedThemeId === theme.id
                    ? "border-accent bg-accent/10 shadow-md"
                    : "border-border/50 bg-muted/30 hover:border-accent/50 hover:bg-muted/50"
                }
              `}
            >
              {selectedThemeId === theme.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent-foreground" />
                </div>
              )}
              <div
                className="w-full h-12 rounded-lg mb-2"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <p className="text-sm font-medium text-foreground">{theme.name}</p>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Vista Previa */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-3">Vista Previa</p>
        <div className="flex gap-2">
          <div
            className="flex-1 p-4 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: getThemeById(selectedThemeId)?.colors.accent || themes[0].colors.accent,
              color: getThemeById(selectedThemeId)?.colors.accentForeground || themes[0].colors.accentForeground,
            }}
          >
            Color Accent
          </div>
          <div
            className="flex-1 p-4 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: getThemeById(selectedThemeId)?.colors.primary || themes[0].colors.primary,
              color: getThemeById(selectedThemeId)?.colors.primaryForeground || themes[0].colors.primaryForeground,
            }}
          >
            Color Primary
          </div>
        </div>
      </div>
    </div>
  )
}

