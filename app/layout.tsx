import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"] })

const siteDescription =
  "Apoyo psicológico cálido y profesional. Un espacio seguro para tu bienestar emocional."

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: "Psicología | Espacio de Bienestar",
  description: siteDescription,
  generator: "v0.app",
  openGraph: {
    title: "María San Luis · Psicóloga Clínica",
    description: siteDescription,
    type: "website",
    locale: "es_ES",
    siteName: "María San Luis",
    images: [
      {
        url: "/og.png",
        width: 1024,
        height: 511,
        alt: "María San Luis — Psicóloga clínica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "María San Luis · Psicóloga Clínica",
    description: siteDescription,
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
