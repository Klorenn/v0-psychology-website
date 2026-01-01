import { MapPin, Clock, Phone } from "lucide-react"

export function LocationSection() {
  return (
    <section id="ubicacion" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-3">Encuéntrame</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Ubicación de la consulta</h2>
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
                  <p className="text-sm text-muted-foreground">Santiago Centro, Chile</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Horarios</h3>
                  <p className="text-sm text-muted-foreground">Lunes a Viernes</p>
                  <p className="text-sm text-muted-foreground">9:00 - 18:00 hrs</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Contacto</h3>
                  <p className="text-sm text-muted-foreground">+56 9 1234 5678</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-muted aspect-[4/3] lg:aspect-auto lg:min-h-[350px] border border-border/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106459.49288253474!2d-70.69348899999999!3d-33.4377968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5410425af2f%3A0x8475d53c400f0931!2sSantiago%2C%20Chile!5e0!3m2!1sen!2sus!4v1704067200000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[0.3] opacity-90"
              title="Ubicación de la consulta en Santiago, Chile"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
