import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Star } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
import OrderTimeline from "../../components/ui/OrderTimeline"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

function ReviewPrompt({ orderId, productId, name }: { orderId: string; productId: string; name: string }) {
  const { submitReview } = useStore()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [body, setBody] = useState("")
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (rating === 0) { toast("Pick a star rating", "error"); return }
    setSaving(true)
    try {
      await submitReview(productId, orderId, rating, "", body)
      setSubmitted(true)
      toast("Review submitted — pending approval")
    } catch (e: any) {
      toast(e.message || "Failed to submit review", "error")
    } finally {
      setSaving(false)
    }
  }

  if (submitted) return <p className="text-xs text-emerald-400 mt-1">Thanks for your review!</p>

  if (!open) {
    return <button onClick={() => setOpen(true)} className="text-xs text-[#2B8EF0] hover:underline mt-1">Write a review</button>
  }

  return (
    <div className="mt-2 bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl p-3">
      <p className="text-xs text-[var(--ma-muted)] mb-2">Rate {name}</p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
            <Star size={18} className={(hover || rating) >= n ? "text-yellow-400" : "text-[var(--ma-dim)]"} fill={(hover || rating) >= n ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Optional: share your experience..." rows={2}
        className="w-full bg-[var(--ma-background)] border border-[var(--ma-border)] rounded-lg px-3 py-2 text-xs text-[var(--ma-foreground)] outline-none resize-none" />
      <button onClick={submit} disabled={saving} className="mt-2 px-3 py-1.5 bg-[#2B8EF0] text-white text-xs rounded-lg disabled:opacity-50">
        {saving ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  )
}

export default function AccountOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { fetchMyOrderDetail } = useStore()
  const [order, setOrder] = useState<any>(undefined)

  useEffect(() => {
    if (!id) return
    fetchMyOrderDetail(id).then(setOrder).catch(() => setOrder(null))
  }, [id, fetchMyOrderDetail])

  if (order === undefined) return <p className="text-[var(--ma-muted)] text-sm">Loading...</p>
  if (!order) return <p className="text-[var(--ma-muted)] text-sm">Order not found.</p>

  return (
    <div className="space-y-5">
      <div>
        <Link to="/account/orders" className="text-xs text-[var(--ma-muted)] hover:text-[var(--ma-foreground)]">&larr; Back to orders</Link>
        <h2 className="text-lg font-bold text-[var(--ma-foreground)] mt-1">{order.order_number}</h2>
        {order.tracking_number && <p className="text-xs text-[var(--ma-muted)]">{order.courier} · {order.tracking_number}</p>}
      </div>

      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
        <OrderTimeline status={order.status} history={order.history || []} trackingEvents={order.tracking_events || []} />
      </div>

      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
        <p className="text-xs text-[var(--ma-muted)] mb-3 uppercase tracking-wide">Items</p>
        <div className="space-y-3">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex gap-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-[var(--ma-surface)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--ma-foreground)] leading-snug">{item.name}</p>
                <p className="text-xs text-[var(--ma-muted)] mt-0.5">Qty: {item.quantity} × {fmt(item.price)}</p>
                {order.status === "delivered" && item.product_id && (
                  <ReviewPrompt orderId={order.id} productId={item.product_id} name={item.name} />
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--ma-foreground)] shrink-0">{fmt(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--ma-border)] mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-[var(--ma-muted)]"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
          <div className="flex justify-between text-[var(--ma-muted)]"><span>Delivery</span><span>{fmt(order.delivery_charge)}</span></div>
          <div className="flex justify-between font-bold text-[var(--ma-foreground)] text-base"><span>Total</span><span>{fmt(order.total)}</span></div>
        </div>
      </div>

      <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
        <p className="text-xs text-[var(--ma-muted)] mb-2 uppercase tracking-wide">Delivery Address</p>
        <p className="text-sm text-[var(--ma-foreground)]">{order.customer_name} · {order.phone}</p>
        <p className="text-sm text-[var(--ma-muted)]">{order.city}, {order.address}</p>
      </div>
    </div>
  )
}
