import { useState } from "react"
import { Link } from "react-router-dom"
import { KeyRound } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSeo } from "../lib/seo"

export default function ForgotPassword() {
  useSeo({ title: "Reset Password", path: "/forgot-password", noIndex: true })
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await sendPasswordReset(email)
    setLoading(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/20 flex items-center justify-center mx-auto mb-4">
            <KeyRound size={20} className="text-[#2B8EF0]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--ma-foreground)]">Reset your password</h1>
          <p className="text-[var(--ma-muted)] text-sm mt-1">We'll email you a link to set a new one.</p>
        </div>

        {sent ? (
          <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--ma-foreground)]">Check <span className="font-medium">{email}</span> for a reset link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6">
            <input required type="email" placeholder="Your account email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center mt-5 text-sm text-[var(--ma-muted)]">
          <Link to="/login" className="text-[#2B8EF0] hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
