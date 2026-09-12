import { useEffect, useState } from "react"
import { Star, Check, X, EyeOff, Trash2 } from "lucide-react"
import { useSeo } from "../../lib/seo"
import { useToast } from "../../contexts/ToastContext"
import { supabase } from "../../lib/supabaseClient"

interface ReviewRow {
  id: string
  product_id: string
  reviewer_name: string
  rating: number
  title: string
  body: string
  verified_purchase: boolean
  status: string
  created_at: string
  products?: { name: string } | null
}

const TABS = ["pending", "approved", "rejected", "hidden"] as const

export default function AdminReviews() {
  useSeo({ title: "Reviews", path: "/admin/reviews", noIndex: true })
  const { toast } = useToast()
  const [tab, setTab] = useState<typeof TABS[number]>("pending")
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("status", tab)
      .order("created_at", { ascending: false })
    if (error) toast(error.message, "error")
    setReviews((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reviews").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) { toast(error.message, "error"); return }
    toast(`Review ${status}`)
    load()
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (error) { toast(error.message, "error"); return }
    toast("Review deleted", "error")
    load()
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-[var(--ma-foreground)] mb-4">Reviews</h1>

      <div className="flex gap-1 mb-6 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tab === t ? "bg-[#2B8EF0] text-white" : "text-[var(--ma-muted)] hover:text-[var(--ma-foreground)]"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--ma-muted)] text-sm">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-[var(--ma-muted)] text-sm bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-8 text-center">No {tab} reviews.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-[var(--ma-foreground)]">{r.products?.name || "Unknown product"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? "text-yellow-400" : "text-[var(--ma-muted)]"} fill={i < r.rating ? "currentColor" : "none"} />
                    ))}</div>
                    <span className="text-xs text-[var(--ma-muted)]">{r.reviewer_name}</span>
                    {r.verified_purchase && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified Purchase</span>}
                  </div>
                </div>
                <span className="text-xs text-[var(--ma-muted)]">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.body && <p className="text-sm text-[var(--ma-foreground)] mt-2">{r.body}</p>}
              <div className="flex gap-2 mt-3">
                {tab !== "approved" && (
                  <button onClick={() => setStatus(r.id, "approved")} className="flex items-center gap-1 text-xs text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded-lg"><Check size={12} /> Approve</button>
                )}
                {tab !== "rejected" && (
                  <button onClick={() => setStatus(r.id, "rejected")} className="flex items-center gap-1 text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg"><X size={12} /> Reject</button>
                )}
                {tab !== "hidden" && (
                  <button onClick={() => setStatus(r.id, "hidden")} className="flex items-center gap-1 text-xs text-yellow-400 hover:bg-yellow-500/10 px-2 py-1 rounded-lg"><EyeOff size={12} /> Hide</button>
                )}
                <button onClick={() => remove(r.id)} className="flex items-center gap-1 text-xs text-[var(--ma-muted)] hover:bg-[var(--ma-card-hover)] px-2 py-1 rounded-lg"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
