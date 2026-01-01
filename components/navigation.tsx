"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="font-serif text-xl text-foreground">
            Psicología
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollTo("sobre-mi")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre mí
            </button>
            <button
              onClick={() => scrollTo("valores")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Valores
            </button>
            <button
              onClick={() => scrollTo("ubicacion")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ubicación
            </button>
            <button
              onClick={() => scrollTo("agenda")}
              className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              Agendar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
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
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2"
              >
                Sobre mí
              </button>
              <button
                onClick={() => scrollTo("valores")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2"
              >
                Valores
              </button>
              <button
                onClick={() => scrollTo("ubicacion")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-2"
              >
                Ubicación
              </button>
              <button
                onClick={() => scrollTo("agenda")}
                className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition-colors w-fit"
              >
                Agendar
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
