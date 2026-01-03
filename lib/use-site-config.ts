"use client"

import { useState, useEffect } from "react"
import { siteConfigStore, type SiteConfig } from "./site-config"

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(siteConfigStore.get())

  useEffect(() => {
    // Cargar configuración desde la API
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const data = await response.json()
          // Asegurar que navigation.order tenga valores por defecto si faltan
          if (!data.navigation?.order || !Array.isArray(data.navigation.order)) {
            data.navigation = {
              ...data.navigation,
              order: [
                "menu-items",
                "separator",
                "social-icons",
                "booking-button",
                "theme-toggle",
              ],
            }
          }
          siteConfigStore.set(data)
          setConfig(data)
        }
      } catch (error) {
        console.error("Error cargando configuración:", error)
      }
    }

    loadConfig()

    // Suscribirse a cambios
    const unsubscribe = siteConfigStore.subscribe(() => {
      setConfig(siteConfigStore.get())
    })

    return unsubscribe
  }, [])

  return config
}

