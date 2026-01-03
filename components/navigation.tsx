"use client"

import { useState, useEffect } from "react"
import { Menu, X, Instagram, Linkedin, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSiteConfig } from "@/lib/use-site-config"
import { siteConfigStore } from "@/lib/site-config"
import { useTheme } from "next-themes"

interface NavigationProps {
  isStatic?: boolean
}

export function Navigation({ isStatic = false }: NavigationProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const config = useSiteConfig()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Sincronizar con la configuración del sitio
    if (config.theme?.darkMode) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }, [config.theme?.darkMode, setTheme])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsMobileMenuOpen(false)
  }

  const toggleDarkMode = () => {
    const currentThemeConfig = config.theme || {
      themeId: "lavender",
      darkThemeId: "dark-lavender",
      darkMode: false,
    }
    const newDarkMode = !currentThemeConfig.darkMode
    const newConfig = {
      ...config,
      theme: {
        ...currentThemeConfig,
        darkMode: newDarkMode,
      },
    }
    
    // Actualizar store
    siteConfigStore.set(newConfig)
    
    // Actualizar tema localmente
    setTheme(newDarkMode ? "dark" : "light")
    
    // Guardar en el servidor
    fetch("/api/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch(() => {})
  }

  return (
    <nav
      className={`${isStatic ? "relative" : "fixed top-0 left-0 right-0"} z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="font-serif text-xl text-foreground hover:text-accent transition-colors flex items-center gap-2"
          >
            {config.navigation.logo && (
              <img src={config.navigation.logo} alt="Logo" className="h-8 object-contain" />
            )}
            <span>{config.navigation.logoText}</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollTo("sobre-mi")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Sobre mí
            </button>
            <button
              onClick={() => scrollTo("valores")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Valores
            </button>
            <button
              onClick={() => scrollTo("ubicacion")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Ubicación
            </button>
            
            <div className="h-4 w-px bg-border/50 mx-2" />
            
            {/* Dark Mode Toggle */}
            {mounted && (
              <ThemeToggle 
                className="shrink-0"
              />
            )}
            
            <div className="flex items-center gap-3">
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-accent/10 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </a>
              <a
                href={config.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-accent/10 transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </a>
              <a
                href={`mailto:${config.social.email}`}
                className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-accent/10 transition-colors group"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </a>
            </div>
            
            <Button
              onClick={() => scrollTo("agenda")}
              className="text-sm bg-accent text-accent-foreground px-5 py-2 rounded-full hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Agendar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollTo("sobre-mi")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-2 hover:bg-muted/50 rounded-lg font-medium"
              >
                Sobre mí
              </button>
              <button
                onClick={() => scrollTo("valores")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-2 hover:bg-muted/50 rounded-lg font-medium"
              >
                Valores
              </button>
              <button
                onClick={() => scrollTo("ubicacion")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-2 hover:bg-muted/50 rounded-lg font-medium"
              >
                Ubicación
              </button>
              
                      <div className="border-t border-border/50 my-2" />

                      {/* Dark Mode Toggle Mobile */}
                      {mounted && (
                        <div className="px-2 py-2">
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-sm text-muted-foreground">Modo Oscuro</span>
                            <ThemeToggle />
                          </div>
                        </div>
                      )}

                      <div className="border-t border-border/50 my-2" />

                      <div className="flex items-center gap-3 px-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sígueme</span>
                <a
                  href={config.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center hover:bg-accent/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </a>
                <a
                  href={config.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center hover:bg-accent/10 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </a>
                <a
                  href={`mailto:${config.social.email}`}
                  className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center hover:bg-accent/10 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </a>
              </div>
              
              <div className="px-2 pt-2">
                <Button
                  onClick={() => scrollTo("agenda")}
                  className="w-full bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar cita
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
