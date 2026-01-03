"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSiteConfig } from "@/lib/use-site-config"
import { GraduationCap, BookOpen, ExternalLink } from "lucide-react"

// Función de scroll suave reutilizable
const smoothScrollTo = (id: string, duration: number = 1200) => {
  const element = document.getElementById(id)
  if (!element) return
  
  const elementPosition = element.getBoundingClientRect().top + window.scrollY
  const offset = -80 // Offset para la navegación fija
  const targetY = elementPosition + offset
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

export function HeroSection() {
  const config = useSiteConfig()
  const [showAboutMe, setShowAboutMe] = useState(false)

  return (
    <section id="sobre-mi" className="relative min-h-[90vh] flex items-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-muted/50 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 w-full">
            <p className="text-sm uppercase tracking-widest text-accent mb-4 text-left">{config.hero.subtitle}</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground text-left mb-6">
              {config.hero.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed text-left mb-8">
              {config.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <InteractiveHoverButton
                text={config.hero.ctaPrimary}
                className="min-w-[200px]"
                onClick={() => smoothScrollTo("agenda")}
              />
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-medium rounded-full border-border hover:bg-muted transition-all bg-transparent"
                onClick={() => setShowAboutMe(true)}
              >
                {config.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-muted/30 border border-border/50 overflow-hidden">
                <img
                  src={config.hero.profileImage}
                  alt={config.hero.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: config.hero.imagePosition || "center 25%" }}
                />
              </div>
              <div className="absolute inset-0 -m-3 rounded-full border border-accent/20" />
              <div className="absolute inset-0 -m-6 rounded-full border border-accent/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal "Conozca más" */}
      <Dialog open={showAboutMe} onOpenChange={setShowAboutMe}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-foreground mb-2">
              Sobre mí
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {config.hero.subtitle}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-full bg-muted/30 border border-border/50 overflow-hidden flex-shrink-0">
                <img
                  src={config.hero.profileImage}
                  alt={config.hero.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: config.hero.imagePosition || "center 25%" }}
                />
              </div>
              <div className="flex-1">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {config.hero.aboutMe || config.hero.description}
                </p>
              </div>
            </div>

            {/* Cursos y Diplomados */}
            {config.courses?.items && config.courses.items.length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-accent" />
                  Cursos y Diplomados
                </h3>
                <div className="space-y-3">
                  {config.courses.items.map((course) => (
                    <div key={course.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{course.title}</h4>
                          {(course.institution || course.year) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.institution && <span>{course.institution}</span>}
                              {course.institution && course.year && <span> • </span>}
                              {course.year && <span>{course.year}</span>}
                            </p>
                          )}
                          {course.description && (
                            <p className="text-sm text-foreground mt-2">{course.description}</p>
                          )}
                        </div>
                        {course.certificateUrl && (
                          <a
                            href={course.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent/80 transition-colors flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones de Lecturas */}
            {config.readingRecommendations?.items && config.readingRecommendations.items.length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Recomendaciones de Lecturas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.readingRecommendations.items.map((reading) => (
                    <div key={reading.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex gap-3">
                        {reading.coverImage && (
                          <img
                            src={reading.coverImage}
                            alt={reading.title}
                            className="w-16 h-24 object-cover rounded border border-border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">{reading.title}</h4>
                          {reading.author && (
                            <p className="text-sm text-muted-foreground mt-1">por {reading.author}</p>
                          )}
                          {reading.description && (
                            <p className="text-sm text-foreground mt-2 line-clamp-3">{reading.description}</p>
                          )}
                          {reading.link && (
                            <a
                              href={reading.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-accent hover:text-accent/80 transition-colors mt-2 inline-flex items-center gap-1"
                            >
                              Ver más <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes Adicionales */}
            {config.additionalImages?.images && config.additionalImages.images.length > 0 && (
              <div className="border-t border-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.additionalImages.images.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      {image.caption && (
                        <p className="text-xs text-muted-foreground text-center">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
