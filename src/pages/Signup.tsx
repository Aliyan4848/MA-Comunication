import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { UserPlus } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSeo } from "../lib/seo"

export default function Signup() {
  useSeo({ title: "Create Account", path: "/signup", noIndex: true })
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, form.fullName, form.phone)
    setLoading(false)
    if (err) { setError(err); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-bold text-[var(--ma-foreground)] mb-2">Check your email</h1>
          <p className="text-[var(--ma-muted)] text-sm mb-6">
            We sent a verification link to <span className="text-[var(--ma-foreground)]">{form.email}</span>. Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="text-[#2B8EF0] hover:underline text-sm">Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/20 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={20} className="text-[#2B8EF0]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--ma-foreground)]">Create your account</h1>
          <p className="text-[var(--ma-muted)] text-sm mt-1">Track orders and check out faster next time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6">
          <input required placeholder="Full name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
          <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
          <input required placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
          <input required type="password" placeholder="Password (min. 8 characters)" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-[var(--ma-muted)]">
          Already have an account? <Link to="/login" state={location.state} className="text-[#2B8EF0] hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
