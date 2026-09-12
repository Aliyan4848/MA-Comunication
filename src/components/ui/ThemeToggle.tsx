import { Sun, Moon } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--ma-border)] bg-[var(--ma-card)] hover:bg-[var(--ma-card-hover)] text-[var(--ma-foreground)] transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
