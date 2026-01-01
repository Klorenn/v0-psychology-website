import { MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-border/50 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="font-serif text-xl text-foreground mb-3">Psicología</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Espacio de bienestar emocional. Atención psicológica profesional con calidez y respeto.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-4 text-sm uppercase tracking-wider">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" strokeWidth={1.5} />
                <span>+56 9 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                <span>contacto@psicologia.cl</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-4 text-sm uppercase tracking-wider">Ubicación</h4>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5" strokeWidth={1.5} />
              <span>Santiago Centro, Chile</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Psicología · Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}
