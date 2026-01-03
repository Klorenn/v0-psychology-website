"use client"

import { useState } from "react"
import { GripVertical, ArrowUp, ArrowDown, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SiteConfig } from "@/lib/site-config"

interface NavigationOrderEditorProps {
  config: SiteConfig
  onConfigChange: (config: SiteConfig) => void
  onSave: () => Promise<void>
}

const navigationItems = [
  { id: "menu-items", label: "Botones de Menú", description: "Sobre mí, Valores, Ubicación, Reseñas" },
  { id: "separator", label: "Separador", description: "Línea divisoria" },
  { id: "social-icons", label: "Iconos Sociales", description: "Instagram, LinkedIn, Email" },
  { id: "booking-button", label: "Botón Agendar", description: "Botón principal de agendamiento" },
  { id: "theme-toggle", label: "Toggle Día/Noche", description: "Cambiar entre modo claro y oscuro" },
]

export function NavigationOrderEditor({ config, onConfigChange, onSave }: NavigationOrderEditorProps) {
  const [order, setOrder] = useState<string[]>(
    config.navigation?.order || navigationItems.map(item => item.id)
  )
  const [saving, setSaving] = useState(false)

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...order]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    setOrder(newOrder)
  }

  const handleMoveDown = (index: number) => {
    if (index === order.length - 1) return
    const newOrder = [...order]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    setOrder(newOrder)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const newConfig = {
        ...config,
        navigation: {
          ...config.navigation,
          order,
        },
      }
      onConfigChange(newConfig)
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  const getItemLabel = (id: string) => {
    return navigationItems.find(item => item.id === id)?.label || id
  }

  const getItemDescription = (id: string) => {
    return navigationItems.find(item => item.id === id)?.description || ""
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Orden de Elementos de Navegación
        </h3>
        <p className="text-sm text-muted-foreground">
          Arrastra o usa las flechas para reordenar los elementos de la barra de navegación
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {order.map((itemId, index) => {
          const item = navigationItems.find(i => i.id === itemId)
          if (!item) return null

          return (
            <div
              key={itemId}
              className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border/50 hover:border-accent/50 transition-colors"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mover arriba"
                >
                  <ArrowUp className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === order.length - 1}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mover abajo"
                >
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Guardando..." : "Guardar Orden"}
      </Button>
    </div>
  )
}

