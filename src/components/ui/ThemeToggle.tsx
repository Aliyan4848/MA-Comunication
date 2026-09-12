import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"

const ICONS = { light: Sun, dark: Moon, system: Monitor }
const LABELS = { light: "Light", dark: "Dark", system: "System" }

/**
 * A single button that cycles system -> light -> dark -> system. Shows the
 * icon for the CURRENT PREFERENCE (not just the resolved light/dark), so
 * "system" is visibly its own state rather than silently looking like
 * whatever it currently resolves to.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { preference, cyclePreference } = useTheme()
  const Icon = ICONS[preference]

  return (
    <button
      type="button"
      onClick={cyclePreference}
      aria-label={`Theme: ${LABELS[preference]}. Click to change.`}
      title={`Theme: ${LABELS[preference]} (click to cycle)`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--ma-border)] bg-[var(--ma-card)] hover:bg-[var(--ma-card-hover)] text-[var(--ma-foreground)] transition-colors ${className}`}
    >
      <Icon size={16} />
    </button>
  )
}
