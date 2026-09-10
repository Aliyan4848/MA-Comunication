import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { StatusBadge } from "./AdminDashboard"
import type { OrderStatus } from "../../types"

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { getOrder, updateOrderStatus } = useStore()
  const navigate = useNavigate()
  const order = getOrder(id || "")

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate("/admin/orders")} className="text-[#2B8EF0] hover:underline text-sm mt-2">Back to orders</button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/orders")} className="text-gray-500 hover:text-white"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Order {order.id}</h1>
          <p className="text-gray-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <div className="relative">
            <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="appearance-none bg-[#10151D] border border-white/10 rounded-xl px-4 py-2 pr-8 text-sm text-white outline-none cursor-pointer">
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer */}
        <div className="rounded-xl bg-[#10151D] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Customer Information</h3>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={order.customerName} />
            <Row label="Phone" value={order.phone} />
            {order.email && <Row label="Email" value={order.email} />}
            <Row label="City" value={order.city} />
            <Row label="Address" value={order.address} />
            {order.notes && <Row label="Notes" value={order.notes} />}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl bg-[#10151D] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Order Summary</h3>
          <div className="space-y-3 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-[#0A0F16] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {fmt(item.price)}</p>
                </div>
                <p className="text-sm font-semibold text-white shrink-0">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Delivery</span><span>{fmt(order.deliveryCharge)}</span></div>
            <div className="flex justify-between font-bold text-white text-base pt-1"><span>Total</span><span>{fmt(order.total)}</span></div>
          </div>
          <div className="mt-4 bg-[#0A0F16] rounded-xl px-4 py-3 text-xs text-gray-500">
            Payment: <span className="text-white">{order.paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-gray-500 w-20 shrink-0 text-xs">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  )
}
