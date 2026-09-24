import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Search, Package } from "lucide-react"
import { useStore } from "../contexts/StoreContext"
import { useAuth } from "../contexts/AuthContext"
import { useSeo } from "../lib/seo"
import OrderTimeline from "../components/ui/OrderTimeline"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function TrackOrder() {
  const { orderNumber: orderNumberParam } = useParams<{ orderNumber: string }>()
  const { trackGuestOrder } = useStore()
  const { session } = useAuth()
  useSeo({ title: "Track Your Order", path: "/track-order", noIndex: true })

  const [orderNumber, setOrderNumber] = useState(orderNumberParam || "")
  const [contact, setContact] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await trackGuestOrder(orderNumber.trim(), contact.trim())
      setOrder(result)
    } catch (err: any) {
      setError(err.message || "No order found matching that order number and contact info")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 min-h-screen px-4 pb-16 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/20 flex items-center justify-center mx-auto mb-4">
          <Package size={20} className="text-[#2B8EF0]" />
        </div>
        <h1 className="text-xl font-bold text-[var(--ma-foreground)]">Track Your Order</h1>
        <p className="text-[var(--ma-muted)] text-sm mt-1">
          {session ? (
            <>Signed in? Check <Link to="/account/orders" className="text-[#2B8EF0] hover:underline">My Orders</Link> for the full list, or track any order below.</>
          ) : (
            "Enter your order number and the phone or email used at checkout."
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5 mb-6">
        <input required placeholder="Order number (e.g. MA-001008)" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
          className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
        <input required placeholder="Phone or email used at checkout" value={contact} onChange={e => setContact(e.target.value)}
          className="w-full bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none focus:border-[#2B8EF0]/50" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
          <Search size={14} /> {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {order && (
        <div className="space-y-4">
          <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-[var(--ma-foreground)]">{order.order_number}</p>
                {order.tracking_number && <p className="text-xs text-[var(--ma-muted)]">{order.courier} · {order.tracking_number}</p>}
              </div>
              <p className="text-sm font-bold text-[var(--ma-foreground)]">{fmt(order.total)}</p>
            </div>
            <OrderTimeline status={order.status} history={order.history || []} trackingEvents={order.tracking_events || []} />
          </div>

          <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
            <p className="text-xs text-[var(--ma-muted)] mb-3 uppercase tracking-wide">Items</p>
            <div className="space-y-2.5">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--ma-foreground)]">{item.name} × {item.quantity}</span>
                  <span className="text-[var(--ma-muted)]">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
