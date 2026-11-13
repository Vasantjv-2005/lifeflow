"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react"
import { toast } from "sonner"
import { login, register } from "@/lib/api"
import { useAuthStore } from "@/lib/use-auth-store"

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
            ? "Your user profile and decisions are securely stored in MongoDB Compass."
            : "Sign in to access your saved decisions and simulations."}
        </p>
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
