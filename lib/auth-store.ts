const ADMIN_CREDENTIALS = {
  email: "psicologa@clinica.cl",
  password: "123456",
}

let isAuthenticated = false
let authListeners: (() => void)[] = []

export const authStore = {
  isAuthenticated: () => isAuthenticated,

  login: (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      isAuthenticated = true
      notifyAuthListeners()
      return true
    }
    return false
  },

  logout: () => {
    isAuthenticated = false
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
