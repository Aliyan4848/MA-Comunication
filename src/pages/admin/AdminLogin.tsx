import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Zap, Eye, EyeOff, Lock } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { settings } = useStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setTimeout(() => {
      if (password === settings.adminPassword) {
        sessionStorage.setItem("ma_admin_auth", "1")
        navigate("/admin/dashboard", { replace: true })
      } else {
        setError("Incorrect password. Please try again.")
        setLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2B8EF0]/20 border border-[#2B8EF0]/30 flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-[#2B8EF0]" />
          </div>
          <h1 className="text-xl font-bold text-white">MA Communication</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
        </div>

        <div className="rounded-2xl bg-[#10151D] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={14} className="text-gray-500" />
            <p className="text-xs text-gray-500">Secure admin access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Admin Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoFocus
                  className="w-full bg-[#0A0F16] border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/50 transition-colors"
                />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50">
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-700 text-center mt-4">Default password: admin123</p>
        </div>

        <p className="text-center mt-6 text-xs text-gray-700">
          <a href="/" className="hover:text-gray-500 transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  )
}
