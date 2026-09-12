import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useAuth } from "../../contexts/AuthContext"

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size} className={n <= Math.round(value) ? "text-yellow-400" : "text-[var(--ma-dim)]"} fill={n <= Math.round(value) ? "currentColor" : "none"} />
      ))}
    </div>
  )
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { fetchProductReviews } = useStore()
  const { session } = useAuth()
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState<any>({ review_count: 0, average_rating: 0, distribution: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductReviews(productId).then(r => { setReviews(r.reviews); setStats(r.stats); setLoading(false) })
  }, [productId, fetchProductReviews])

  if (loading) return null

  return (
    <div className="mt-16 pt-12 border-t border-[var(--ma-border)]">
      <h2 className="text-xl font-bold text-[var(--ma-foreground)] mb-6">Customer Reviews</h2>

      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="flex items-center gap-4">
          <p className="text-4xl font-bold text-[var(--ma-foreground)]">{stats.average_rating || "—"}</p>
          <div>
            <Stars value={stats.average_rating || 0} size={16} />
            <p className="text-xs text-[var(--ma-muted)] mt-1">{stats.review_count} review{stats.review_count !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex-1 space-y-1 max-w-xs">
          {[5, 4, 3, 2, 1].map(n => {
            const count = stats.distribution?.[String(n)] || 0
            const pct = stats.review_count > 0 ? (count / stats.review_count) * 100 : 0
            return (
              <div key={n} className="flex items-center gap-2 text-xs text-[var(--ma-muted)]">
                <span className="w-3">{n}</span>
                <Star size={10} className="text-yellow-400" fill="currentColor" />
                <div className="flex-1 h-1.5 rounded-full bg-[var(--ma-dim)] overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-[var(--ma-muted)]">No reviews yet. {!session && <Link to="/login" className="text-[#2B8EF0] hover:underline">Sign in</Link>} Purchase and receive this product to be the first to leave a review.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((r: any) => (
            <div key={r.id} className="border-b border-[var(--ma-border)] pb-5 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <Stars value={r.rating} />
                <span className="text-sm font-medium text-[var(--ma-foreground)]">{r.reviewer_name}</span>
                {r.verified_purchase && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified Purchase</span>
                )}
              </div>
              {r.title && <p className="text-sm font-medium text-[var(--ma-foreground)]">{r.title}</p>}
              {r.body && <p className="text-sm text-[var(--ma-muted)] mt-1">{r.body}</p>}
              {r.review_images?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.review_images.map((img: any, i: number) => (
                    <img key={i} src={img.url} className="w-16 h-16 rounded-lg object-cover" alt="" />
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--ma-muted)] mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--ma-muted)] mt-6">
        Only customers with a delivered order containing this product can leave a review — from{" "}
        <Link to="/account/orders" className="text-[#2B8EF0] hover:underline">My Orders</Link>.
      </p>
    </div>
  )
}
