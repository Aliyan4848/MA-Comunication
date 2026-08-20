import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Home, Settings,
  LogOut, Zap, Menu, X, ChevronRight
} from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/categories", icon: Tag, label: "Categories" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/homepage", icon: Home, label: "Homepage" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
]

function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!sessionStorage.getItem("ma_admin_auth")) {
      navigate("/admin", { replace: true })
    }
  }, [navigate])
  if (!sessionStorage.getItem("ma_admin_auth")) return null
  return <>{children}</>
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { orders, products } = useStore()

  const pendingOrders = orders.filter(o => o.status === "pending").length
  const lowStock = products.filter(p => p.stock <= p.lowStockThreshold && p.published).length

  const handleLogout = () => {
    sessionStorage.removeItem("ma_admin_auth")
    navigate("/admin", { replace: true })
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}>
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-8 h-8 rounded-xl bg-[#2B8EF0]/20 border border-[#2B8EF0]/30 flex items-center justify-center">
          <Zap size={15} className="text-[#2B8EF0]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">MA Admin</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Management Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[#2B8EF0]/10 text-[#2B8EF0] border border-[#2B8EF0]/20"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={16} />
            <span>{item.label}</span>
            {item.label === "Orders" && pendingOrders > 0 && (
              <span className="ml-auto text-[10px] bg-[#2B8EF0] text-white px-1.5 py-0.5 rounded-full font-bold">{pendingOrders}</span>
            )}
            {item.label === "Products" && lowStock > 0 && (
              <span className="ml-auto text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">{lowStock}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 pt-4 space-y-2">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <ChevronRight size={15} />
          View Website
        </a>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#05070A] flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-[#0A0F16] border-r border-white/5 h-screen sticky top-0">
          <Sidebar />
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-[#0A0F16] border-r border-white/5 z-50 lg:hidden"
              >
                <Sidebar mobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Topbar */}
          <div className="sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 py-4 bg-[#05070A]/90 backdrop-blur border-b border-white/5">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <Menu size={17} />
            </button>
            <div className="flex-1" />
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              View Store <ChevronRight size={12} />
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors">
              <LogOut size={13} /> Logout
            </button>
          </div>

          <div className="p-4 sm:p-6 admin-scroll">
            <Outlet />
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
