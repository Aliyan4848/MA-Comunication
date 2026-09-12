import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import { useSeo } from "../../lib/seo"
import { supabase } from "../../lib/supabaseClient"

interface CustomerRow {
  id: string
  email: string
  full_name: string
  phone: string
  order_count: number
  total_spent: number
  last_order_at: string | null
  created_at: string
}

export default function AdminCustomers() {
  useSeo({ title: "Customers", path: "/admin/customers", noIndex: true })
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    (async () => {
      // Admin-only: profiles + a per-user aggregate of their orders.
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: false })
      if (profErr) { setError(profErr.message); setLoading(false); return }

      const { data: orders, error: ordErr } = await supabase
        .from("orders")
        .select("user_id, email, total, created_at")
        .not("user_id", "is", null)
      if (ordErr) { setError(ordErr.message); setLoading(false); return }

      const rows: CustomerRow[] = (profiles || []).map(p => {
        const myOrders = (orders || []).filter(o => o.user_id === p.id)
        return {
          id: p.id,
          email: myOrders[0]?.email || "",
          full_name: p.full_name || "(no name set)",
          phone: p.phone || "",
          order_count: myOrders.length,
          total_spent: myOrders.reduce((s, o) => s + Number(o.total), 0),
          last_order_at: myOrders.length ? myOrders.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0].created_at : null,
          created_at: p.created_at,
        }
      })
      setCustomers(rows)
      setLoading(false)
    })()
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users size={18} className="text-[#2B8EF0]" />
        <h1 className="text-lg font-bold text-[var(--ma-foreground)]">Customers</h1>
        <span className="text-xs text-[var(--ma-muted)]">({customers.length})</span>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-[var(--ma-muted)] text-sm">Loading...</p>
      ) : customers.length === 0 ? (
        <p className="text-[var(--ma-muted)] text-sm bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-8 text-center">No registered customers yet.</p>
      ) : (
        <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--ma-muted)] border-b border-[var(--ma-border)]">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Last Order</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-[var(--ma-border)] last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-[var(--ma-foreground)]">{c.full_name}</p>
                    {c.email && <p className="text-xs text-[var(--ma-muted)]">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-[var(--ma-muted)]">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-[var(--ma-muted)]">{c.order_count}</td>
                  <td className="px-4 py-3 text-[var(--ma-foreground)]">Rs. {c.total_spent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--ma-muted)]">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-[var(--ma-muted)]">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
