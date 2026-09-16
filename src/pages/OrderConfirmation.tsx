import { useEffect, useState } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useStore } from "../contexts/StoreContext"
import { useAuth } from "../contexts/AuthContext"
import type { Order } from "../types"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
const location = useLocation()
const { fetchPublicOrder } = useStore()
const orderNumberFromState = (location.state as { orderNumber?: string } | null)?.orderNumber
  const { session } = useAuth()
  const [order, setOrder] = useState<Order | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    let mounted = true
    if (!id) { setOrder(null); return }
    fetchPublicOrder(id).then(o => { if (mounted) setOrder(o) })
    return () => { mounted = false }
  }, [id, fetchPublicOrder])

  if (order === undefined) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center px-4">
        <p className="text-[var(--ma-muted)] text-sm">Loading your order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--ma-foreground)] font-semibold mb-3">Order not found</p>
          <Link to="/shop" className="text-[#2B8EF0] hover:underline text-sm">Back to shop</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={36} className="text-emerald-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--ma-foreground)] mb-2">Order Placed Successfully!</h1>
          <p className="text-[var(--ma-muted)] text-sm">Thank you for your order. We will confirm and dispatch it shortly.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[var(--ma-card)] border border-[var(--ma-border)] overflow-hidden mb-6"
        >
          <div className="px-6 py-4 border-b border-[var(--ma-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-[#2B8EF0]" />
              <span className="text-sm font-semibold text-[var(--ma-foreground)]">Order Details</span>
            </div>
            <span className="text-xs font-mono text-[#2B8EF0] bg-[#2B8EF0]/10 px-2 py-1 rounded-lg">{orderNumberFromState || order.orderNumber}</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--ma-muted)] text-xs mb-1">Customer</p>
                <p className="text-[var(--ma-foreground)] font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-[var(--ma-muted)] text-xs mb-1">Phone</p>
                <p className="text-[var(--ma-foreground)] font-medium">{order.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[var(--ma-muted)] text-xs mb-1">Delivery Address</p>
                <p className="text-[var(--ma-foreground)] font-medium">{order.city}, {order.address}</p>
              </div>
            </div>

            <div className="border-t border-[var(--ma-border)] pt-4">
              <p className="text-xs text-[var(--ma-muted)] mb-3 uppercase tracking-wide">Items Ordered</p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-[var(--ma-surface)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--ma-foreground)] leading-snug line-clamp-2">{item.name}</p>
                      <p className="text-xs text-[var(--ma-muted)] mt-0.5">Qty: {item.quantity} × {fmt(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--ma-foreground)] shrink-0">{fmt(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--ma-border)] pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--ma-muted)]"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-[var(--ma-muted)]"><span>Delivery</span><span>{fmt(order.deliveryCharge)}</span></div>
              <div className="flex justify-between font-bold text-[var(--ma-foreground)] text-base pt-1"><span>Total</span><span>{fmt(order.total)}</span></div>
            </div>

            <div className="bg-[var(--ma-surface)] rounded-xl px-4 py-3 text-xs text-[var(--ma-muted)]">
              Payment: <span className="text-emerald-400 font-medium">Cash on Delivery</span> · Status: <span className="text-yellow-400 font-medium capitalize">{order.status}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3">
          <Link to="/shop" className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--ma-border)] text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] hover:border-[var(--ma-border-hover)] rounded-xl transition-all text-sm font-medium">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>

        {!session && order.email && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 bg-[#2B8EF0]/5 border border-[#2B8EF0]/20 rounded-2xl p-5 text-center"
          >
            <p className="text-sm text-[var(--ma-foreground)] font-medium mb-1">Create an account to easily track your orders and manage future purchases.</p>
            <p className="text-xs text-[var(--ma-muted)] mb-3">We'll link this order to your account automatically using {order.email}.</p>
            <Link
              to="/signup"
              state={{ from: `/order-confirmation/${order.id}` }}
              className="inline-block px-5 py-2 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white text-sm font-medium rounded-xl transition-all"
            >
              Create Account
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
