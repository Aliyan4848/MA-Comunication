import { useEffect } from "react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { User, MapPin, Package, LogOut } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useSeo } from "../../lib/seo"
import { supabase } from "../../lib/supabaseClient"

const tabs = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/orders", label: "My Orders", icon: Package },
]

export default function AccountLayout() {
  useSeo({ title: "My Account", path: "/account", noIndex: true })
  const { session, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login", { replace: true, state: { from: location.pathname } })
    }
  }, [loading, session, navigate, location.pathname])

  useEffect(() => {
    if (!session) return
    // Idempotent: matches any guest orders placed with this account's email
    // and attaches them, so they show up in My Orders even if placed before signup.
    ;(async () => {
      try {
        await supabase.rpc("link_guest_orders_to_account")
      } catch {
        /* non-critical */
      }
    })()
  }, [session])

  if (loading) {
    return <div className="pt-28 min-h-screen flex items-center justify-center"><p className="text-[var(--ma-muted)] text-sm">Loading...</p></div>
  }
  if (!session) return null

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <div className="pt-24 min-h-screen max-w-4xl mx-auto px-4 pb-16">
      <h1 className="text-2xl font-bold text-[var(--ma-foreground)] mb-6">My Account</h1>
      <div className="flex gap-6">
        <aside className="w-48 shrink-0 hidden sm:block">
          <nav className="space-y-1">
            {tabs.map(t => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive ? "bg-[#2B8EF0]/10 text-[#2B8EF0]" : "text-[var(--ma-muted)] hover:bg-[var(--ma-card)] hover:text-[var(--ma-foreground)]"
                  }`
                }
              >
                <t.icon size={16} /> {t.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/5 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[var(--ma-card)] border-t border-[var(--ma-border)] flex z-30">
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] ${isActive ? "text-[#2B8EF0]" : "text-[var(--ma-muted)]"}`}>
              <t.icon size={16} /> {t.label}
            </NavLink>
          ))}
        </div>

        <div className="flex-1 min-w-0 pb-16 sm:pb-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
