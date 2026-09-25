import { Link, useNavigate } from "react-router-dom"
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../contexts/CartContext"
import { useStore } from "../contexts/StoreContext"
import { useSeo } from "../lib/seo"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function Cart() {
  useSeo({ title: "Shopping Cart", description: "Review the items in your MA Communication shopping cart.", path: "/cart", noIndex: true })
  const { items, removeFromCart, updateQty, subtotal, count } = useCart()
  const { settings } = useStore()
  const navigate = useNavigate()
  const delivery = items.length > 0 ? settings.deliveryCharge : 0
  const total = subtotal + delivery

  if (count === 0) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[var(--ma-card)] flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-[var(--ma-muted)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--ma-foreground)] mb-3">Your cart is empty</h2>
          <p className="text-[var(--ma-muted)] text-sm mb-6">Add products to get started</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B8EF0] text-white font-semibold rounded-xl hover:bg-[#1A7DE0] transition-all">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--ma-foreground)] mb-8">Shopping Cart <span className="text-[var(--ma-muted)] text-base font-normal">({count} items)</span></h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 p-4 rounded-xl bg-[var(--ma-card)] border border-[var(--ma-border)]"
                >
                  <Link to={`/products/${item.productId}`} className="shrink-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-[var(--ma-surface)]" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`} className="text-sm font-medium text-[var(--ma-foreground)] hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </Link>
                    <p className="text-base font-bold text-[var(--ma-foreground)] mt-1">{fmt(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button onClick={() => removeFromCart(item.productId)} className="text-[var(--ma-muted)] hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-[var(--ma-card)] hover:bg-[var(--ma-card-hover)] flex items-center justify-center text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] transition-all">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm text-[var(--ma-foreground)] font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-7 h-7 rounded-lg bg-[var(--ma-card)] hover:bg-[var(--ma-card-hover)] flex items-center justify-center text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] transition-all disabled:opacity-30">
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[var(--ma-foreground)]">{fmt(item.price * item.quantity)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl bg-[var(--ma-card)] border border-[var(--ma-border)] p-6">
              <h3 className="font-semibold text-[var(--ma-foreground)] mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-[var(--ma-muted)]">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--ma-muted)]">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? "—" : fmt(delivery)}</span>
                </div>
                <div className="h-px bg-[var(--ma-border)]" />
                <div className="flex justify-between font-bold text-[var(--ma-foreground)] text-base">
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-3.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#2B8EF0]/25 flex items-center justify-center gap-2"
              >
                Proceed to Order <ArrowRight size={16} />
              </button>
              <Link to="/shop" className="block text-center text-sm text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] mt-4 transition-colors">
                Continue Shopping
              </Link>
              <div className="mt-4 pt-4 border-t border-[var(--ma-border)]">
                <p className="text-xs text-[var(--ma-muted)] text-center">Cash on Delivery · Nationwide Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
