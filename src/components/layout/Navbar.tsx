import { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { ShoppingCart, Search, Menu, X, Zap, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../../contexts/CartContext"
import { useStore } from "../../contexts/StoreContext"
import { useAuth } from "../../contexts/AuthContext"
import ThemeToggle from "../ui/ThemeToggle"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { count } = useCart()
  const { settings } = useStore()
  const { session } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/categories", label: "Categories" },
    { to: "/new-arrivals", label: "New Arrivals" },
    { to: "/best-sellers", label: "Best Sellers" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,7,10,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          height: scrolled ? "60px" : "72px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#2B8EF0]/20 border border-[#2B8EF0]/30 flex items-center justify-center group-hover:bg-[#2B8EF0]/30 transition-colors">
              <Zap size={16} className="text-[#2B8EF0]" />
            </div>
            <span className="font-bold text-[var(--ma-foreground)] text-base tracking-tight">
              MA <span className="text-[#2B8EF0]">Communication</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-[var(--ma-foreground)] bg-[var(--ma-card-hover)]" : "text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] hover:bg-[var(--ma-card-hover)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] hover:bg-[var(--ma-card-hover)] transition-all"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Account */}
            <Link
              to={session ? "/account" : "/login"}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] hover:bg-[var(--ma-card-hover)] transition-all"
              aria-label={session ? "My Account" : "Sign in"}
            >
              <User size={18} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] hover:bg-[var(--ma-card-hover)] transition-all"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#2B8EF0] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  style={{ width: "18px", height: "18px", fontSize: "10px" }}
                >
                  {count > 9 ? "9+" : count}
                </motion.span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] hover:bg-[var(--ma-card-hover)] transition-all"
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ top: "60px" }}
          >
            <div
              className="absolute inset-0 bg-[var(--ma-background)]/95 backdrop-blur-xl"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="relative flex flex-col p-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive ? "bg-[#2B8EF0]/10 text-[#2B8EF0] border border-[#2B8EF0]/20" : "text-[var(--ma-foreground)] hover:bg-[var(--ma-card-hover)] hover:text-[var(--ma-foreground)]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 pt-4 border-t border-[var(--ma-border)] flex items-center justify-between px-4">
                <div>
                  <p className="text-xs text-[var(--ma-muted)]">{settings.businessName}</p>
                  <p className="text-xs text-[var(--ma-muted)] mt-1">{settings.phone}</p>
                </div>
                <ThemeToggle />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              className="relative w-full max-w-2xl"
            >
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ma-muted)]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`
                    }
                    if (e.key === "Escape") setSearchOpen(false)
                  }}
                  placeholder="Search products, categories..."
                  className="w-full bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl pl-12 pr-12 py-4 text-[var(--ma-foreground)] placeholder-gray-500 text-base outline-none focus:border-[#2B8EF0]/50 transition-colors"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[var(--ma-muted)] text-center mt-3">Press Enter to search</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
