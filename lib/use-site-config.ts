"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { siteConfigStore, type SiteConfig } from "./site-config"

// Track whether the API config has been loaded at least once
let configLoaded = false
let configLoadPromise: Promise<void> | null = null
let configLoadListeners: Set<() => void> = new Set()

function notifyConfigLoaded() {
  configLoaded = true
  configLoadListeners.forEach((listener) => listener())
}

function loadConfigFromAPI(): Promise<void> {
  if (configLoadPromise) return configLoadPromise

  configLoadPromise = fetch("/api/site-config")
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json()
        // Asegurar que navigation.order tenga valores por defecto si faltan
        if (!data.navigation?.order || !Array.isArray(data.navigation.order)) {
          data.navigation = {
            ...data.navigation,
            order: [
              "menu-items",
              "separator",
              "booking-button",
              "social-icons",
              "theme-toggle",
            ],
          }
        }
        siteConfigStore.set(data)
      }
    })
    .catch((error) => {
      console.error("Error cargando configuración:", error)
    })
    .finally(() => {
      notifyConfigLoaded()
    })

  return configLoadPromise
}

export function useSiteConfig(): SiteConfig {
  const config = useSyncExternalStore(
    siteConfigStore.subscribe,
    siteConfigStore.get,
    siteConfigStore.get
  )

  useEffect(() => {
    if (!configLoaded && !configLoadPromise) {
      loadConfigFromAPI()
    }
  }, [])

  return config
}

/**
 * Returns true once the site config has been loaded from the API.
 * Use this to delay rendering until the real config is available,
 * preventing content flicker.
 */
export function useSiteConfigReady(): boolean {
  const [ready, setReady] = useState(configLoaded)

  useEffect(() => {
    if (configLoaded) {
      setReady(true)
      return
    }

    // Start loading if not already
    if (!configLoadPromise) {
      loadConfigFromAPI()
    }

    const listener = () => setReady(true)
    configLoadListeners.add(listener)
    return () => {
      configLoadListeners.delete(listener)
    }
  }, [])

  return ready
}
