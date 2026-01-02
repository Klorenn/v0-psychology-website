"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Save, Info } from "lucide-react"
import type { SiteConfig } from "@/lib/site-config"

interface EmailTemplateEditorProps {
  config: SiteConfig
  onConfigChange: (config: SiteConfig) => void
  onSave: () => Promise<void>
}

export function EmailTemplateEditor({ config, onConfigChange, onSave }: EmailTemplateEditorProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-accent" />
        <h3 className="font-serif text-xl text-foreground">Plantilla de Email de Confirmación</h3>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">Variables disponibles:</p>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              <li>• {"{{patientName}}"} - Nombre del paciente</li>
              <li>• {"{{date}}"} - Fecha formateada</li>
              <li>• {"{{time}}"} - Hora de la sesión</li>
              <li>• {"{{appointmentType}}"} - Online o Presencial</li>
              <li>• {"{{price}}"} - Precio de la sesión</li>
              <li>• {"{{meetLink}}"} - Enlace de Google Meet (solo si es online)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email-subject">Asunto del Email</Label>
          <Input
            id="email-subject"
            value={config.emailTemplate?.subject || ""}
            onChange={(e) =>
              onConfigChange({
                ...config,
                emailTemplate: {
                  ...config.emailTemplate,
                  subject: e.target.value,
                },
              })
            }
            placeholder="Sesión Confirmada - {{date}}"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="email-body">Cuerpo del Email</Label>
          <textarea
            id="email-body"
            value={config.emailTemplate?.body || ""}
            onChange={(e) =>
              onConfigChange({
                ...config,
                emailTemplate: {
                  ...config.emailTemplate,
                  body: e.target.value,
                },
              })
            }
            placeholder="Estimado/a {{patientName}},&#10;&#10;Su sesión ha sido confirmada..."
            className="mt-2 w-full min-h-[300px] px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
            rows={15}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Plantilla
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

