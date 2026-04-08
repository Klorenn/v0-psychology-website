"use client"

import { useState, useEffect } from "react"
import { Menu, X, Instagram, Linkedin, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSiteConfig } from "@/lib/use-site-config"
import { siteConfigStore } from "@/lib/site-config"

interface NavigationProps {
  isStatic?: boolean
}

export function Navigation({ isStatic = false }: NavigationProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const config = useSiteConfig()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Función de scroll suave personalizada con easing
  const smoothScrollTo = (targetY: number, duration: number = 1200) => {
    const startY = window.scrollY
    const distance = targetY - startY
    let startTime: number | null = null

    // Función de easing suave (ease-in-out-cubic)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      
      const ease = easeInOutCubic(progress)
      window.scrollTo(0, startY + distance * ease)

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offset = -80 // Offset para la navegación fija
      smoothScrollTo(elementPosition + offset, 1200)
    }
    setIsMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    smoothScrollTo(0, 1000)
    setIsMobileMenuOpen(false)
  }


  // Obtener el orden de navegación desde la configuración
  const navigationOrder = config.navigation?.order || [
    "menu-items",
    "separator",
    "booking-button",
    "social-icons",
    "theme-toggle",
  ]

  // Renderizar elementos según el orden configurado
  const renderNavigationElements = () => {
    return navigationOrder.map((itemId) => {
      switch (itemId) {
        case "menu-items":
          return (
            <div key="menu-items" className="flex items-center gap-4">
              <button
                onClick={scrollToTop}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium whitespace-nowrap"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollTo("sobre-mi")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium whitespace-nowrap"
              >
                Sobre mí
              </button>
              <button
                onClick={() => scrollTo("valores")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium whitespace-nowrap"
              >
                Mi enfoque
              </button>
              <button
                onClick={() => scrollTo("ubicacion")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium whitespace-nowrap"
              >
                Consulta presencial
              </button>
              <button
                onClick={() => scrollTo("reseñas")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium whitespace-nowrap"
              >
                Testimonios
              </button>
            </div>
          )
        case "separator":
          return (
            <div key="separator" className="h-4 w-px bg-border/50 mx-1" />
          )
        case "social-icons":
          return (
            <div key="social-icons" className="flex items-center gap-2">
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
          )
        case "booking-button":
          return (
            <Button
              key="booking-button"
              onClick={() => scrollTo("agenda")}
              className="text-sm bg-accent text-accent-foreground px-5 py-2 rounded-full hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Agendar sesión
            </Button>
          )
        case "theme-toggle":
          return mounted ? (
            <ThemeToggle key="theme-toggle" className="shrink-0" />
          ) : null
        default:
          return null
      }
    }).filter(Boolean)
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
          <div className="hidden md:flex items-center gap-4">
            {renderNavigationElements()}
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
                onClick={scrollToTop}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-2 hover:bg-muted/50 rounded-lg font-medium"
              >
                Inicio
              </button>
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
                Mi enfoque
              </button>
              <button
                onClick={() => scrollTo("ubicacion")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-2 hover:bg-muted/50 rounded-lg font-medium"
              >
                Consulta presencial
              </button>
              <button
                onClick={() => scrollTo("reseñas")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-2 hover:bg-muted/50 rounded-lg font-medium"
              >
                Testimonios
              </button>
              
                      <div className="border-t border-border/50 my-2" />

              <div className="px-2 pt-2">
                <Button
                  onClick={() => scrollTo("agenda")}
                  className="w-full bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar sesión
                </Button>
              </div>

                      <div className="border-t border-border/50 my-2" />

                      <div className="flex items-center justify-between gap-3 px-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sígueme</span>
                <div className="flex items-center gap-2">
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
              </div>

                      <div className="border-t border-border/50 my-2" />

                      {mounted && (
                        <div className="px-2 py-2 flex justify-end">
                          <div className="flex items-center gap-3 px-3 py-2">
                            <span className="text-sm text-muted-foreground">Modo oscuro</span>
                            <ThemeToggle />
                          </div>
                        </div>
                      )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
