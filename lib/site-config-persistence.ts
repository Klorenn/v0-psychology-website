import type { SiteConfig } from "./site-config"

let fs: typeof import("fs/promises") | null = null
let path: typeof import("path") | null = null

if (typeof window === "undefined") {
  fs = require("fs/promises")
  path = require("path")
}

const DATA_DIR = path ? path.join(process.cwd(), "data") : ""
const DATA_FILE = path ? path.join(DATA_DIR, "site-config.json") : ""

async function ensureDataDir() {
  if (typeof window !== "undefined" || !fs || !path) return
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creando directorio de datos:", error)
  }
}

export const siteConfigPersistence = {
  async load(): Promise<SiteConfig | null> {
    if (typeof window !== "undefined" || !fs || !path) return null
    
    try {
      await ensureDataDir()
      const data = await fs.readFile(DATA_FILE, "utf-8")
      return JSON.parse(data) as SiteConfig
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null
      }
      console.error("Error cargando configuración:", error)
      return null
    }
  },
  
  async save(config: SiteConfig): Promise<void> {
    if (typeof window !== "undefined" || !fs || !path) return
    
    try {
      await ensureDataDir()
      await fs.writeFile(DATA_FILE, JSON.stringify(config, null, 2), "utf-8")
    } catch (error) {
      console.error("Error guardando configuración:", error)
      throw error
    }
  },
}

