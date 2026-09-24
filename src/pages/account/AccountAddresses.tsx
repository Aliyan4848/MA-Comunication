import { useEffect, useState } from "react"
import { Plus, Star, Trash2, Pencil, X } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"

const emptyForm = { label: "Home", fullName: "", phone: "", addressLine: "", city: "", isDefault: false }

export default function AccountAddresses() {
  const { fetchMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress } = useStore()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => fetchMyAddresses().then(a => { setAddresses(a); setLoading(false) })
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(emptyForm); setEditing("new") }
  const openEdit = (a: any) => {
    setForm({ label: a.label, fullName: a.full_name, phone: a.phone, addressLine: a.address_line, city: a.city, isDefault: a.is_default })
    setEditing(a.id)
  }

  const save = async () => {
    if (!form.fullName || !form.phone || !form.addressLine || !form.city) {
      toast("Please fill in all fields", "error"); return
    }
    try {
      if (editing === "new") await addMyAddress(form)
      else await updateMyAddress(editing, form)
      setEditing(null)
      await load()
      toast("Address saved")
    } catch (e: any) {
      toast(e.message || "Failed to save address", "error")
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteMyAddress(id)
      await load()
      toast("Address removed")
    } catch (e: any) {
      toast(e.message || "Failed to remove address", "error")
    }
  }

  if (loading) return <p className="text-[var(--ma-muted)] text-sm">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--ma-foreground)]">Saved Addresses</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 text-xs text-[#2B8EF0] hover:underline">
          <Plus size={14} /> Add Address
        </button>
      </div>

      {addresses.length === 0 && !editing && (
        <p className="text-sm text-[var(--ma-muted)] bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">No saved addresses yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map(a => (
          <div key={a.id} className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--ma-foreground)]">{a.label}</p>
                {a.is_default && <span className="text-[10px] bg-[#2B8EF0]/10 text-[#2B8EF0] px-1.5 py-0.5 rounded flex items-center gap-1"><Star size={9} fill="currentColor" /> Default</span>}
              </div>
              <p className="text-xs text-[var(--ma-muted)] mt-1">{a.full_name} · {a.phone}</p>
              <p className="text-xs text-[var(--ma-muted)]">{a.address_line}, {a.city}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(a)} className="p-1.5 text-[var(--ma-muted)] hover:text-[var(--ma-foreground)]"><Pencil size={14} /></button>
              <button onClick={() => remove(a.id)} className="p-1.5 text-[var(--ma-muted)] hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--ma-foreground)]">{editing === "new" ? "New Address" : "Edit Address"}</h3>
            <button onClick={() => setEditing(null)}><X size={16} className="text-[var(--ma-muted)]" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Label (Home, Office...)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none" />
            <input placeholder="Full name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none" />
            <input placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none" />
            <input placeholder="Street address" value={form.addressLine} onChange={e => setForm(f => ({ ...f, addressLine: e.target.value }))} className="sm:col-span-2 bg-[var(--ma-surface)] border border-[var(--ma-border)] rounded-xl px-3 py-2 text-sm text-[var(--ma-foreground)] outline-none" />
            <label className="flex items-center gap-2 text-xs text-[var(--ma-muted)] sm:col-span-2">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} /> Set as default address
            </label>
          </div>
          <button onClick={save} className="mt-4 px-4 py-2 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white text-sm font-medium rounded-xl transition-all">Save Address</button>
        </div>
      )}
    </div>
  )
}
