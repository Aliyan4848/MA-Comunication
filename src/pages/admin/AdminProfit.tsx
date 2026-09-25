import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useToast } from "../../contexts/ToastContext"
import { CalendarDays, CircleDollarSign, Plus, RefreshCw, Save } from "lucide-react"

type Report = { from: string; to: string; orders: number; units_sold: number; gross_revenue: number; product_cost: number | null; business_expenses: number; net_profit: number | null; owner_share: number | null; technical_partner_share: number | null; store_manager_share: number | null; missing_cost_items: number; cost_complete: boolean; months: Report[]; month?: string }
type Expense = { id: string; name: string; category: string; amount: number; incurred_on: string; notes: string | null }
const categories = ["Advertising", "Hosting", "Domain", "Courier", "Payment Gateway", "Packaging", "Business Operations", "Refunds / Returns", "Other"]
const money = (value: number | null | undefined) => value == null ? "Unavailable" : `Rs. ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`
const dateString = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

export default function AdminProfit() {
  const { toast } = useToast()
  const [mode, setMode] = useState<"current" | "previous" | "custom">("current")
  const [from, setFrom] = useState(dateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [to, setTo] = useState(dateString(new Date()))
  const [report, setReport] = useState<Report | null>(null)
  const [yearRows, setYearRows] = useState<Report[]>([])
  const [yearComplete, setYearComplete] = useState(false)
  const [monthReport, setMonthReport] = useState<Report | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settings, setSettings] = useState({ owner: 70, technical: 20, manager: 10 })
  const [expenseForm, setExpenseForm] = useState({ name: "", category: "Other", amount: "", expense_date: dateString(new Date()), notes: "" })
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const range = useMemo(() => {
    const now = new Date()
    if (mode === "current") return { start: dateString(new Date(now.getFullYear(), now.getMonth(), 1)), end: dateString(new Date(now.getFullYear(), now.getMonth() + 1, 0)) }
    if (mode === "previous") return { start: dateString(new Date(now.getFullYear(), now.getMonth() - 1, 1)), end: dateString(new Date(now.getFullYear(), now.getMonth(), 0)) }
    return { start: from, end: to }
  }, [mode, from, to])

  const load = useCallback(async () => {
    setLoading(true)
    const thisYear = new Date().getFullYear()
    const today = new Date()
    const [current, annual, month, expenseRows, shareRows] = await Promise.all([
      supabase.rpc("admin_profit_report", { p_from: range.start, p_to: range.end }),
      supabase.rpc("admin_profit_report", { p_from: `${thisYear}-01-01`, p_to: dateString(today) }),
      supabase.rpc("admin_profit_report", { p_from: dateString(new Date(today.getFullYear(), today.getMonth(), 1)), p_to: dateString(today) }),
      supabase.from("business_expenses").select("id,name,category,amount,incurred_on,notes").gte("incurred_on", range.start).lte("incurred_on", range.end).order("incurred_on", { ascending: false }),
      supabase.from("profit_share_settings").select("owner_percent,technical_partner_percent,store_manager_percent,effective_from").order("effective_from", { ascending: false }).limit(1),
    ])
    const failure = current.error || annual.error || month.error || expenseRows.error || shareRows.error
    if (failure) toast(failure.message, "error")
    else {
      setReport(current.data ?? null)
      setYearRows(annual.data?.months || [])
      setYearComplete(Boolean(annual.data?.cost_complete))
      setMonthReport(month.data ?? null)
      setExpenses(expenseRows.data || [])
      if (shareRows.data?.[0]) setSettings({ owner: Number(shareRows.data[0].owner_percent), technical: Number(shareRows.data[0].technical_partner_percent), manager: Number(shareRows.data[0].store_manager_percent) })
    }
    setLoading(false)
  }, [range.start, range.end, toast])
  useEffect(() => { void load() }, [load])

  const saveExpense = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = { name: expenseForm.name.trim(), category: expenseForm.category, amount: Number(expenseForm.amount), incurred_on: expenseForm.expense_date, notes: expenseForm.notes.trim() || "" }
    if (!payload.name || !(payload.amount > 0)) return toast("Enter an expense name and a positive amount.", "error")
    const result = editing
      ? await supabase.from("business_expenses").update(payload).eq("id", editing)
      : await supabase.from("business_expenses").insert(payload)
    if (result.error) return toast(result.error.message, "error")
    toast(editing ? "Expense updated." : "Expense recorded.")
    setEditing(null)
    setExpenseForm({ name: "", category: "Other", amount: "", expense_date: dateString(new Date()), notes: "" })
    await load()
  }

  const saveShares = async (event: React.FormEvent) => {
    event.preventDefault()
    if (settings.owner + settings.technical + settings.manager !== 100) return toast("Profit shares must total exactly 100%.", "error")
    const { error } = await supabase.rpc("admin_update_profit_shares", { p_owner_percent: settings.owner, p_technical_partner_percent: settings.technical, p_store_manager_percent: settings.manager })
    if (error) return toast(error.message, "error")
    toast("New profit share settings saved.")
    await load()
  }

  const shareSum = settings.owner + settings.technical + settings.manager
  const stats = [
    ["Gross Revenue", report?.gross_revenue, "Eligible realized revenue"], ["Product Cost", report?.product_cost, "Cost snapshots for sold units"], ["Business Expenses", report?.business_expenses, "Recorded deductible expenses"], ["Net Profit", report?.net_profit, "Revenue − product cost − expenses"],
    ["Owner Share", report?.owner_share, `${settings.owner}% of net profit`], ["My Technical Share", report?.technical_partner_share, `${settings.technical}% of net profit`], ["Store Manager Share", report?.store_manager_share, `${settings.manager}% of net profit`],
  ] as const

  return <div className="space-y-6 text-[var(--ma-foreground)]">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-[var(--ma-muted)]">Finance</p><h1 className="mt-1 text-2xl font-bold">Profit &amp; commissions</h1><p className="mt-1 text-sm text-[var(--ma-muted)]">Realized sales, recorded costs and auditable partner shares.</p></div><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[var(--ma-border)] px-3 py-2 text-sm"><RefreshCw size={15}/>Refresh</button></div>
    <section className="rounded-2xl border border-[var(--ma-border)] bg-[var(--ma-card)] p-4 sm:p-5"><div className="flex flex-wrap items-center gap-3"><CalendarDays size={18} className="text-[#2B8EF0]"/><h2 className="font-semibold">Reporting period</h2><div className="flex flex-wrap gap-2">{(["current", "previous", "custom"] as const).map(item => <button key={item} onClick={() => setMode(item)} className={`rounded-lg px-3 py-2 text-sm capitalize ${mode === item ? "bg-[#2B8EF0] text-white" : "bg-[var(--ma-background)] text-[var(--ma-muted)]"}`}>{item === "current" ? "Current month" : item === "previous" ? "Previous month" : "Custom dates"}</button>)}</div>{mode === "custom" && <div className="flex gap-2"><input aria-label="Start date" type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm"/><input aria-label="End date" type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm"/></div>}</div></section>
    {report?.missing_cost_items ? <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">Profit shares are withheld because {report.missing_cost_items} sold item(s) have no verified product cost snapshot. Add verified costs and use the finance migration; no estimated values are substituted.</div> : null}
    {loading ? <p className="py-6 text-sm text-[var(--ma-muted)]">Loading financial report…</p> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, hint]) => <article key={label} className="rounded-2xl border border-[var(--ma-border)] bg-[var(--ma-card)] p-4"><p className="text-sm text-[var(--ma-muted)]">{label}</p><p className="mt-2 text-xl font-bold">{money(value)}</p><p className="mt-1 text-xs text-[var(--ma-muted)]">{hint}</p></article>)}</div>}
    <p className="rounded-xl bg-[var(--ma-card)] p-4 text-sm text-[var(--ma-muted)]">Calculation: <strong className="text-[var(--ma-foreground)]">Net profit = eligible realized revenue − product cost (COGS) − recorded business expenses.</strong> COD orders count on delivery; non-COD counts only when payment succeeded. Cancelled and failed orders are excluded. Refunds / returns must be recorded as expenses.</p>
    <section className="rounded-2xl border border-[var(--ma-border)] bg-[var(--ma-card)] p-4 sm:p-5"><h2 className="mb-4 font-semibold">Monthly report</h2><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs text-[var(--ma-muted)]"><tr>{["Period", "Orders", "Units", "Revenue", "Product cost", "Expenses", "Net profit", "Owner", "Technical", "Manager"].map(x => <th key={x} className="px-2 py-2">{x}</th>)}</tr></thead><tbody>{(report?.months || []).map(row => <tr key={row.month} className="border-t border-[var(--ma-border)]"><td className="px-2 py-3">{row.month}</td><td className="px-2 py-3">{row.orders}</td><td className="px-2 py-3">{row.units_sold}</td>{[row.gross_revenue,row.product_cost,row.business_expenses,row.net_profit,row.owner_share,row.technical_partner_share,row.store_manager_share].map((value,index) => <td key={index} className="px-2 py-3">{money(value)}</td>)}</tr>)}</tbody></table>{!report && <p className="p-3 text-sm text-[var(--ma-muted)]">No report data for this period.</p>}</div><div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm"><span>My earnings this month: <b>{money(monthReport?.technical_partner_share)}</b></span><span>My earnings this year: <b>{money(yearComplete ? yearRows.reduce((sum,row) => sum + (row.technical_partner_share ?? 0),0) : null)}</b></span></div></section>
    <section className="rounded-2xl border border-[var(--ma-border)] bg-[var(--ma-card)] p-4 sm:p-5"><h2 className="mb-4 font-semibold">Profit share configuration</h2><form onSubmit={saveShares} className="flex flex-wrap items-end gap-3">{([["owner","Owner"],["technical","Technical partner"],["manager","Store manager"]] as const).map(([key,label])=><label key={key} className="text-sm">{label} %<input type="number" min="0" max="100" step="0.01" value={settings[key]} onChange={e=>setSettings(current=>({...current,[key]:Number(e.target.value)}))} className="mt-1 block w-36 rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2"/></label>)}<span className={`pb-2 text-sm ${shareSum===100?"text-emerald-400":"text-red-400"}`}>Total {shareSum}%</span><button disabled={shareSum!==100} className="inline-flex items-center gap-2 rounded-lg bg-[#2B8EF0] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>Save version</button></form><p className="mt-3 text-xs text-[var(--ma-muted)]">Updates are versioned with effective date and admin audit history.</p></section>
    <section className="rounded-2xl border border-[var(--ma-border)] bg-[var(--ma-card)] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Business expenses</h2><p className="mt-1 text-xs text-[var(--ma-muted)]">Expenses are auditable; records cannot be deleted.</p></div></div><form onSubmit={saveExpense} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"> <input required placeholder="Expense name" value={expenseForm.name} onChange={e=>setExpenseForm({...expenseForm,name:e.target.value})} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm"/><select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm,category:e.target.value})} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm">{categories.map(c=><option key={c}>{c}</option>)}</select><input required type="number" min="0.01" step="0.01" placeholder="Amount (PKR)" value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm,amount:e.target.value})} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm"/><input required type="date" value={expenseForm.expense_date} onChange={e=>setExpenseForm({...expenseForm,expense_date:e.target.value})} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm"/><input placeholder="Notes" value={expenseForm.notes} onChange={e=>setExpenseForm({...expenseForm,notes:e.target.value})} className="rounded-lg border border-[var(--ma-border)] bg-[var(--ma-background)] p-2 text-sm"/><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2B8EF0] px-3 py-2 text-sm font-semibold text-white"><Plus size={15}/>{editing?"Update":"Add expense"}</button></form><div className="mt-4 divide-y divide-[var(--ma-border)]">{expenses.map(expense=><div key={expense.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div><b>{expense.name}</b><span className="ml-2 text-[var(--ma-muted)]">{expense.category} · {expense.incurred_on}</span>{expense.notes&&<p className="mt-1 text-xs text-[var(--ma-muted)]">{expense.notes}</p>}</div><div className="flex items-center gap-3"><b>{money(expense.amount)}</b><button onClick={()=>{setEditing(expense.id);setExpenseForm({name:expense.name,category:expense.category,amount:String(expense.amount),expense_date:expense.incurred_on,notes:expense.notes||""})}} className="text-[#2B8EF0]">Edit</button></div></div>)}{!expenses.length&&<p className="py-4 text-sm text-[var(--ma-muted)]">No expenses recorded for this period.</p>}</div></section>
    <div className="flex items-center gap-2 text-xs text-[var(--ma-muted)]"><CircleDollarSign size={14}/>Financial data is provided by admin-only database RPCs and row-level security.</div>
  </div>
}
