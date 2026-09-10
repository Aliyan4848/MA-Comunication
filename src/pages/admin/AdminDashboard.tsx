import { useMemo } from "react"
import { Package, ShoppingBag, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { useStore } from "../../contexts/StoreContext"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

const COLORS = ["#2B8EF0", "#00D4FF", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"]

export default function AdminDashboard() {
  const { products, orders, categories } = useStore()

  const stats = useMemo(() => {
    const published = products.filter(p => p.published)
    const totalOrders = orders.length
    const pending = orders.filter(o => o.status === "pending").length
    const delivered = orders.filter(o => o.status === "delivered").length
    const lowStock = published.filter(p => p.stock <= p.lowStockThreshold).length
    const totalSales = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0)
    return { totalProducts: published.length, totalOrders, pending, delivered, lowStock, totalSales }
  }, [products, orders])

  // Orders by day (last 7 days)
  const orderChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString("en-US", { weekday: "short" })
    })
    const today = new Date()
    return days.map((day, i) => {
      const date = new Date()
      date.setDate(today.getDate() - (6 - i))
      const dateStr = date.toDateString()
      const count = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr).length
      return { day, orders: count }
    })
  }, [orders])

  // Category distribution
  const catChart = useMemo(() => {
    return categories
      .filter(c => c.active)
      .map(c => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
        value: products.filter(p => p.categoryId === c.id && p.published).length,
      }))
      .filter(c => c.value > 0)
  }, [categories, products])

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "#2B8EF0" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "#00D4FF" },
    { label: "Pending Orders", value: stats.pending, icon: Clock, color: "#F59E0B" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "#10B981" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "#EF4444" },
    { label: "Total Sales", value: fmt(stats.totalSales), icon: TrendingUp, color: "#7C3AED" },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[#10151D] border border-white/10 rounded-xl px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} orders</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">MA Communication — Admin Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl bg-[#10151D] border border-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">{s.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + "20" }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#10151D] border border-white/5 p-5">
          <p className="text-sm font-semibold text-white mb-5">Orders — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={orderChart} barSize={24}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="orders" fill="#2B8EF0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-[#10151D] border border-white/5 p-5">
          <p className="text-sm font-semibold text-white mb-5">Products by Category</p>
          {catChart.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-gray-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {catChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div className="bg-[#10151D] border border-white/10 rounded-xl px-3 py-2 text-xs">
                    <p className="text-gray-400">{payload[0].name}</p>
                    <p className="text-white font-semibold">{payload[0].value} products</p>
                  </div>
                ) : null} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {catChart.slice(0, 6).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-xl bg-[#10151D] border border-white/5 p-5">
          <p className="text-sm font-semibold text-white mb-5">Recent Orders</p>
          {orders.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-600 uppercase border-b border-white/5">
                    <th className="text-left pb-3 font-medium">Order ID</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-left pb-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-left pb-3 font-medium">Total</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map(o => (
                    <tr key={o.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3 font-mono text-xs text-[#2B8EF0]">{o.id}</td>
                      <td className="py-3 text-white">{o.customerName}</td>
                      <td className="py-3 text-gray-500 hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-white font-medium">{fmt(o.total)}</td>
                      <td className="py-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    processing: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    shipped: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {status}
    </span>
  )
}
