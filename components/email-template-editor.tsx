"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Save, Loader2, Info, RotateCcw, Eye } from "lucide-react"
import type { SiteConfig } from "@/lib/site-config"

interface EmailTemplateEditorProps {
  config: SiteConfig
  onConfigChange: (config: SiteConfig) => void
  onSave: () => Promise<void>
}

export function EmailTemplateEditor({ config, onConfigChange, onSave }: EmailTemplateEditorProps) {
  const [subject, setSubject] = useState(config.emailTemplate?.subject || "")
  const [body, setBody] = useState(config.emailTemplate?.body || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setSubject(config.emailTemplate?.subject || "")
    setBody(config.emailTemplate?.body || "")
  }, [config.emailTemplate])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(false)
    try {
      onConfigChange({
        ...config,
        emailTemplate: { subject, body },
      })
      await onSave()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error guardando plantilla de email:", error)
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestore = () => {
    const defaultTemplate = {
      subject: "Confirmación de Sesión - {{date}} {{time}}",
      body: `Estimado/a {{patientName}},

¡Su sesión ha sido confirmada!

Detalles de su sesión:
Fecha: {{date}}
Hora: {{time}} hrs
Modalidad: {{appointmentType}}
Valor: ${{price}} CLP
{{#if meetLink}}Enlace de Google Meet: {{meetLink}}{{/if}}

Por favor, asegúrese de estar listo/a 5 minutos antes de la hora.

Si tiene alguna pregunta, no dude en contactarme.

Saludos cordiales,
María Jesús Chavez San Luis
Psicóloga Clínica`
    }
    setSubject(defaultTemplate.subject)
    setBody(defaultTemplate.body)
  }

  const getPreview = () => {
    return {
      subject: subject
        .replace(/\{\{patientName\}\}/g, "Juan Pérez")
        .replace(/\{\{date\}\}/g, "15 de Enero, 2026")
        .replace(/\{\{time\}\}/g, "15:00"),
      body: body
        .replace(/\{\{patientName\}\}/g, "Juan Pérez")
        .replace(/\{\{date\}\}/g, "15 de Enero, 2026")
        .replace(/\{\{time\}\}/g, "15:00")
        .replace(/\{\{appointmentType\}\}/g, "Online")
        .replace(/\{\{price\}\}/g, "20.000")
        .replace(/\{\{#if meetLink\}\}(.*?)\{\{\/if\}\}/gs, "$1")
        .replace(/\{\{meetLink\}\}/g, "https://meet.google.com/abc-defg-hij")
    }
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Mail className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl text-foreground">Plantilla de Email</h3>
          <p className="text-sm text-muted-foreground">Personalice el email que reciben sus pacientes al confirmar</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="rounded-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? "Ocultar" : "Vista Previa"}
        </Button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-3 h-3" />
            Vista Previa (ejemplo)
          </p>
          <div className="bg-background rounded-lg p-4 space-y-3 border border-border">
            <div className="border-b border-border pb-2">
              <p className="text-xs text-muted-foreground mb-1">Asunto:</p>
              <p className="text-sm font-semibold text-foreground">{getPreview().subject || "Sin asunto"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Contenido:</p>
              <div className="text-sm text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                {getPreview().body || "Sin contenido"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variables Helper */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
            Variables Disponibles
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {`{{patientName}}`}
            </code>
            <span className="text-muted-foreground">Nombre del paciente</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {`{{date}}`}
            </code>
            <span className="text-muted-foreground">Fecha de la sesión</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {`{{time}}`}
            </code>
            <span className="text-muted-foreground">Hora de la sesión</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {`{{appointmentType}}`}
            </code>
            <span className="text-muted-foreground">Online/Presencial</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {`{{price}}`}
            </code>
            <span className="text-muted-foreground">Precio de la sesión</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {`{{meetLink}}`}
            </code>
            <span className="text-muted-foreground">Link de Google Meet*</span>
          </div>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
          * Solo para sesiones online con Google Calendar vinculado
        </p>
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <Label htmlFor="email-subject" className="text-sm font-medium flex items-center gap-2">
          Asunto del Email
          <span className="text-xs text-muted-foreground font-normal">(aparece en la bandeja de entrada)</span>
        </Label>
        <Input
          id="email-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ej: Confirmación de Sesión - {{date}} {{time}}"
          className="rounded-xl"
        />
      </div>

      {/* Body Field */}
      <div className="space-y-2">
        <Label htmlFor="email-body" className="text-sm font-medium flex items-center gap-2">
          Contenido del Email
          <span className="text-xs text-muted-foreground font-normal">(mensaje completo)</span>
        </Label>
        <Textarea
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Estimado/a {{patientName}},&#10;&#10;Su sesión ha sido confirmada..."
          rows={14}
          className="rounded-xl font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Mantenga un tono cálido y profesional. Incluya toda la información importante.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : saveSuccess ? (
            <>
              <Mail className="w-4 h-4 mr-2" />
              ¡Guardado!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Plantilla
            </>
          )}
        </Button>
        
        <Button
          onClick={handleRestore}
          variant="outline"
          className="rounded-xl"
          disabled={isSaving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Original
        </Button>
      </div>
      
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-900 dark:text-green-100 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Plantilla guardada correctamente
          </p>
        </div>
      )}
      
      {saveError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-900 dark:text-red-100">
            Error al guardar la plantilla. Intente nuevamente.
          </p>
        </div>
      )}
    </div>
  )
}
