import { create } from "zustand"
import { getCurrentUser, type User } from "./api"

type AuthState = {
  user: User | null
  loading: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  clear: () => void
  fetchUser: () => Promise<User | null>
}

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("lifeflow-user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize with null so Server and Initial Client Render match identically without hydration mismatch
  user: null,
  loading: true,
  isInitialized: false,

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        window.localStorage.setItem("lifeflow-user", JSON.stringify(user))
      } else {
        window.localStorage.removeItem("lifeflow-user")
      }
    }
    set({ user, loading: false, isInitialized: true })
  },

  clear: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("lifeflow-user")
      window.localStorage.removeItem("lifeflow-token")
    }
    set({ user: null, loading: false, isInitialized: true })
  },

  fetchUser: async () => {
    if (typeof window === "undefined") return null

    // Immediately restore cached user on the client after mount
    const cached = getStoredUser()
    if (cached) {
      set({ user: cached, loading: false, isInitialized: true })
    }

    const token = window.localStorage.getItem("lifeflow-token")
    if (!token) {
      set({ user: null, loading: false, isInitialized: true })
      return null
    }

    try {
      const user = await getCurrentUser()
      if (user) {
        window.localStorage.setItem("lifeflow-user", JSON.stringify(user))
        set({ user, loading: false, isInitialized: true })
        return user
      }
    } catch {
      // Token might be expired or invalid
      window.localStorage.removeItem("lifeflow-user")
      window.localStorage.removeItem("lifeflow-token")
      set({ user: null, loading: false, isInitialized: true })
    }
    return null
  },
}))
