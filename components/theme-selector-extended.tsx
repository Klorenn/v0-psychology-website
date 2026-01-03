"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Palette, Check, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { 
  pastelThemes, 
  vibrantThemes, 
  earthThemes,
  autumnThemes,
  darkThemes,
  type ColorTheme,
  getThemeById 
} from "@/lib/themes-extended"
import { useSiteConfig } from "@/lib/use-site-config"
import { siteConfigStore } from "@/lib/site-config"
import { authenticatedFetch } from "@/lib/api-client"

export function ThemeSelectorExtended() {
  const { theme: currentTheme, setTheme } = useTheme()
  const config = useSiteConfig()
  const [mounted, setMounted] = useState(false)
  const themeConfig = config.theme || { themeId: "lavender", darkThemeId: "dark-lavender", darkMode: false }
  const [selectedLightThemeId, setSelectedLightThemeId] = useState(themeConfig.themeId || "lavender")
  const [selectedDarkThemeId, setSelectedDarkThemeId] = useState(themeConfig.darkThemeId || "dark-lavender")
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light")

  useEffect(() => {
    setMounted(true)
    const themeConfig = config.theme || { themeId: "lavender", darkThemeId: "dark-lavender", darkMode: false }
    // Aplicar tema del config
    if (themeConfig.darkMode) {
      setTheme("dark")
      setActiveTab("dark")
    } else {
      setTheme("light")
      setActiveTab("light")
    }
    setSelectedLightThemeId(themeConfig.themeId || "lavender")
    setSelectedDarkThemeId(themeConfig.darkThemeId || "dark-lavender")
  }, [config.theme, setTheme])

  useEffect(() => {
    if (!mounted) return
    
    // Aplicar colores del tema seleccionado según el modo actual
    const currentThemeId = themeConfig.darkMode ? selectedDarkThemeId : selectedLightThemeId
    const theme = getThemeById(currentThemeId)
    if (theme) {
      const root = document.documentElement
      root.style.setProperty("--accent", theme.colors.accent)
      root.style.setProperty("--accent-foreground", theme.colors.accentForeground)
      root.style.setProperty("--primary", theme.colors.primary)
      root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
    }
  }, [selectedLightThemeId, selectedDarkThemeId, themeConfig.darkMode, mounted])

  const handleLightThemeChange = (themeId: string) => {
    setSelectedLightThemeId(themeId)
    const currentThemeConfig = config.theme || { themeId: "lavender", darkThemeId: "dark-lavender", darkMode: false }
    const newConfig = {
      ...config,
      theme: {
        ...currentThemeConfig,
        themeId,
      },
    }
    siteConfigStore.set(newConfig)
    
    // Aplicar inmediatamente si estamos en modo claro
    if (!themeConfig.darkMode) {
      const theme = getThemeById(themeId)
      if (theme) {
        const root = document.documentElement
        root.style.setProperty("--accent", theme.colors.accent)
        root.style.setProperty("--accent-foreground", theme.colors.accentForeground)
        root.style.setProperty("--primary", theme.colors.primary)
        root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
      }
    }
    
    // Guardar en el servidor
    authenticatedFetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch(() => {})
  }

  const handleDarkThemeChange = (themeId: string) => {
    setSelectedDarkThemeId(themeId)
    const currentThemeConfig = config.theme || { themeId: "lavender", darkThemeId: "dark-lavender", darkMode: false }
    const newConfig = {
      ...config,
      theme: {
        ...currentThemeConfig,
        darkThemeId: themeId,
      },
    }
    siteConfigStore.set(newConfig)
    
    // Aplicar inmediatamente si estamos en modo oscuro
    if (themeConfig.darkMode) {
      const theme = getThemeById(themeId)
      if (theme) {
        const root = document.documentElement
        root.style.setProperty("--accent", theme.colors.accent)
        root.style.setProperty("--accent-foreground", theme.colors.accentForeground)
        root.style.setProperty("--primary", theme.colors.primary)
        root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
      }
    }
    
    // Guardar en el servidor
    authenticatedFetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch(() => {})
  }

  const handleDarkModeToggle = () => {
    const currentThemeConfig = config.theme || { themeId: "lavender", darkThemeId: "dark-lavender", darkMode: false }
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
    setActiveTab(newDarkMode ? "dark" : "light")
    
    // Aplicar colores del tema correspondiente inmediatamente
    const themeId = newDarkMode ? selectedDarkThemeId : selectedLightThemeId
    const theme = getThemeById(themeId)
    if (theme) {
      const root = document.documentElement
      root.style.setProperty("--accent", theme.colors.accent)
      root.style.setProperty("--accent-foreground", theme.colors.accentForeground)
      root.style.setProperty("--primary", theme.colors.primary)
      root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
    }
    
    // Guardar en el servidor
    authenticatedFetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch(() => {})
  }

  const renderThemeGrid = (themes: ColorTheme[], selectedId: string, onSelect: (id: string) => void) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all hover:scale-105
              ${
                selectedId === theme.id
                  ? "border-accent bg-accent/10 shadow-md ring-2 ring-accent/20"
                  : "border-border/50 bg-muted/30 hover:border-accent/50 hover:bg-muted/50"
              }
            `}
          >
            {selectedId === theme.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
            <div
              className="w-full h-12 rounded-lg mb-2 shadow-sm"
              style={{ backgroundColor: theme.colors.accent }}
            />
            <p className="text-sm font-medium text-foreground">{theme.name}</p>
            <p className="text-xs text-muted-foreground">{theme.description}</p>
          </button>
        ))}
      </div>
    )
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
        <h3 className="font-serif text-xl text-foreground">Personalización de Colores</h3>
      </div>

      {/* Modo Oscuro Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
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
          {themeConfig.darkMode ? "Activado" : "Desactivado"}
        </Button>
      </div>

      {/* Tabs para Modo Claro/Oscuro */}
      <div className="flex gap-2 border-b border-border/50">
        <button
          onClick={() => setActiveTab("light")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "light"
              ? "text-foreground border-accent"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Modo Claro
        </button>
        <button
          onClick={() => setActiveTab("dark")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "dark"
              ? "text-foreground border-accent"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Modo Oscuro
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === "light" ? (
        <div className="space-y-6">
          {/* Temas Pasteles */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-300"></span>
              Colores Pasteles
            </h4>
            {renderThemeGrid(pastelThemes, selectedLightThemeId, handleLightThemeChange)}
          </div>

            {/* Temas Vibrantes */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                Colores Vibrantes
              </h4>
              {renderThemeGrid(vibrantThemes, selectedLightThemeId, handleLightThemeChange)}
            </div>

            {/* Temas Tierra */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                Colores Tierra
              </h4>
              {renderThemeGrid(earthThemes, selectedLightThemeId, handleLightThemeChange)}
            </div>

            {/* Temas Otoñales */}
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Colores Otoñales
              </h4>
              {renderThemeGrid(autumnThemes, selectedLightThemeId, handleLightThemeChange)}
            </div>
          </div>
      ) : (
        <div className="space-y-6">
          {/* Temas Oscuros */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Temas para Modo Oscuro
            </h4>
            {renderThemeGrid(darkThemes, selectedDarkThemeId, handleDarkThemeChange)}
          </div>
        </div>
      )}

      {/* Vista Previa */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-3">Vista Previa</p>
        <div className="flex gap-2">
          <div
            className="flex-1 p-4 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: getThemeById(activeTab === "light" ? selectedLightThemeId : selectedDarkThemeId)?.colors.accent || pastelThemes[0].colors.accent,
              color: getThemeById(activeTab === "light" ? selectedLightThemeId : selectedDarkThemeId)?.colors.accentForeground || pastelThemes[0].colors.accentForeground,
            }}
          >
            Color Accent
          </div>
          <div
            className="flex-1 p-4 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: getThemeById(activeTab === "light" ? selectedLightThemeId : selectedDarkThemeId)?.colors.primary || pastelThemes[0].colors.primary,
              color: getThemeById(activeTab === "light" ? selectedLightThemeId : selectedDarkThemeId)?.colors.primaryForeground || pastelThemes[0].colors.primaryForeground,
            }}
          >
            Color Primary
          </div>
        </div>
      </div>
    </div>
  )
}

