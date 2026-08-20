import { Link, useNavigate } from "react-router-dom"
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../contexts/CartContext"
import { useStore } from "../contexts/StoreContext"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function Cart() {
  const { items, removeFromCart, updateQty, subtotal, count } = useCart()
  const { settings } = useStore()
  const navigate = useNavigate()
  const delivery = items.length > 0 ? settings.deliveryCharge : 0
  const total = subtotal + delivery

  if (count === 0) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#10151D] flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add products to get started</p>
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
        <h1 className="text-2xl font-bold text-white mb-8">Shopping Cart <span className="text-gray-500 text-base font-normal">({count} items)</span></h1>

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
                  className="flex gap-4 p-4 rounded-xl bg-[#10151D] border border-white/5"
                >
                  <Link to={`/products/${item.productId}`} className="shrink-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-[#0A0F16]" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`} className="text-sm font-medium text-white hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </Link>
                    <p className="text-base font-bold text-white mt-1">{fmt(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm text-white font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-30">
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-white">{fmt(item.price * item.quantity)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl bg-[#10151D] border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? "—" : fmt(delivery)}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between font-bold text-white text-base">
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-3.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#2B8EF0]/25 flex items-center justify-center gap-2"
              >
                Proceed to Order <ArrowRight size={16} />
              </button>
              <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-white mt-4 transition-colors">
                Continue Shopping
              </Link>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-600 text-center">Cash on Delivery · Nationwide Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
