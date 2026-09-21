import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useStore } from "../contexts/StoreContext"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { settings, placeOrder } = useStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: "", phone: "", email: "", city: "", address: "", notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

  const delivery = settings.deliveryCharge
  const total = subtotal + delivery

  if (items.length === 0) {
    navigate("/cart")
    return null
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.customerName.trim()) e.customerName = "Name is required"
    if (!form.phone.trim()) e.phone = "Phone number is required"
    if (!form.city.trim()) e.city = "City is required"
    if (!form.address.trim()) e.address = "Address is required"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (submitting) return // guards against double-click submitting twice
    setSubmitting(true)
    try {
      // Price and stock are validated and computed server-side inside placeOrder;
      // nothing the browser sends here is trusted for pricing.
      const result = await placeOrder({
        ...form,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      })
      // Navigate BEFORE clearing the cart. This component's top-level
      // "if (items.length === 0) navigate('/cart')" guard runs on every
      // render, and AnimatePresence keeps this component mounted briefly
      // during the page-transition exit animation. Clearing the cart first
      // risks that guard re-firing during that window and redirecting to
      // /cart instead of the confirmation page. Passing the full result via
      // state also means the confirmation page never depends solely on a
      // second fetch succeeding to show basic order info.
      navigate(`/order-confirmation/${result.orderId}`, {
        state: { orderId: result.orderId, orderNumber: result.orderNumber, total: result.total },
        replace: true,
      })
      clearCart()
    } catch (err: any) {
      setSubmitError(err.message || "We couldn't place your order. Please try again.")
      setSubmitting(false)
    }
  }

  const set = (field: string, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e })
  }

  const inputClass = (field: string) =>
    `w-full bg-[var(--ma-surface)] border rounded-xl px-4 py-3 text-sm text-[var(--ma-foreground)] placeholder-[var(--ma-muted)] outline-none transition-colors ${errors[field] ? "border-red-500/50" : "border-[var(--ma-border)] focus:border-[#2B8EF0]/50"}`

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--ma-foreground)] mb-8">Complete Your Order</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl bg-[var(--ma-card)] border border-[var(--ma-border)] p-6">
                <h3 className="font-semibold text-[var(--ma-foreground)] mb-5">Delivery Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Full Name *</label>
                    <input value={form.customerName} onChange={e => set("customerName", e.target.value)} placeholder="Your full name" className={inputClass("customerName")} />
                    {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Phone Number *</label>
                      <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+92 300 0000000" className={inputClass("phone")} />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Email (optional)</label>
                      <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" className={inputClass("email")} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--ma-muted)] mb-1.5">City *</label>
                    <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Lahore, Karachi, Islamabad..." className={inputClass("city")} />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Complete Address *</label>
                    <textarea value={form.address} onChange={e => set("address", e.target.value)} placeholder="House/Flat number, Street, Area..." rows={3} className={inputClass("address") + " resize-none"} />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--ma-muted)] mb-1.5">Order Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any special instructions..." rows={2} className={inputClass("notes") + " resize-none"} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--ma-card)] border border-[var(--ma-border)] p-6">
                <h3 className="font-semibold text-[var(--ma-foreground)] mb-4">Payment Method</h3>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2B8EF0]/30 bg-[#2B8EF0]/5">
                  <div className="w-4 h-4 rounded-full border-2 border-[#2B8EF0] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#2B8EF0]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ma-foreground)]">Cash on Delivery</p>
                    <p className="text-xs text-[var(--ma-muted)]">Pay when you receive your order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="sticky top-24 rounded-xl bg-[var(--ma-card)] border border-[var(--ma-border)] p-6">
                <h3 className="font-semibold text-[var(--ma-foreground)] mb-5">Order Summary</h3>
                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.productId} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-[var(--ma-surface)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--ma-foreground)] line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-[var(--ma-muted)] mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-[var(--ma-foreground)] shrink-0">{fmt(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--ma-border)] pt-4 space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-[var(--ma-muted)]"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-[var(--ma-muted)]"><span>Delivery</span><span>{fmt(delivery)}</span></div>
                  <div className="flex justify-between font-bold text-[var(--ma-foreground)] text-base pt-1"><span>Total</span><span>{fmt(total)}</span></div>
                </div>

                {submitError && (
                  <p className="text-red-400 text-xs mb-3">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-[#2B8EF0]/25"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
