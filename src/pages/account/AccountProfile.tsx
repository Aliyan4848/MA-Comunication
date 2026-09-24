import { useEffect, useState } from "react"
import { useStore } from "../../contexts/StoreContext"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../contexts/ToastContext"
import ThemeSelector from "../../components/ui/ThemeSelector"

export default function AccountProfile() {
  const { fetchMyProfile, updateMyProfile } = useStore()
  const { session, updatePassword } = useAuth()
  const { toast } = useToast()
  const [form, setForm] = useState({ fullName: "", phone: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [passSaving, setPassSaving] = useState(false)

  useEffect(() => {
    fetchMyProfile().then(p => { if (p) setForm(p); setLoading(false) })
  }, [fetchMyProfile])

  const save = async () => {
    setSaving(true)
    try {
      await updateMyProfile(form.fullName, form.phone)
      toast("Profile updated")
    } catch (e: any) {
      toast(e.message || "Failed to update profile", "error")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (newPassword.length < 8) { toast("Password must be at least 8 characters", "error"); return }
    setPassSaving(true)
    const { error } = await updatePassword(newPassword)
    setPassSaving(false)
    if (error) { toast(error, "error"); return }
    setNewPassword("")
    toast("Password updated")
  }

  if (loading) return <p className="text-[var(--ma-muted)] text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[var(--ma-foreground)] mb-4">Personal Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Full Name</label>
            <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none focus:border-[#2B8EF0]/50" />
          </div>
          <div>
            <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none focus:border-[#2B8EF0]/50" />
          </div>
          <div>
            <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Email</label>
            <input disabled value={session?.user.email || ""} className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-muted)] opacity-60" />
          </div>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-all">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[var(--ma-foreground)] mb-4">Appearance</h2>
        <ThemeSelector />
      </div>

      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[var(--ma-foreground)] mb-4">Change Password</h2>
        <div className="flex gap-2">
          <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="flex-1 bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none focus:border-[#2B8EF0]/50" />
          <button onClick={changePassword} disabled={passSaving || !newPassword} className="px-4 py-2 bg-white/5 hover:bg-[var(--ma-card-hover)] border border-[var(--ma-border)] text-[var(--ma-foreground)] text-sm rounded-xl disabled:opacity-50 transition-all shrink-0">
            {passSaving ? "..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  )
}
