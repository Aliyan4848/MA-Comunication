import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSeo } from "../lib/seo"

// Reached via the link in a Supabase password-recovery email. Supabase's client
// automatically exchanges the URL token for a temporary recovery session before
// this component mounts (see supabaseClient.ts detectSessionInUrl), so by the
// time we're here `session` is already the user's own — updatePassword just works.
export default function ResetPassword() {
  useSeo({ title: "Set New Password", path: "/reset-password", noIndex: true })
  const { updatePassword, session } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate("/account"), 2000)
      return () => clearTimeout(t)
    }
  }, [done, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirm) { setError("Passwords don't match"); return }
    setLoading(true)
    const { error: err } = await updatePassword(password)
    setLoading(false)
    if (err) { setError(err); return }
    setDone(true)
  }

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={20} className="text-[#2B8EF0]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--ma-foreground)]">Set a new password</h1>
        </div>

        {done ? (
          <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--ma-foreground)]">Password updated. Redirecting to your account...</p>
          </div>
        ) : !session ? (
          <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--ma-muted)]">This reset link is invalid or has expired. Request a new one from the Forgot Password page.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6">
            <input required type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
            <input required type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
