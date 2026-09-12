import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { LogIn } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSeo } from "../lib/seo"

export default function Login() {
  useSeo({ title: "Sign In", path: "/login", noIndex: true })
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    const redirectTo = location.state?.from || "/account"
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/20 flex items-center justify-center mx-auto mb-4">
            <LogIn size={20} className="text-[#2B8EF0]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--ma-foreground)]">Welcome back</h1>
          <p className="text-[var(--ma-muted)] text-sm mt-1">Sign in to track orders and manage your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-6">
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username"
            className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
            className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-[#2B8EF0] hover:underline">Forgot password?</Link>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm mt-2">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-[var(--ma-muted)]">
          Don't have an account? <Link to="/signup" state={location.state} className="text-[#2B8EF0] hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
