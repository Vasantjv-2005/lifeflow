import { create } from "zustand"
import { getCurrentUser, logout as apiLogout, type User } from "./api"

type AuthState = {
  user: User | null
  loading: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  clear: () => void
  logout: () => Promise<void>
  fetchUser: () => Promise<User | null>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isInitialized: false,

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        window.localStorage.setItem("lifeflow-user", JSON.stringify(user))
      } else {
        window.localStorage.removeItem("lifeflow-user")
        window.localStorage.removeItem("lifeflow-token")
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

  logout: async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore if session already invalid
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("lifeflow-user")
        window.localStorage.removeItem("lifeflow-token")
      }
      set({ user: null, loading: false, isInitialized: true })
    }
  },

  fetchUser: async () => {
    if (typeof window === "undefined") return null

    try {
      // Always verify the session directly against the backend MongoDB current-user API
      const user = await getCurrentUser()
      if (user && user.id) {
        window.localStorage.setItem("lifeflow-user", JSON.stringify(user))
        set({ user, loading: false, isInitialized: true })
        return user
      }
    } catch {
      // 401 or no valid session: strictly ensure no stale cached user remains
      window.localStorage.removeItem("lifeflow-user")
      window.localStorage.removeItem("lifeflow-token")
      set({ user: null, loading: false, isInitialized: true })
    }

    set({ user: null, loading: false, isInitialized: true })
    return null
  },
}))
