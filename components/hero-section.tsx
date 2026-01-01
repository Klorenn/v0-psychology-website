import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section id="sobre-mi" className="relative min-h-[90vh] flex items-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-muted/50 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-sm uppercase tracking-widest text-accent mb-4">Psicóloga Clínica</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground text-balance mb-6">
              Soy María Jesús Chavez San Luis
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty mb-8">
              Te acompaño en tu proceso de crecimiento personal con calidez, respeto y profesionalismo. Juntos
              encontraremos el camino hacia una vida más plena.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="px-8 py-6 text-base font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                asChild
              >
                <a href="#agenda">Agenda tu primera sesión</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base font-medium rounded-full border-border hover:bg-muted transition-all bg-transparent"
                asChild
              >
                <a href="#valores">Conoce más</a>
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-muted/30 border border-border/50 overflow-hidden">
                <img
                  src="/images/whatsapp-20image-202026-01-01-20at-2019.jpeg"
                  alt="María Jesús Chavez San Luis - Psicóloga Clínica"
                  className="w-full h-full object-cover object-[center_25%]"
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
