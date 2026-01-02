"use client"

import { Heart, Shield, Users, Lock, Star, CheckCircle, Zap, Sun } from "lucide-react"
import { useSiteConfig } from "@/lib/use-site-config"

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Heart,
  Shield,
  Users,
  Lock,
  Star,
  CheckCircle,
  Zap,
  Sun,
}

export function ValuesSection() {
  const config = useSiteConfig()

  return (
    <section id="valores" className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-3">{config.values.subtitle}</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{config.values.title}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {config.values.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.values.items.map((value, index) => {
            const IconComponent = iconMap[value.icon] || Heart
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/50 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <IconComponent className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
