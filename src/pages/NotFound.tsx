import { Link } from "react-router-dom"
import { ArrowLeft, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useSeo } from "../lib/seo"

export default function NotFound() {
  useSeo({ title: "Page Not Found", description: "The page you requested could not be found.", path: window.location.pathname, noIndex: true })
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/20 flex items-center justify-center mx-auto mb-8">
          <Zap size={32} className="text-[#2B8EF0]" />
        </div>
        <p className="text-8xl font-black text-[var(--ma-foreground)]/5 mb-4 leading-none select-none">404</p>
        <h1 className="text-2xl font-bold text-[var(--ma-foreground)] mb-3">Page Not Found</h1>
        <p className="text-[var(--ma-muted)] text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all text-sm"
          >
            <ArrowLeft size={15} /> Go Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-3 border border-[var(--ma-border)] hover:border-[var(--ma-border-hover)] text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] font-semibold rounded-xl transition-all text-sm"
          >
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
