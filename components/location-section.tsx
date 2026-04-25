"use client"

import { MapPin, Clock } from "lucide-react"
import { useSiteConfig } from "@/lib/use-site-config"

export function LocationSection() {
  const config = useSiteConfig()

  return (
    <section id="ubicacion" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-3">{config.location.subtitle}</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{config.location.title}</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-card border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Dirección</h3>
                  <p className="text-sm text-muted-foreground">{config.location.city}, {config.location.country}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Horarios de atención</h3>
                  <p className="text-sm text-muted-foreground">{config.location.schedule.days}</p>
                  <p className="text-sm text-muted-foreground">{config.location.schedule.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-muted aspect-[4/3] lg:aspect-auto lg:min-h-[350px] border border-border/50">
            <iframe
              src={config.location.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[0.3] opacity-90"
              title={`Ubicación de la consulta en ${config.location.city}, ${config.location.country}`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
