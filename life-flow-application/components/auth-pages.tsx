"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react"
import { toast } from "sonner"
import { getGithubAuthUrl, getGoogleAuthUrl, login, register } from "@/lib/api"
import { useAuthStore } from "@/lib/use-auth-store"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.44 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.28 2.56 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register"
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const oauthErrorShownRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || oauthErrorShownRef.current) return
    const params = new URLSearchParams(window.location.search)
    const err = params.get("error")
    if (!err) return

    oauthErrorShownRef.current = true
    const cleanUrl = `${window.location.pathname}${window.location.hash || ""}`
    window.history.replaceState({}, "", cleanUrl)

    let message = "Google sign-in failed. Please try again or use your password."
    if (err === "state_mismatch" || err.toLowerCase().includes("state mismatch")) {
      message = "Authentication session expired. Please try again."
    } else if (err === "missing_code" || err.toLowerCase().includes("code missing")) {
      message = "Sign-in was cancelled or authorization code was missing."
    } else if (err === "access_denied") {
      message = "Sign-in was cancelled."
    } else if (err === "google_disabled") {
      message = "Google OAuth is not configured on the backend."
    } else if (err === "github_disabled") {
      message = "GitHub OAuth is not configured on the backend."
    } else if (err.trim()) {
      message = err
    }

    toast.error(message, { id: "oauth-error" })
  }, [])

  const form = useForm<{ name: string; email: string; password: string }>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema) as never,
    defaultValues: { name: "", email: "", password: "" },
  })

  const submit = form.handleSubmit(async (values) => {
    setPending(true)
    try {
      const data = isRegister
        ? await register(values)
        : await login({ email: values.email, password: values.password })

      if (data.token) {
        window.localStorage.setItem("lifeflow-token", data.token)
      }
      setUser(data.user || null)
      toast.success(isRegister ? "Account created and stored in MongoDB." : "Welcome back to your workspace.")
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Authentication failed. Please verify your credentials.")
    } finally {
      setPending(false)
    }
  })

  const handleGoogleSignIn = () => {
    window.location.href = getGoogleAuthUrl(true)
  }

  const handleGithubSignIn = () => {
    window.location.href = getGithubAuthUrl()
  }

  return (
    <main className="auth-screen">
      <Link href="/dashboard" className="brand auth-brand">
        <img
          src="/logo.png"
          alt="LifeFlow Logo"
          style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }}
        />
        <span>
          life<span className="brand-light">flow</span>
        </span>
      </Link>
      <section className="auth-card">
        <span className="eyebrow">MONGODB AUTHENTICATION</span>
        <h1>{isRegister ? "Create your workspace" : "Welcome back"}</h1>
        <p className="auth-description">
          {isRegister
            ? "Your user profile and decisions are securely stored in MongoDB Atlas."
            : "Sign in to access your saved decisions and simulations."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button
            type="button"
            className="button-google"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="button-google"
            style={{ color: "#24292f" }}
            onClick={handleGithubSignIn}
          >
            <GithubIcon />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={submit} className="auth-form">
          {isRegister && (
            <label className="form-label">
              Full Name
              <span className="auth-input">
                <UserRound size={16} />
                <input {...form.register("name")} placeholder="e.g. Alex Morgan" autoComplete="name" />
              </span>
              {form.formState.errors.name && (
                <span className="form-error">{form.formState.errors.name.message}</span>
              )}
            </label>
          )}

          <label className="form-label">
            Email address
            <span className="auth-input">
              <Mail size={16} />
              <input
                {...form.register("email")}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </span>
            {form.formState.errors.email && (
              <span className="form-error">{form.formState.errors.email.message}</span>
            )}
          </label>

          <label className="form-label">
            Password
            <span className="auth-input">
              <LockKeyhole size={16} />
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder={isRegister ? "At least 6 characters" : "Enter password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
            {form.formState.errors.password && (
              <span className="form-error">{form.formState.errors.password.message}</span>
            )}
          </label>

          <button className="button button-dark auth-submit" type="submit" disabled={pending}>
            {pending ? "Authenticating..." : isRegister ? "Create Account in Database" : "Sign in to Workspace"}
            <ArrowRight size={15} />
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already registered?" : "New to LifeFlow?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in instead" : "Create an account"}
          </Link>
        </p>
      </section>
      <p className="auth-footnote">Backed by MongoDB Atlas / Compass. Decisions and simulations securely encrypted.</p>
    </main>
  )
}
