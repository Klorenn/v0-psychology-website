"use client"

import { Button } from "@/components/ui/button"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { useSiteConfig } from "@/lib/use-site-config"

export function HeroSection() {
  const config = useSiteConfig()

  return (
    <section id="sobre-mi" className="relative min-h-[90vh] flex items-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-muted/50 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-sm uppercase tracking-widest text-accent mb-4">{config.hero.subtitle}</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground text-balance mb-6">
              {config.hero.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty mb-8">
              {config.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#agenda" className="inline-block">
                <InteractiveHoverButton
                  text={config.hero.ctaPrimary}
                  className="min-w-[200px]"
                />
              </a>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-medium rounded-full border-border hover:bg-muted transition-all bg-transparent"
                asChild
              >
                <a href="#valores">{config.hero.ctaSecondary}</a>
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
    </section>
  )
}
