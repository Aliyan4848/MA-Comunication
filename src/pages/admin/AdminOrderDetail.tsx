import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Truck } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
import { supabase } from "../../lib/supabaseClient"
import { StatusBadge } from "./AdminDashboard"
import OrderTimeline from "../../components/ui/OrderTimeline"
import type { OrderStatus } from "../../types"

// The only forward transitions the state machine allows (mirrors the DB function).
// Cancellation is offered separately since it's valid from any non-terminal state.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "packed",
  packed: "shipped",
  shipped: "out_for_delivery",
  out_for_delivery: "delivered",
}
const LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", processing: "Processing", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
}

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { getOrder, updateOrderStatusAdmin, setOrderShipment, orders } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const order = getOrder(id || "")

  const [courier, setCourier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [trackingEvents, setTrackingEvents] = useState<any[]>([])

  const loadTimeline = async (orderId: string) => {
    const [{ data: h }, { data: t }] = await Promise.all([
      supabase.from("order_status_history").select("from_status, to_status, created_at").eq("order_id", orderId).order("created_at"),
      supabase.from("tracking_events").select("status_raw, status_mapped, description, event_time").eq("order_id", orderId).order("event_time"),
    ])
    setHistory(h || [])
    setTrackingEvents(t || [])
  }

  useEffect(() => { if (order) loadTimeline(order.id) }, [order?.id, order?.status])

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate("/admin/orders")} className="text-[#2B8EF0] hover:underline text-sm mt-2">Back to orders</button>
      </div>
    )
  }

  const nextStatus = NEXT_STATUS[order.status]
  const canCancel = order.status !== "delivered" && order.status !== "cancelled"

  const advance = async (status: OrderStatus) => {
    setBusy(true)
    try {
      await updateOrderStatusAdmin(order.id, status)
      toast(`Order marked ${LABELS[status]}`)
    } catch (e: any) {
      toast(e.message || "Failed to update status", "error")
    } finally {
      setBusy(false)
    }
  }

  const saveShipment = async () => {
    if (!courier || !trackingNumber) { toast("Enter both courier and tracking number", "error"); return }
    setBusy(true)
    try {
      await setOrderShipment(order.id, courier, trackingNumber)
      toast("Shipment info saved")
    } catch (e: any) {
      toast(e.message || "Failed to save shipment", "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/orders")} className="text-gray-500 hover:text-white"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{order.orderNumber}</h1>
          <p className="text-gray-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status actions — only valid next steps are offered, mirroring the DB state machine */}
      <div className="rounded-xl bg-[#10151D] border border-white/5 p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Order Timeline</h3>
        <OrderTimeline status={order.status} history={history} trackingEvents={trackingEvents} />
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/5">
          {nextStatus && (
            <button onClick={() => advance(nextStatus)} disabled={busy} className="px-4 py-2 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-all">
              Mark as {LABELS[nextStatus]}
            </button>
          )}
          {canCancel && (
            <button onClick={() => advance("cancelled")} disabled={busy} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium rounded-xl disabled:opacity-50 transition-all">
              Cancel Order
            </button>
          )}
          {!nextStatus && !canCancel && <p className="text-xs text-gray-500">This order has reached a final state.</p>}
        </div>
      </div>

      {/* Shipment */}
      <div className="rounded-xl bg-[#10151D] border border-white/5 p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2"><Truck size={15} /> Shipment</h3>
        <p className="text-xs text-gray-500 mb-4">
          Enter the courier and tracking number once — after that, status moves forward automatically as the courier updates it (once a live courier integration is connected). No live courier API is connected yet, so status changes above are still manual.
        </p>
        <div className="flex flex-wrap gap-2">
          <input value={courier} onChange={e => setCourier(e.target.value)} placeholder="Courier (e.g. TCS, Leopards)" className="flex-1 min-w-[160px] bg-[#0A0F16] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none" />
          <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Tracking number" className="flex-1 min-w-[160px] bg-[#0A0F16] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none" />
          <button onClick={saveShipment} disabled={busy} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-xl disabled:opacity-50 transition-all">Save</button>
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
