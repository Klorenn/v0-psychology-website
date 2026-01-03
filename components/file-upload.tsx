"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]

interface FileUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  error?: string
  required?: boolean
  isUploading?: boolean
  label?: string
  accept?: string
}

export function FileUpload({ value, onChange, error, required, isUploading = false, label, accept = ".jpg,.jpeg,.png,.pdf" }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Solo se permiten archivos JPG, PNG o PDF. El tipo de archivo seleccionado no es válido."
    }

    const extension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "Solo se permiten archivos JPG, PNG o PDF. Verifica la extensión del archivo."
    }

    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0)
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      return `El archivo es demasiado grande (${fileSizeMB} MB). El tamaño máximo permitido es ${maxSizeMB} MB.`
    }

    return null
  }

  const handleFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setLocalError(validationError)
      onChange(null)
      return
    }

    setLocalError("")
    onChange(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    onChange(null)
    setLocalError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = () => {
    if (!value) return null
    if (value.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  const displayError = error || localError

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="file-upload">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center transition-colors
            ${dragActive ? "border-accent bg-accent/5" : "border-border/50"}
            ${displayError ? "border-destructive" : ""}
            hover:border-accent/50 cursor-pointer
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            required={required}
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            Arrastre el archivo aquí o haga clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG o PDF (máx. 5MB)</p>
        </div>
      ) : (
        <div className="border border-border/50 rounded-xl p-4 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            ) : (
              getFileIcon()
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground">
                {isUploading ? "Subiendo..." : `${(value.size / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>
          </div>
          {!isUploading && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}

