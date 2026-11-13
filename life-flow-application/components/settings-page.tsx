"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertTriangle, Check, LockKeyhole, Save, UserRound } from "lucide-react"
import { toast } from "sonner"
import { PageFrame, PageHeading } from "@/components/lifeflow-dashboard"
import {
  changeUserPassword,
  deleteUserAccount,
  getUserProfile,
  logout,
  updateUserProfile,
  type User,
} from "@/lib/api"
import { useAuthStore } from "@/lib/use-auth-store"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(6, "New password must be at least 6 characters long."),
})

export function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "security">("profile")
  const [deleting, setDeleting] = useState(false)
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const clear = useAuthStore((state) => state.clear)

  const profile = useQuery<User>({
    queryKey: ["profile"],
    queryFn: getUserProfile,
  })

  const profileForm = useForm<{ name: string }>({
    resolver: zodResolver(profileSchema),
    values: { name: profile.data?.name || "" },
  })

  const passwordForm = useForm<{ currentPassword: string; newPassword: string }>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  const saveProfile = useMutation({
    mutationFn: (data: { name: string }) => updateUserProfile(data),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated in MongoDB Compass.")
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Could not update profile. Please try again.")
    },
  })

  const savePassword = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => changeUserPassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully.")
      passwordForm.reset()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Could not change password. Check your current password.")
    },
  })

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Permanently delete your account and all associated decisions, simulations, and scenarios from MongoDB? This cannot be undone.",
      )
    ) {
      return
    }

    setDeleting(true)
    try {
      await deleteUserAccount()
      clear()
      toast.success("Account deleted.")
      window.location.href = "/register"
    } catch {
      toast.error("Account could not be deleted. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const signOut = async () => {
    try {
      await logout()
    } catch {
      // Ignored
    }
    clear()
    window.location.href = "/login"
  }

  return (
    <PageFrame>
      <div className="page-content">
        <PageHeading
          eyebrow="ACCOUNT & PREFERENCES"
          title="Settings"
          description="Manage your profile information and security settings stored in MongoDB."
        />

        <div className="settings-layout">
          <aside className="settings-tabs">
            <button
              onClick={() => setTab("profile")}
              className={tab === "profile" ? "settings-tab settings-tab-active" : "settings-tab"}
            >
              <UserRound size={16} /> Profile
            </button>
            <button
              onClick={() => setTab("security")}
              className={tab === "security" ? "settings-tab settings-tab-active" : "settings-tab"}
            >
              <LockKeyhole size={16} /> Security
            </button>
          </aside>

          <section className="settings-content surface">
            {tab === "profile" ? (
              <>
                <div className="settings-section-heading">
                  <h2>User Profile</h2>
                  <p>Your details as registered in the LifeFlow MongoDB database.</p>
                </div>
                <form
                  className="settings-form"
                  onSubmit={profileForm.handleSubmit((values) => saveProfile.mutate(values))}
                >
                  <label className="form-label">
                    Full Name
                    <input {...profileForm.register("name")} placeholder="Your name" />
                    {profileForm.formState.errors.name && (
                      <span className="form-error">{profileForm.formState.errors.name.message}</span>
                    )}
                  </label>

                  <label className="form-label">
                    Email address
                    <input
                      value={profile.data?.email || ""}
                      readOnly
                      placeholder={profile.isLoading ? "Loading profile..." : "No email available"}
                    />
                    <small>Email is your unique MongoDB identifier and cannot be modified directly.</small>
                  </label>

                  <button className="button button-dark" type="submit" disabled={saveProfile.isPending}>
                    <Save size={15} />
                    {saveProfile.isPending ? "Saving changes..." : "Save changes"}
                  </button>
                </form>

                <div className="settings-divider" />

                <div className="settings-section-heading">
                  <h2>Session Management</h2>
                  <p>Log out of your current session on this device.</p>
                </div>
                <button className="button button-outline" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="settings-section-heading">
                  <h2>Change Password</h2>
                  <p>Passwords are securely hashed with 12 bcrypt rounds in MongoDB.</p>
                </div>
                <form
                  className="settings-form"
                  onSubmit={passwordForm.handleSubmit((values) => savePassword.mutate(values))}
                >
                  <label className="form-label">
                    Current Password
                    <input
                      type="password"
                      autoComplete="current-password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <span className="form-error">{passwordForm.formState.errors.currentPassword.message}</span>
                    )}
                  </label>

                  <label className="form-label">
                    New Password
                    <input type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
                    {passwordForm.formState.errors.newPassword && (
                      <span className="form-error">{passwordForm.formState.errors.newPassword.message}</span>
                    )}
                  </label>

                  <button className="button button-dark" type="submit" disabled={savePassword.isPending}>
                    <Check size={15} />
                    {savePassword.isPending ? "Updating password..." : "Update password"}
                  </button>
                </form>

                <div className="danger-zone">
                  <div className="settings-section-heading">
                    <h2>
                      <AlertTriangle size={15} /> Danger Zone
                    </h2>
                    <p>
                      Deleting your account permanently removes your profile, decisions, simulations, and scenarios
                      from the MongoDB database.
                    </p>
                  </div>
                  <button className="button button-danger" disabled={deleting} onClick={deleteAccount}>
                    {deleting ? "Deleting from MongoDB..." : "Delete my account permanently"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </PageFrame>
  )
}
