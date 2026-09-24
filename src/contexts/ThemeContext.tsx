import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

export type ThemePreference = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "ma-theme"

function systemPrefersLight() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") return systemPrefersLight() ? "light" : "dark"
  return pref
}

interface ThemeContextType {
  /** What the customer/admin actually chose: 'light' | 'dark' | 'system'. */
  preference: ThemePreference
  /** What's actually applied right now (system resolved to light/dark). */
  resolvedTheme: ResolvedTheme
  setPreference: (p: ThemePreference) => void
  /** Convenience: cycles system -> light -> dark -> system. */
  cyclePreference: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

/**
 * Storefront and admin each get their own instance of this provider with a
 * different storage key, so an admin's theme choice never leaks into the
 * customer-facing site or vice versa (see ThemeProvider `scope` prop).
 *
 * Preference is one of light/dark/system. When it's "system", resolvedTheme
 * tracks the OS setting live via a matchMedia listener (not just once on
 * first visit) so it keeps following the OS until the person explicitly
 * picks light or dark.
 */
export function ThemeProvider({ children, scope = "storefront" }: { children: React.ReactNode; scope?: "storefront" | "admin" }) {
  const key = scope === "admin" ? `${STORAGE_KEY}-admin` : STORAGE_KEY

  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system"
    const stored = localStorage.getItem(key)
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system"
  })
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolve(preference))

  // Apply to <html data-theme="..."> whenever preference changes.
  useEffect(() => {
    const applied = resolve(preference)
    setResolvedTheme(applied)
    document.documentElement.setAttribute("data-theme", applied)
  }, [preference])

  // While on "system", keep listening for OS-level light/dark changes live.
  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = () => {
      const applied = resolve("system")
      setResolvedTheme(applied)
      document.documentElement.setAttribute("data-theme", applied)
    }
    mq.addEventListener?.("change", handler)
    return () => mq.removeEventListener?.("change", handler)
  }, [preference])

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p)
    try { localStorage.setItem(key, p) } catch { /* ignore */ }
  }, [key])

  const cyclePreference = useCallback(() => {
    setPreference(preference === "system" ? "light" : preference === "light" ? "dark" : "system")
  }, [preference, setPreference])

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference, cyclePreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
