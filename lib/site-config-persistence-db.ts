import type { SiteConfig } from "./site-config"
import { getSiteConfig, saveSiteConfig } from "./db"

export const siteConfigPersistence = {
  async load(): Promise<SiteConfig | null> {
    try {
      const config = await getSiteConfig()
      return config
    } catch (error) {
      console.error("Error cargando configuración desde DB:", error)
      return null
    }
  },

  async save(config: SiteConfig): Promise<void> {
    try {
      await saveSiteConfig(config)
    } catch (error) {
      console.error("Error guardando configuración en DB:", error)
      throw error
    }
  },
}

