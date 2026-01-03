"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Loader2, CheckCircle } from "lucide-react"
import type { SiteConfig } from "@/lib/site-config"

interface AboutMeEditorProps {
  config: SiteConfig
  onConfigChange: (config: SiteConfig) => void
  onSave: () => Promise<void>
}

export function AboutMeEditor({
  config,
  onConfigChange,
  onSave,
}: AboutMeEditorProps) {
  const [aboutMe, setAboutMe] = useState(config.hero?.aboutMe || "")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setAboutMe(config.hero?.aboutMe || "")
  }, [config.hero?.aboutMe])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      const updatedConfig = {
        ...config,
        hero: {
          ...config.hero,
          aboutMe: aboutMe.trim(),
        },
      }
      
      onConfigChange(updatedConfig)
      await onSave()
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error guardando 'Sobre mí':", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="about-me" className="text-sm font-medium text-foreground mb-2 block">
          Información "Sobre mí"
          <span className="text-xs text-muted-foreground ml-2">(aparece en el modal cuando se hace clic en el botón "Sobre mí")</span>
        </Label>
        <Textarea
          id="about-me"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="Escribe aquí la información sobre ti que aparecerá en el modal 'Sobre mí'..."
          className="w-full min-h-[300px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y"
          rows={12}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Este texto aparecerá en el modal cuando los usuarios hagan clic en el botón "Sobre mí" en la página principal.
          También se mostrarán aquí los cursos, diplomados, recomendaciones de lecturas e imágenes que agregues.
        </p>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              ¡Guardado!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

