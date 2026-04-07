"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/file-upload"
import { Plus, Trash2, BookOpen, GraduationCap, Image as ImageIcon, X } from "lucide-react"
import type { SiteConfig } from "@/lib/site-config"
import { authenticatedFetch } from "@/lib/api-client"

interface CoursesAndReadingsEditorProps {
  config: SiteConfig
  onConfigChange: (config: SiteConfig) => void
  onSave: () => Promise<void>
}

export function CoursesAndReadingsEditor({
  config,
  onConfigChange,
  onSave,
}: CoursesAndReadingsEditorProps) {
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})

  const handleImageUpload = async (file: File, type: "course" | "reading" | "additional", id?: string) => {
    const key = `${type}-${id || "new"}`
    setUploadingImages((prev) => ({ ...prev, [key]: true }))
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "additional")
      
      const response = await authenticatedFetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (type === "additional" && id) {
          const newImages = config.additionalImages?.images.map((img) =>
            img.id === id ? { ...img, url: data.url } : img
          ) || []
          onConfigChange({
            ...config,
            additionalImages: {
              ...config.additionalImages,
              enabled: config.additionalImages?.enabled || true,
              images: newImages,
            },
          })
        } else if (type === "reading" && id) {
          const newItems = config.readingRecommendations?.items.map((item) =>
            item.id === id ? { ...item, coverImage: data.url } : item
          ) || []
          onConfigChange({
            ...config,
            readingRecommendations: {
              ...config.readingRecommendations,
              enabled: config.readingRecommendations?.enabled || true,
              items: newItems,
            },
          })
        }
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error)
    } finally {
      setUploadingImages((prev) => ({ ...prev, [key]: false }))
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

  const addCourse = () => {
    const newCourse = {
      id: Date.now().toString(),
      title: "",
      institution: "",
      year: "",
      description: "",
      certificateUrl: "",
    }
    onConfigChange({
      ...config,
      courses: {
        enabled: true,
        items: [...(config.courses?.items || []), newCourse],
      },
    })
  }

  const removeCourse = (id: string) => {
    const newItems = config.courses?.items.filter((item) => item.id !== id) || []
    onConfigChange({
      ...config,
      courses: {
        ...config.courses,
        items: newItems,
        enabled: newItems.length > 0,
      },
    })
  }

  const updateCourse = (id: string, field: string, value: string) => {
    const newItems = config.courses?.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ) || []
    onConfigChange({
      ...config,
      courses: {
        ...config.courses,
        enabled: true,
        items: newItems,
      },
    })
  }

  const addReading = () => {
    const newReading = {
      id: Date.now().toString(),
      title: "",
      author: "",
      description: "",
      coverImage: "",
      link: "",
    }
    onConfigChange({
      ...config,
      readingRecommendations: {
        enabled: true,
        items: [...(config.readingRecommendations?.items || []), newReading],
      },
    })
  }

  const removeReading = (id: string) => {
    const newItems = config.readingRecommendations?.items.filter((item) => item.id !== id) || []
    onConfigChange({
      ...config,
      readingRecommendations: {
        ...config.readingRecommendations,
        items: newItems,
        enabled: newItems.length > 0,
      },
    })
  }

  const updateReading = (id: string, field: string, value: string) => {
    const newItems = config.readingRecommendations?.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ) || []
    onConfigChange({
      ...config,
      readingRecommendations: {
        ...config.readingRecommendations,
        enabled: true,
        items: newItems,
      },
    })
  }

  const addImage = () => {
    const newImage = {
      id: Date.now().toString(),
      url: "",
      alt: "",
      caption: "",
    }
    onConfigChange({
      ...config,
      additionalImages: {
        enabled: true,
        images: [...(config.additionalImages?.images || []), newImage],
      },
    })
  }

  const removeImage = (id: string) => {
    const newImages = config.additionalImages?.images.filter((img) => img.id !== id) || []
    onConfigChange({
      ...config,
      additionalImages: {
        ...config.additionalImages,
        images: newImages,
        enabled: newImages.length > 0,
      },
    })
  }

  const updateImage = (id: string, field: string, value: string) => {
    const newImages = config.additionalImages?.images.map((img) =>
      img.id === id ? { ...img, [field]: value } : img
    ) || []
    onConfigChange({
      ...config,
      additionalImages: {
        ...config.additionalImages,
        enabled: true,
        images: newImages,
      },
    })
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-accent" />
          Cursos y Diplomados
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Agrega tus cursos y diplomados. Solo aparecerán en el sitio si los añades aquí.
        </p>

        <div className="space-y-4">
          {(config.courses?.items || []).map((course) => (
            <div key={course.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Curso/Diplomado</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCourse(course.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="Título del curso o diplomado"
                value={course.title}
                onChange={(e) => updateCourse(course.id, "title", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Institución"
                  value={course.institution || ""}
                  onChange={(e) => updateCourse(course.id, "institution", e.target.value)}
                />
                <Input
                  placeholder="Año"
                  value={course.year || ""}
                  onChange={(e) => updateCourse(course.id, "year", e.target.value)}
                />
              </div>
              <textarea
                placeholder="Descripción (opcional)"
                value={course.description || ""}
                onChange={(e) => updateCourse(course.id, "description", e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
              <Input
                placeholder="URL del certificado (opcional)"
                value={course.certificateUrl || ""}
                onChange={(e) => updateCourse(course.id, "certificateUrl", e.target.value)}
              />
            </div>
          ))}

          <Button onClick={addCourse} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Curso o Diplomado
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          Recomendaciones de Lecturas
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Agrega libros que recomiendes. Aparecerán en el modal "Conozca más".
        </p>

        <div className="space-y-4">
          {(config.readingRecommendations?.items || []).map((reading) => (
            <div key={reading.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Libro</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReading(reading.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Título del libro"
                  value={reading.title}
                  onChange={(e) => updateReading(reading.id, "title", e.target.value)}
                />
                <Input
                  placeholder="Autor"
                  value={reading.author || ""}
                  onChange={(e) => updateReading(reading.id, "author", e.target.value)}
                />
              </div>
              <textarea
                placeholder="Descripción o por qué lo recomiendas"
                value={reading.description || ""}
                onChange={(e) => updateReading(reading.id, "description", e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Portada del libro</label>
                  {reading.coverImage ? (
                    <div className="relative">
                      <img
                        src={reading.coverImage}
                        alt={reading.title}
                        className="w-20 h-28 object-cover rounded border border-border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateReading(reading.id, "coverImage", "")}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <FileUpload
                      value={null}
                      onChange={(file) => file && handleImageUpload(file, "reading", reading.id)}
                      isUploading={uploadingImages[`reading-${reading.id}`]}
                      required={false}
                      accept=".jpg,.jpeg,.png"
                    />
                  )}
                </div>
                <Input
                  placeholder="Link de compra (opcional)"
                  value={reading.link || ""}
                  onChange={(e) => updateReading(reading.id, "link", e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button onClick={addReading} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Recomendación de Lectura
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          Imágenes Adicionales (máximo 3)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Agrega hasta 3 imágenes adicionales que aparecerán en el modal "Conozca más".
        </p>

        <div className="space-y-4">
          {(config.additionalImages?.images || []).slice(0, 3).map((image) => (
            <div key={image.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Imagen {(config.additionalImages?.images ?? []).indexOf(image) + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(image.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {image.url ? (
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateImage(image.id, "url", "")}
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <FileUpload
                  value={null}
                  onChange={(file) => file && handleImageUpload(file, "additional", image.id)}
                  isUploading={uploadingImages[`additional-${image.id}`]}
                  required={false}
                  accept=".jpg,.jpeg,.png"
                />
              )}
              <Input
                placeholder="Texto alternativo (alt)"
                value={image.alt}
                onChange={(e) => updateImage(image.id, "alt", e.target.value)}
              />
              <Input
                placeholder="Descripción o pie de foto (opcional)"
                value={image.caption || ""}
                onChange={(e) => updateImage(image.id, "caption", e.target.value)}
              />
            </div>
          ))}

          {(config.additionalImages?.images || []).length < 3 && (
            <Button onClick={addImage} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Imagen
            </Button>
          )}
          {(config.additionalImages?.images || []).length >= 3 && (
            <p className="text-xs text-muted-foreground text-center">
              Has alcanzado el máximo de 3 imágenes
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  )
}

