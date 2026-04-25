"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ValuesSection } from "@/components/values-section"
import { LocationSection } from "@/components/location-section"
import { BookingSection } from "@/components/booking-section"
import { LeaveReviewSection } from "@/components/leave-review-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"
import { ThemeApplier } from "@/components/theme-applier"
import { useSiteConfig, useSiteConfigReady } from "@/lib/use-site-config"

export default function Home() {
  const config = useSiteConfig()
  const ready = useSiteConfigReady()

  // Don't render anything until the real config is loaded from API,
  // preventing the flash of default content being replaced.
  if (!ready) {
    return (
      <main className="min-h-screen">
        <ThemeApplier />
      </main>
    )
  }

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
      case "reviews":
        return <ReviewsSection key="reviews" />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen">
      <ThemeApplier />
      <Navigation />
      {config.sectionOrder.map((sectionId) => {
        const section = renderSection(sectionId)
        return section
      })}
      <Footer />
    </main>
  )
}
