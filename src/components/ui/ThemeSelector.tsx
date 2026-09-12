import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme, type ThemePreference } from "../../contexts/ThemeContext"

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export default function ThemeSelector() {
  const { preference, setPreference } = useTheme()
  return (
    <div role="radiogroup" aria-label="Theme preference" className="flex gap-2">
      {OPTIONS.map(opt => {
        const Icon = opt.icon
        const active = preference === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(opt.value)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors ${
              active
                ? "border-[#2B8EF0] bg-[#2B8EF0]/10 text-[#2B8EF0]"
                : "border-[var(--ma-border)] bg-[var(--ma-surface)] text-[var(--ma-muted)] hover:text-[var(--ma-foreground)]"
            }`}
          >
            <Icon size={16} />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
