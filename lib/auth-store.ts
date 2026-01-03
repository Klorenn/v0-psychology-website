// Sistema de autenticación mejorado usando JWT del servidor
// Las credenciales ahora están en el servidor (ADMIN_EMAIL, ADMIN_PASSWORD)
// y se usa JWT para mantener la sesión

const AUTH_KEY = "psychology_dashboard_auth_token"

// Función para verificar token con el servidor
async function verifyTokenWithServer(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.ok && (await response.json()).authenticated === true
  } catch {
    return false
  }
}

// Función para obtener el estado inicial desde localStorage
async function getInitialAuthState(): Promise<boolean> {
  if (typeof window === "undefined") return false
  try {
    const token = localStorage.getItem(AUTH_KEY)
    if (token) {
      // Verificar con el servidor
      const isValid = await verifyTokenWithServer(token)
      if (!isValid) {
        localStorage.removeItem(AUTH_KEY)
        return false
      }
      return true
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
let isInitializing = false

// Inicializar inmediatamente si estamos en el cliente
// Esto se ejecuta ANTES de cualquier componente React
if (typeof window !== "undefined") {
  isInitializing = true
  getInitialAuthState()
    .then((authenticated) => {
      isAuthenticated = authenticated
      isInitialized = true
      isInitializing = false
      notifyAuthListeners()
    })
    .catch((error) => {
      console.error("Error inicializando autenticación:", error)
      isAuthenticated = false
      isInitialized = true
      isInitializing = false
      notifyAuthListeners()
    })
}

export const authStore = {
  isAuthenticated: () => {
    return isAuthenticated
  },
  
  // Método para restaurar sesión verificando con el servidor
  restoreSession: async (): Promise<boolean> => {
    if (typeof window === "undefined") return false
    
    try {
      const token = localStorage.getItem(AUTH_KEY)
      if (!token) {
        if (isAuthenticated) {
          isAuthenticated = false
          notifyAuthListeners()
        }
        return false
      }

      const isValid = await verifyTokenWithServer(token)
      if (isValid) {
        if (!isAuthenticated) {
          isAuthenticated = true
          notifyAuthListeners()
        }
        return true
      } else {
        localStorage.removeItem(AUTH_KEY)
        if (isAuthenticated) {
          isAuthenticated = false
          notifyAuthListeners()
        }
        return false
      }
    } catch (error) {
      console.error("Error restaurando sesión:", error)
      if (isAuthenticated) {
        isAuthenticated = false
        notifyAuthListeners()
      }
      return false
    }
  },
  
  // Verificar si está inicializado
  isInitialized: () => isInitialized,

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      if (data.success && data.token) {
        // Guardar token en localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(AUTH_KEY, data.token)
          } catch {
            // Si no se puede guardar, continuar de todas formas
          }
        }
        isAuthenticated = true
        notifyAuthListeners()
        return true
      }
      return false
    } catch (error) {
      console.error("Error en login:", error)
      return false
    }
  },

  // Obtener token para usar en requests
  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(AUTH_KEY)
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
