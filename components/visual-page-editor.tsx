"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/file-upload"
import { Save, X, Edit2, GripVertical, Eye, EyeOff, RotateCcw } from "lucide-react"
import type { SiteConfig } from "@/lib/site-config"
import { defaultConfig } from "@/lib/site-config"
import { authenticatedFetch } from "@/lib/api-client"
import { HeroSection } from "@/components/hero-section"
import { ValuesSection } from "@/components/values-section"
import { LocationSection } from "@/components/location-section"
import { BookingSection } from "@/components/booking-section"
import { ReviewsSection } from "@/components/reviews-section"
import { LeaveReviewSection } from "@/components/leave-review-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

interface VisualPageEditorProps {
  config: SiteConfig
  onConfigChange: (config: SiteConfig) => void
  onSave: () => Promise<void>
}

type EditableSection = "hero" | "values" | "location" | "navigation" | null

export function VisualPageEditor({ config, onConfigChange, onSave }: VisualPageEditorProps) {
  const [selectedSection, setSelectedSection] = useState<EditableSection>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [previewMode, setPreviewMode] = useState(true)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleImageUpload = async (file: File, type: "profile" | "logo") => {
    const setUploading = type === "profile" ? setUploadingProfile : setUploadingLogo
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      
      const response = await authenticatedFetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (type === "profile") {
          onConfigChange({ ...config, hero: { ...config.hero, profileImage: data.url } })
        } else {
          onConfigChange({ ...config, navigation: { ...config.navigation, logo: data.url } })
        }
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return (
          <div
            key="hero"
            className={`relative cursor-pointer transition-all ${
              selectedSection === "hero" ? "ring-2 ring-accent ring-offset-4" : "hover:ring-1 hover:ring-accent/50"
            }`}
            onClick={() => {
              setSelectedSection("hero")
              setIsEditing(true)
            }}
          >
            <HeroSection />
            {selectedSection === "hero" && (
              <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg z-10">
                <Edit2 className="w-3 h-3" />
                Editando
              </div>
            )}
          </div>
        )
      case "values":
        return (
          <div
            key="values"
            className={`relative cursor-pointer transition-all ${
              selectedSection === "values" ? "ring-2 ring-accent ring-offset-4" : "hover:ring-1 hover:ring-accent/50"
            }`}
            onClick={() => {
              setSelectedSection("values")
              setIsEditing(true)
            }}
          >
            <ValuesSection />
            {selectedSection === "values" && (
              <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg z-10">
                <Edit2 className="w-3 h-3" />
                Editando
              </div>
            )}
          </div>
        )
      case "location":
        return (
          <div
            key="location"
            className={`relative cursor-pointer transition-all ${
              selectedSection === "location" ? "ring-2 ring-accent ring-offset-4" : "hover:ring-1 hover:ring-accent/50"
            }`}
            onClick={() => {
              setSelectedSection("location")
              setIsEditing(true)
            }}
          >
            <LocationSection />
            {selectedSection === "location" && (
              <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg z-10">
                <Edit2 className="w-3 h-3" />
                Editando
              </div>
            )}
          </div>
        )
      case "booking":
        return (
          <div
            key="booking"
            className="relative"
            onClick={() => {
              // Booking section is not editable for now
            }}
          >
            <BookingSection />
            <LeaveReviewSection />
            <ReviewsSection />
          </div>
        )
      case "reviews":
        return (
          <div
            key="reviews"
            className="relative"
            onClick={() => {
              // Reviews section is not editable for now
            }}
          >
            <ReviewsSection />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Toolbar */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg text-foreground">Editor Visual</h2>
          {selectedSection && (
            <span className="text-xs text-muted-foreground">
              • Editando: <span className="text-foreground capitalize">{selectedSection}</span>
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-accent text-accent-foreground">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onConfigChange(defaultConfig)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restablecer
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main Preview Area */}
        <div className={`flex-1 overflow-auto bg-background ${isEditing ? "border-r border-border" : ""}`}>
          <div className="relative min-h-full">
            {/* Navigation - Always visible */}
            <div
              className={`relative cursor-pointer transition-all mb-4 ${
                selectedSection === "navigation" ? "ring-2 ring-accent ring-offset-2" : "hover:ring-1 hover:ring-accent/50"
              }`}
              onClick={() => {
                setSelectedSection("navigation")
                setIsEditing(true)
              }}
            >
              <Navigation isStatic={true} />
              {selectedSection === "navigation" && (
                <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg z-50">
                  <Edit2 className="w-3 h-3" />
                  Editando
                </div>
              )}
            </div>

            {/* Sections in order */}
            {config.sectionOrder.map((sectionId) => renderSection(sectionId))}

            {/* Footer - Always at bottom */}
            <Footer />
          </div>
        </div>

        {/* Editing Panel */}
        {isEditing && selectedSection && (
          <div className="w-96 border-l border-border bg-card overflow-y-auto flex-shrink-0">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 shadow-sm">
            <h3 className="font-serif text-lg text-foreground">
              Editando: {selectedSection === "hero" ? "Hero" : selectedSection === "values" ? "Valores" : selectedSection === "location" ? "Ubicación" : "Navegación"}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            {selectedSection === "hero" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subtítulo</label>
                  <Input
                    value={config.hero.subtitle}
                    onChange={(e) => onConfigChange({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Título</label>
                  <Input
                    value={config.hero.title}
                    onChange={(e) => onConfigChange({ ...config, hero: { ...config.hero, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                  <textarea
                    value={config.hero.description}
                    onChange={(e) => onConfigChange({ ...config, hero: { ...config.hero, description: e.target.value } })}
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Información "Conozca más"
                    <span className="text-xs text-muted-foreground ml-2">(aparece en el modal)</span>
                  </label>
                  <textarea
                    value={config.hero.aboutMe || ""}
                    onChange={(e) => onConfigChange({ ...config, hero: { ...config.hero, aboutMe: e.target.value } })}
                    placeholder="Información detallada sobre ti que aparecerá cuando los usuarios hagan clic en 'Conozca más'..."
                    className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este texto aparecerá en el modal cuando los usuarios hagan clic en el botón "Conozca más"
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Foto de Perfil</label>
                  <div className="flex items-center gap-4 mb-2">
                    {config.hero.profileImage && (
                      <img 
                        src={config.hero.profileImage} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                        style={{ objectPosition: config.hero.imagePosition || "center 25%" }}
                      />
                    )}
                  </div>
                  <FileUpload
                    value={null}
                    onChange={(file) => file && handleImageUpload(file, "profile")}
                    isUploading={uploadingProfile}
                    required={false}
                  />
                  
                  {config.hero.profileImage && (
                    <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg">
                      <label className="block text-sm font-medium text-foreground mb-3">Ajustar Posición de la Imagen</label>
                      
                      {/* Preview */}
                      <div className="relative w-full h-48 bg-muted/50 rounded-lg overflow-hidden mb-4 border border-border">
                        <img
                          src={config.hero.profileImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: config.hero.imagePosition || "center 25%" }}
                        />
                        <div className="absolute inset-0 border-2 border-dashed border-accent/50 pointer-events-none" />
                      </div>
                      
                      {/* Position Controls */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-2">
                            Posición Horizontal: {(() => {
                              const pos = config.hero.imagePosition || "center 25%"
                              if (pos.includes("left")) return "Izquierda"
                              if (pos.includes("right")) return "Derecha"
                              return "Centro"
                            })()}
                          </label>
                          <div className="flex gap-2">
                            {["left", "center", "right"].map((pos) => {
                              const currentPos = config.hero.imagePosition || "center 25%"
                              const isActive = currentPos.includes(pos)
                              return (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => {
                                    const vertical = currentPos.split(" ")[1] || "25%"
                                    onConfigChange({
                                      ...config,
                                      hero: { ...config.hero, imagePosition: `${pos} ${vertical}` },
                                    })
                                  }}
                                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                    isActive
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {pos === "left" ? "Izq" : pos === "center" ? "Centro" : "Der"}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-muted-foreground mb-2">
                            Posición Vertical: {(() => {
                              const pos = config.hero.imagePosition || "center 25%"
                              const vertical = pos.split(" ")[1] || "25%"
                              if (vertical.includes("top")) return "Arriba"
                              if (vertical.includes("bottom")) return "Abajo"
                              return vertical
                            })()}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(() => {
                              const pos = config.hero.imagePosition || "center 25%"
                              const vertical = pos.split(" ")[1] || "25%"
                              const match = vertical.match(/(\d+)%/)
                              return match ? parseInt(match[1]) : 25
                            })()}
                            onChange={(e) => {
                              const horizontal = (config.hero.imagePosition || "center 25%").split(" ")[0] || "center"
                              onConfigChange({
                                ...config,
                                hero: { ...config.hero, imagePosition: `${horizontal} ${e.target.value}%` },
                              })
                            }}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Arriba</span>
                            <span>Abajo</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-muted-foreground mb-2">Valor Personalizado</label>
                          <Input
                            value={config.hero.imagePosition || "center 25%"}
                            onChange={(e) =>
                              onConfigChange({
                                ...config,
                                hero: { ...config.hero, imagePosition: e.target.value },
                              })
                            }
                            placeholder="center 25%"
                            className="text-xs"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ejemplos: "center 25%", "left top", "50% 30%"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Botón Principal</label>
                  <Input
                    value={config.hero.ctaPrimary}
                    onChange={(e) => onConfigChange({ ...config, hero: { ...config.hero, ctaPrimary: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Botón Secundario</label>
                  <Input
                    value={config.hero.ctaSecondary}
                    onChange={(e) => onConfigChange({ ...config, hero: { ...config.hero, ctaSecondary: e.target.value } })}
                  />
                </div>
              </>
            )}

            {selectedSection === "values" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subtítulo</label>
                  <Input
                    value={config.values.subtitle}
                    onChange={(e) => onConfigChange({ ...config, values: { ...config.values, subtitle: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Título</label>
                  <Input
                    value={config.values.title}
                    onChange={(e) => onConfigChange({ ...config, values: { ...config.values, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                  <textarea
                    value={config.values.description}
                    onChange={(e) => onConfigChange({ ...config, values: { ...config.values, description: e.target.value } })}
                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Valores</label>
                  <div className="space-y-3">
                    {config.values.items.map((value, index) => (
                      <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                        <Input
                          value={value.title}
                          onChange={(e) => {
                            const newItems = [...config.values.items]
                            newItems[index].title = e.target.value
                            onConfigChange({ ...config, values: { ...config.values, items: newItems } })
                          }}
                          placeholder="Título del valor"
                        />
                        <textarea
                          value={value.description}
                          onChange={(e) => {
                            const newItems = [...config.values.items]
                            newItems[index].description = e.target.value
                            onConfigChange({ ...config, values: { ...config.values, items: newItems } })
                          }}
                          placeholder="Descripción"
                          className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedSection === "location" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subtítulo</label>
                  <Input
                    value={config.location.subtitle}
                    onChange={(e) => onConfigChange({ ...config, location: { ...config.location, subtitle: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Título</label>
                  <Input
                    value={config.location.title}
                    onChange={(e) => onConfigChange({ ...config, location: { ...config.location, title: e.target.value } })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ciudad</label>
                    <Input
                      value={config.location.city}
                      onChange={(e) => onConfigChange({ ...config, location: { ...config.location, city: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">País</label>
                    <Input
                      value={config.location.country}
                      onChange={(e) => onConfigChange({ ...config, location: { ...config.location, country: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Días</label>
                    <Input
                      value={config.location.schedule.days}
                      onChange={(e) =>
                        onConfigChange({
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
                        onConfigChange({
                          ...config,
                          location: { ...config.location, schedule: { ...config.location.schedule, hours: e.target.value } },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">URL del Mapa</label>
                  <Input
                    value={config.location.mapEmbedUrl}
                    onChange={(e) => onConfigChange({ ...config, location: { ...config.location, mapEmbedUrl: e.target.value } })}
                  />
                </div>
              </>
            )}

            {selectedSection === "navigation" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Texto del Logo</label>
                  <Input
                    value={config.navigation.logoText}
                    onChange={(e) => onConfigChange({ ...config, navigation: { ...config.navigation, logoText: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Logo (Imagen)</label>
                  <div className="flex items-center gap-4 mb-2">
                    {config.navigation.logo && (
                      <img src={config.navigation.logo} alt="Logo" className="h-12 object-contain" />
                    )}
                  </div>
                  <FileUpload
                    value={null}
                    onChange={(file) => file && handleImageUpload(file, "logo")}
                    isUploading={uploadingLogo}
                    required={false}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Instagram</label>
                  <Input
                    value={config.social.instagram}
                    onChange={(e) => onConfigChange({ ...config, social: { ...config.social, instagram: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">LinkedIn</label>
                  <Input
                    value={config.social.linkedin}
                    onChange={(e) => onConfigChange({ ...config, social: { ...config.social, linkedin: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input
                    value={config.social.email}
                    onChange={(e) => onConfigChange({ ...config, social: { ...config.social, email: e.target.value } })}
                  />
                </div>
              </>
            )}

            </div>
          </div>
        )}

        {/* Section Order Panel */}
        {!isEditing && (
          <div className="w-64 border-l border-border bg-card p-4">
            <h3 className="font-serif text-lg text-foreground mb-4">Orden de Secciones</h3>
          <div className="space-y-2">
            {config.sectionOrder.map((sectionId, index) => {
              const isDragging = draggedSection === sectionId
              const isDragOver = dragOverIndex === index && draggedSection && draggedSection !== sectionId
              
              return (
                <div
                  key={sectionId}
                  draggable
                  onDragStart={() => setDraggedSection(sectionId)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverIndex(index)
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === index) {
                      setDragOverIndex(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedSection && draggedSection !== sectionId) {
                      const draggedIndex = config.sectionOrder.indexOf(draggedSection)
                      if (draggedIndex !== -1 && index !== -1) {
                        const newOrder = [...config.sectionOrder]
                        newOrder.splice(draggedIndex, 1)
                        newOrder.splice(index, 0, draggedSection)
                        onConfigChange({ ...config, sectionOrder: newOrder })
                      }
                    }
                    setDraggedSection(null)
                    setDragOverIndex(null)
                  }}
                  onDragEnd={() => {
                    setDraggedSection(null)
                    setDragOverIndex(null)
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-move transition-all ${
                    isDragging
                      ? "opacity-50 bg-accent/20"
                      : isDragOver
                      ? "bg-accent/10 border-2 border-accent border-dashed"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground capitalize">{sectionId}</span>
                </div>
              )
            })}
          </div>
            <p className="text-xs text-muted-foreground mt-4">
              Arrastra para reordenar • Haz clic en cualquier sección para editarla
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

