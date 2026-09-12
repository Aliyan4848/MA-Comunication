import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"
const STORAGE_KEY = "ma-theme"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

/**
 * Storefront and admin each get their own instance of this provider with a
 * different storage key, so an admin's theme choice never leaks into the
 * customer-facing site or vice versa (see ThemeProvider `scope` prop).
 */
export function ThemeProvider({ children, scope = "storefront" }: { children: React.ReactNode; scope?: "storefront" | "admin" }) {
  const key = scope === "admin" ? `${STORAGE_KEY}-admin` : STORAGE_KEY
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"
    const stored = localStorage.getItem(key)
    if (stored === "light" || stored === "dark") return stored
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try { localStorage.setItem(key, t) } catch { /* ignore */ }
  }, [key])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
