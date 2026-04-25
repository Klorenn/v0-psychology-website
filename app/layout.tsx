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
  metadataBase: new URL("https://psmariasanluis.com"),
  title: "María San Luis · Psicóloga Clínica",
  description: siteDescription,
  openGraph: {
    url: "https://psmariasanluis.com/",
    type: "website",
    title: "María San Luis · Psicóloga Clínica",
    description: siteDescription,
    locale: "es_CL",
    siteName: "María San Luis",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "María San Luis · Psicóloga Clínica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "psmariasanluis.com",
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
      <head>
        {/* Blocking script to prevent theme color flash (FOUC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
