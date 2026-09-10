import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../lib/supabaseClient"

interface AuthContextType {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdmin = useCallback(async (sess: Session | null) => {
    if (!sess) {
      setIsAdmin(false)
      return
    }
    const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", sess.user.id).maybeSingle()
    setIsAdmin(!error && !!data)
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await checkAdmin(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess)
      await checkAdmin(sess)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [checkAdmin])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error ? error.message : null }
  }, [])

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, signIn, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
