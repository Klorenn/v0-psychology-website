/**
 * Filtro de palabras vulgares
 * Lista básica de palabras que deben ser filtradas
 */

const PROFANITY_WORDS = [
  // Palabras vulgares comunes en español
  "puta", "puto", "putas", "putos",
  "hijo de puta", "hija de puta",
  "mierda", "mierdas",
  "coño", "coños",
  "joder", "jodido", "jodida", "jodidos", "jodidas",
  "cabrón", "cabrona", "cabrones", "cabronas",
  "maricón", "maricones",
  "culero", "culera", "culeros", "culeras",
  "pendejo", "pendeja", "pendejos", "pendejas",
  "chingar", "chingado", "chingada", "chingados", "chingadas",
  "verga", "vergas",
  "pinche", "pinches",
  "mamada", "mamadas",
  "chinga tu madre",
  // Variaciones con asteriscos
  "p*ta", "p*t*", "m*erda", "c*ño", "j*der",
  // Otras palabras ofensivas
  "idiota", "imbécil", "estúpido", "estúpida",
]

/**
 * Verifica si un texto contiene palabras vulgares
 */
export function containsProfanity(text: string): boolean {
  const normalizedText = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^\w\s]/g, " ") // Reemplazar caracteres especiales con espacios
    .replace(/\s+/g, " ") // Normalizar espacios
  
  return PROFANITY_WORDS.some(word => {
    const normalizedWord = word.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    
    // Buscar la palabra como palabra completa (no como parte de otra)
    const regex = new RegExp(`\\b${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(normalizedText)
  })
}

/**
 * Filtra palabras vulgares reemplazándolas con asteriscos
 */
export function filterProfanity(text: string): string {
  let filtered = text
  const normalizedText = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  
  PROFANITY_WORDS.forEach(word => {
    const normalizedWord = word.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    
    const regex = new RegExp(`\\b${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    filtered = filtered.replace(regex, (match) => {
      return '*'.repeat(match.length)
    })
  })
  
  return filtered
}

