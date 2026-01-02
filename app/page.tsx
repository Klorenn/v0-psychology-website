"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ValuesSection } from "@/components/values-section"
import { LocationSection } from "@/components/location-section"
import { BookingSection } from "@/components/booking-section"
import { Footer } from "@/components/footer"
import { ThemeApplier } from "@/components/theme-applier"
import { useSiteConfig } from "@/lib/use-site-config"

export default function Home() {
  const config = useSiteConfig()

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return <HeroSection key="hero" />
      case "values":
        return <ValuesSection key="values" />
      case "location":
        return <LocationSection key="location" />
      case "booking":
        return <BookingSection key="booking" />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen">
      <ThemeApplier />
      <Navigation />
      {config.sectionOrder.map((sectionId) => renderSection(sectionId))}
      <Footer />
    </main>
  )
}
