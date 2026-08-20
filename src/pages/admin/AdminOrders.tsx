import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Eye, ChevronDown } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { StatusBadge } from "./AdminDashboard"
import type { OrderStatus } from "../../types"

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.phone.includes(q)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="w-full bg-[#10151D] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/40" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none bg-[#10151D] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none cursor-pointer">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="rounded-xl bg-[#10151D] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Order ID</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase hidden sm:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Total</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Update</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-600 text-sm">No orders found</td></tr>
              ) : (
                filtered.map(o => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-xs text-[#2B8EF0]">{o.id}</td>
                    <td className="py-3 px-4">
                      <p className="text-white text-sm font-medium">{o.customerName}</p>
                      <p className="text-gray-600 text-xs">{o.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-white font-medium text-sm">{fmt(o.total)}</td>
                    <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <select
                          value={o.status}
                          onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="appearance-none bg-[#0A0F16] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none cursor-pointer pr-6"
                        >
                          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#2B8EF0]/10 flex items-center justify-center text-gray-500 hover:text-[#2B8EF0] transition-all">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
