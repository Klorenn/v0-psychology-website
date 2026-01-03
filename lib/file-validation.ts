/**
 * Validación mejorada de archivos usando magic bytes
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"] as const

// Magic bytes para diferentes formatos de imagen
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Verificar magic bytes de un archivo
 */
async function verifyMagicBytes(file: File, expectedMimeType: string): Promise<boolean> {
  const magicBytes = MAGIC_BYTES[expectedMimeType]
  if (!magicBytes) {
    // Si no tenemos magic bytes para este tipo, confiar en el MIME type
    return true
  }

  try {
    const arrayBuffer = await file.slice(0, magicBytes.length).arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    for (let i = 0; i < magicBytes.length; i++) {
      if (bytes[i] !== magicBytes[i]) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validar dimensiones de imagen
 */
async function validateImageDimensions(
  file: File,
  maxWidth: number = 4000,
  maxHeight: number = 4000
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Las dimensiones de la imagen (${img.width}x${img.height}) exceden el máximo permitido (${maxWidth}x${maxHeight})`,
        })
      } else {
        resolve({ valid: true })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: "No se pudo leer las dimensiones de la imagen",
      })
    }

    img.src = url
  })
}

/**
 * Validar archivo de imagen de forma completa
 */
export async function validateImageFile(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: readonly string[]
    validateDimensions?: boolean
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<FileValidationResult> {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = ALLOWED_TYPES,
    validateDimensions = false,
    maxWidth = 4000,
    maxHeight = 4000,
  } = options

  // Validar tamaño
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB`,
    }
  }

  // Validar tipo MIME
  if (!allowedTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Solo se aceptan: ${allowedTypes.join(", ")}`,
    }
  }

  // Validar extensión
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext))
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Extensión de archivo no permitida. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(", ")}`,
    }
  }

  // Verificar magic bytes
  const magicBytesValid = await verifyMagicBytes(file, file.type)
  if (!magicBytesValid) {
    return {
      valid: false,
      error: "El archivo no coincide con su tipo MIME. Posible archivo corrupto o malicioso.",
    }
  }

  // Validar dimensiones si se solicita
  if (validateDimensions) {
    const dimensionResult = await validateImageDimensions(file, maxWidth, maxHeight)
    if (!dimensionResult.valid) {
      return dimensionResult
    }
  }

  return { valid: true }
}

/**
 * Sanitizar nombre de archivo
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100)
}

/**
 * Obtener extensión de archivo basada en MIME type
 */
export function getFileExtension(fileName: string, mimeType: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  if (ALLOWED_EXTENSIONS.includes(`.${extension}` as any)) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
    }

    if (mimeToExt[mimeType] && mimeToExt[mimeType] === extension) {
      return extension
    }

    return mimeToExt[mimeType] || "jpg"
  }

  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
  }

  return mimeToExt[mimeType] || "jpg"
}

