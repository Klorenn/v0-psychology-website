// ⚠️ IMPORTANTE: Configura estas variables en .env.local
// NEXT_PUBLIC_ADMIN_EMAIL=tu-email@ejemplo.com
// NEXT_PUBLIC_ADMIN_PASSWORD=tu-contraseña-segura
// Nota: Estas variables son públicas (NEXT_PUBLIC_*) y se exponen al cliente.
// Para mayor seguridad, considera implementar autenticación en el servidor.
const ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "",
}

const AUTH_KEY = "psychology_dashboard_auth"

// Función para obtener el estado inicial desde localStorage
function getInitialAuthState(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const { email, timestamp } = JSON.parse(stored)
      // Verificar que sea el email correcto y que no haya expirado (24 horas)
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000
      if (email === ADMIN_CREDENTIALS.email && !isExpired) {
        return true
      } else {
        // Limpiar si está expirado o incorrecto
        localStorage.removeItem(AUTH_KEY)
      }
    }
  } catch {
    // Si hay error al leer, asumir no autenticado
  }
  return false
}

// Inicializar desde localStorage si está disponible
let isAuthenticated = false
let authListeners: (() => void)[] = []
let isInitialized = false

// Inicializar inmediatamente si estamos en el cliente
// Esto se ejecuta ANTES de cualquier componente React
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const { email, timestamp } = JSON.parse(stored)
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000
      if (email === ADMIN_CREDENTIALS.email && !isExpired) {
        isAuthenticated = true
      } else {
        // Limpiar si está expirado o incorrecto
        localStorage.removeItem(AUTH_KEY)
        isAuthenticated = false
      }
    }
    isInitialized = true
  } catch (error) {
    console.error("Error inicializando autenticación:", error)
    isAuthenticated = false
    isInitialized = true
  }
}

export const authStore = {
  isAuthenticated: () => {
    // Verificar localStorage cada vez por si cambió en otra pestaña
    if (typeof window !== "undefined") {
      try {
        const stored = getInitialAuthState()
        if (stored !== isAuthenticated) {
          isAuthenticated = stored
          notifyAuthListeners()
        }
      } catch (error) {
        // Si hay error, mantener el estado actual
        console.error("Error verificando autenticación:", error)
      }
    }
    return isAuthenticated
  },
  
  // Método para restaurar sesión sin contraseña (útil después de redirecciones)
  // Este método sincroniza el estado interno con localStorage
  restoreSession: () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(AUTH_KEY)
        if (stored) {
          const { email, timestamp } = JSON.parse(stored)
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000
          if (email === ADMIN_CREDENTIALS.email && !isExpired) {
            // Restaurar el estado interno solo si cambió
            if (!isAuthenticated) {
              isAuthenticated = true
              notifyAuthListeners()
            }
            return true
          } else {
            // Limpiar si está expirado o incorrecto
            localStorage.removeItem(AUTH_KEY)
            if (isAuthenticated) {
              isAuthenticated = false
              notifyAuthListeners()
            }
          }
        } else {
          if (isAuthenticated) {
            isAuthenticated = false
            notifyAuthListeners()
          }
        }
      } catch (error) {
        console.error("Error restaurando sesión:", error)
        if (isAuthenticated) {
          isAuthenticated = false
          notifyAuthListeners()
        }
      }
    }
    return isAuthenticated
  },
  
  // Verificar si está inicializado
  isInitialized: () => isInitialized,

  login: (email: string, password: string): boolean => {
    // Debug: verificar si las credenciales están configuradas (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log("Admin email configurado:", ADMIN_CREDENTIALS.email ? "Sí" : "No")
      console.log("Admin password configurado:", ADMIN_CREDENTIALS.password ? "Sí" : "No")
    }
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      isAuthenticated = true
      // Guardar en localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(AUTH_KEY, JSON.stringify({
            email: ADMIN_CREDENTIALS.email,
            timestamp: Date.now(),
          }))
        } catch {
          // Si no se puede guardar, continuar de todas formas
        }
      }
      notifyAuthListeners()
      return true
    }
    return false
  },

  logout: () => {
    isAuthenticated = false
    // Limpiar localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AUTH_KEY)
      } catch {
        // Si no se puede limpiar, continuar de todas formas
      }
    }
    notifyAuthListeners()
  },

  subscribe: (listener: () => void) => {
    authListeners = [...authListeners, listener]
    return () => {
      authListeners = authListeners.filter((l) => l !== listener)
    }
  },
}

function notifyAuthListeners() {
  authListeners.forEach((l) => l())
}
