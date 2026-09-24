import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, ChevronRight } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-500/10",
  confirmed: "text-blue-400 bg-blue-500/10",
  processing: "text-blue-400 bg-blue-500/10",
  packed: "text-violet-400 bg-violet-500/10",
  shipped: "text-cyan-400 bg-cyan-500/10",
  out_for_delivery: "text-cyan-400 bg-cyan-500/10",
  delivered: "text-emerald-400 bg-emerald-500/10",
  cancelled: "text-red-400 bg-red-500/10",
}

function fmt(n: number) { return "Rs. " + n.toLocaleString() }
function statusLabel(s: string) { return s.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") }

export default function AccountOrders() {
  const { fetchMyOrders } = useStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMyOrders().then(o => { setOrders(o); setLoading(false) }) }, [fetchMyOrders])

  if (loading) return <p className="text-[var(--ma-muted)] text-sm">Loading...</p>

  if (orders.length === 0) {
    return (
      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-8 text-center">
        <Package size={28} className="text-[var(--ma-muted)] mx-auto mb-3" />
        <p className="text-sm text-[var(--ma-muted)] mb-3">No orders yet.</p>
        <Link to="/shop" className="text-[#2B8EF0] hover:underline text-sm">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map(o => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="block bg-[var(--ma-card)] border border-[var(--ma-border)] hover:border-[var(--ma-border-hover)] rounded-2xl p-4 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-[var(--ma-foreground)]">{o.order_number}</p>
              <p className="text-xs text-[var(--ma-muted)]">{new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || ""}`}>{statusLabel(o.status)}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--ma-muted)]">{o.order_items?.length || 0} item{(o.order_items?.length || 0) !== 1 ? "s" : ""} · {fmt(o.total)}</p>
            <ChevronRight size={14} className="text-[var(--ma-muted)]" />
          </div>
        </Link>
      ))}
    </div>
  )
}
