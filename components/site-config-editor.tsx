"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/file-upload"
import { Save, Upload, X, Plus, Trash2 } from "lucide-react"
import type { SiteConfig } from "@/lib/site-config"

interface SiteConfigEditorProps {
  onClose?: () => void
}

const iconOptions = ["Heart", "Shield", "Users", "Lock", "Star", "CheckCircle", "Zap", "Sun"]

export function SiteConfigEditor({ onClose }: SiteConfigEditorProps) {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/site-config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        // Si no hay configuración, usar la default
        const response = await fetch("/api/site-config")
        const defaultConfig = await response.json()
        setConfig(defaultConfig)
      }
    } catch (error) {
      console.error("Error cargando configuración:", error)
      setMessage({ type: "error", text: "Error al cargar la configuración" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      
      if (response.ok) {
        setMessage({ type: "success", text: "Configuración guardada exitosamente" })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Error al guardar" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la configuración" })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: "profile" | "logo") => {
    const setUploading = type === "profile" ? setUploadingProfile : setUploadingLogo
    setUploading(true)
    setMessage(null)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (!config) return
        
        if (type === "profile") {
          setConfig({ ...config, hero: { ...config.hero, profileImage: data.url } })
        } else {
          setConfig({ ...config, navigation: { ...config.navigation, logo: data.url } })
        }
        
        setMessage({ type: "success", text: "Imagen subida exitosamente" })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Error al subir imagen" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al subir la imagen" })
    } finally {
      setUploading(false)
    }
  }

  const addValue = () => {
    if (!config) return
    setConfig({
      ...config,
      values: {
        ...config.values,
        items: [...config.values.items, { icon: "Heart", title: "", description: "" }],
      },
    })
  }

  const removeValue = (index: number) => {
    if (!config) return
    setConfig({
      ...config,
      values: {
        ...config.values,
        items: config.values.items.filter((_, i) => i !== index),
      },
    })
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="bg-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Error al cargar la configuración</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Configuración del Sitio</h2>
          <p className="text-sm text-muted-foreground">Edita el contenido de tu página web</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-serif text-xl text-foreground mb-4">Sección Principal (Hero)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subtítulo</label>
            <Input
              value={config.hero.subtitle}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
              placeholder="Psicóloga Clínica"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Título</label>
            <Input
              value={config.hero.title}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
              placeholder="Soy María Jesús Chavez San Luis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
            <textarea
              value={config.hero.description}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, description: e.target.value } })}
              placeholder="Te acompaño en tu proceso..."
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Foto de Perfil</label>
            <div className="flex items-center gap-4">
              {config.hero.profileImage && (
                <img src={config.hero.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              )}
              <FileUpload
                value={null}
                onChange={(file) => file && handleImageUpload(file, "profile")}
                isUploading={uploadingProfile}
                required={false}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Botón Principal</label>
              <Input
                value={config.hero.ctaPrimary}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimary: e.target.value } })}
                placeholder="Agenda tu primera sesión"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Botón Secundario</label>
              <Input
                value={config.hero.ctaSecondary}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondary: e.target.value } })}
                placeholder="Conoce más"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-serif text-xl text-foreground mb-4">Navegación</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Texto del Logo</label>
            <Input
              value={config.navigation.logoText}
              onChange={(e) => setConfig({ ...config, navigation: { ...config.navigation, logoText: e.target.value } })}
              placeholder="María San Luis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Logo (Imagen)</label>
            <div className="flex items-center gap-4">
              {config.navigation.logo && (
                <img src={config.navigation.logo} alt="Logo" className="h-12 object-contain" />
              )}
              <FileUpload
                value={null}
                onChange={(file) => file && handleImageUpload(file, "logo")}
                isUploading={uploadingLogo}
                required={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-serif text-xl text-foreground mb-4">Sección de Valores</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subtítulo</label>
            <Input
              value={config.values.subtitle}
              onChange={(e) => setConfig({ ...config, values: { ...config.values, subtitle: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Título</label>
            <Input
              value={config.values.title}
              onChange={(e) => setConfig({ ...config, values: { ...config.values, title: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
            <textarea
              value={config.values.description}
              onChange={(e) => setConfig({ ...config, values: { ...config.values, description: e.target.value } })}
              className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-foreground">Valores</label>
              <Button size="sm" onClick={addValue} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            <div className="space-y-4">
              {config.values.items.map((value, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Valor {index + 1}</span>
                    {config.values.items.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => removeValue(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Icono</label>
                    <select
                      value={value.icon}
                      onChange={(e) => {
                        const newItems = [...config.values.items]
                        newItems[index].icon = e.target.value
                        setConfig({ ...config, values: { ...config.values, items: newItems } })
                      }}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Título</label>
                    <Input
                      value={value.title}
                      onChange={(e) => {
                        const newItems = [...config.values.items]
                        newItems[index].title = e.target.value
                        setConfig({ ...config, values: { ...config.values, items: newItems } })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Descripción</label>
                    <textarea
                      value={value.description}
                      onChange={(e) => {
                        const newItems = [...config.values.items]
                        newItems[index].description = e.target.value
                        setConfig({ ...config, values: { ...config.values, items: newItems } })
                      }}
                      className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-serif text-xl text-foreground mb-4">Sección de Ubicación</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subtítulo</label>
            <Input
              value={config.location.subtitle}
              onChange={(e) => {
                setConfig({
                  ...config,
                  location: { ...config.location, subtitle: e.target.value },
                })
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Título</label>
            <Input
              value={config.location.title}
              onChange={(e) => setConfig({ ...config, location: { ...config.location, title: e.target.value } })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Ciudad</label>
              <Input
                value={config.location.city}
                onChange={(e) => setConfig({ ...config, location: { ...config.location, city: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">País</label>
              <Input
                value={config.location.country}
                onChange={(e) => setConfig({ ...config, location: { ...config.location, country: e.target.value } })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Días</label>
              <Input
                value={config.location.schedule.days}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    location: { ...config.location, schedule: { ...config.location.schedule, days: e.target.value } },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Horario</label>
              <Input
                value={config.location.schedule.hours}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    location: { ...config.location, schedule: { ...config.location.schedule, hours: e.target.value } },
                  })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">URL del Mapa (Embed)</label>
            <Input
              value={config.location.mapEmbedUrl}
              onChange={(e) => setConfig({ ...config, location: { ...config.location, mapEmbedUrl: e.target.value } })}
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h3 className="font-serif text-xl text-foreground mb-4">Redes Sociales</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Instagram</label>
            <Input
              value={config.social.instagram}
              onChange={(e) => setConfig({ ...config, social: { ...config.social, instagram: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">LinkedIn</label>
            <Input
              value={config.social.linkedin}
              onChange={(e) => setConfig({ ...config, social: { ...config.social, linkedin: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input
              value={config.social.email}
              onChange={(e) => setConfig({ ...config, social: { ...config.social, email: e.target.value } })}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

