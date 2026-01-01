import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ValuesSection } from "@/components/values-section"
import { LocationSection } from "@/components/location-section"
import { BookingSection } from "@/components/booking-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ValuesSection />
      <LocationSection />
      <BookingSection />
      <Footer />
    </main>
  )
}
