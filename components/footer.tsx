"use client"

import { MapPin, Mail, Instagram, Linkedin, Clock } from "lucide-react"
import { useSiteConfig } from "@/lib/use-site-config"

export function Footer() {
  const config = useSiteConfig()

  return (
    <footer className="relative py-20 px-6 border-t border-border/50 bg-gradient-to-b from-card to-background/50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-foreground mb-4">Espacio terapéutico</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Un espacio cálido y profesional para acompañarte en tu proceso de bienestar y crecimiento personal.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground mb-5 text-xs uppercase tracking-widest">Contacto</h4>
            <div className="space-y-4">
              <a 
                href={`mailto:${config.social.email || ""}`} 
                className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors shrink-0">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="group-hover:translate-x-1 transition-transform break-all">{config.social.email || "ps.mariasanluis@gmail.com"}</span>
              </a>
            </div>
          </div>

          {/* Location & Hours Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground mb-5 text-xs uppercase tracking-widest">Horarios de atención</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-foreground font-medium">{config.location?.city || "Temuco"}</p>
                  <p className="text-muted-foreground">{config.location?.country || "Chile"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-foreground font-medium">{config.location?.schedule?.days || "Lunes a Viernes"}</p>
                  <p className="text-muted-foreground">{config.location?.schedule?.hours || "9:00 a 18:00 hrs"}</p>
                  <p className="text-muted-foreground text-xs mt-1">(Agenda sujeta a disponibilidad)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              ©️ {new Date().getFullYear()} María San Luis | Psicóloga Clínica
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-2">Conecta conmigo:</span>
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href={config.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.psychologytoday.com/cl/psicologos/maria-jesus-chavez-san-luis-temuco-ar/1666990?utm_source=ig&utm_medium=social&utm_content=link_in_bio"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200 text-xs font-medium"
                aria-label="Psychology Today"
              >
                Psychology Today
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
