import { useState } from "react"
import { Plus, Edit, Trash2, X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
import type { Category } from "../../types"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

const empty = (): Category => ({ id: "", name: "", slug: "", description: "", image: "", active: true, sortOrder: 0 })

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)

  const openNew = () => { setEditing(empty()); setIsNew(true) }
  const openEdit = (c: Category) => { setEditing({ ...c }); setIsNew(false) }
  const close = () => { setEditing(null); setIsNew(false) }

  const save = () => {
    if (!editing?.name) return
    if (isNew) {
      addCategory({ ...editing, id: "cat-" + Date.now(), slug: slugify(editing.name), sortOrder: categories.length + 1 })
      toast("Category created")
    } else {
      updateCategory({ ...editing, slug: editing.slug || slugify(editing.name) })
      toast("Category updated")
    }
    close()
  }

  const handleDelete = (id: string) => {
    deleteCategory(id)
    setConfirmDelete(null)
    toast("Category deleted", "error")
  }

  const inputClass = "w-full bg-[#0A0F16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/50 transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="rounded-xl bg-[#10151D] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Category</th>
              <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase hidden sm:table-cell">Slug</th>
              <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase">Order</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {c.image && <img src={c.image} alt={c.name} className="w-9 h-9 rounded-lg object-cover bg-[#0A0F16] border border-white/5 shrink-0" />}
                    <div>
                      <p className="text-white font-medium text-sm">{c.name}</p>
                      {c.description && <p className="text-gray-600 text-xs line-clamp-1">{c.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs font-mono hidden sm:table-cell">{c.slug}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-500"}`}>
                    {c.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm">{c.sortOrder}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#2B8EF0]/10 flex items-center justify-center text-gray-500 hover:text-[#2B8EF0] transition-all">
                      <Edit size={13} />
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="bg-[#0A0F16] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">{isNew ? "Add Category" : "Edit Category"}</h3>
                <button onClick={close} className="text-gray-500 hover:text-white"><X size={16} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Category Name *</label>
                  <input value={editing.name} onChange={e => setEditing(p => p ? ({ ...p, name: e.target.value, slug: slugify(e.target.value) }) : p)} placeholder="Chargers & Adapters" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Slug</label>
                  <input value={editing.slug} onChange={e => setEditing(p => p ? ({ ...p, slug: e.target.value }) : p)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
                  <textarea value={editing.description} onChange={e => setEditing(p => p ? ({ ...p, description: e.target.value }) : p)} rows={2} className={inputClass + " resize-none"} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Image URL</label>
                  <input value={editing.image} onChange={e => setEditing(p => p ? ({ ...p, image: e.target.value }) : p)} placeholder="https://..." className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Sort Order</label>
                    <input type="number" value={editing.sortOrder} onChange={e => setEditing(p => p ? ({ ...p, sortOrder: +e.target.value }) : p)} className={inputClass} min={0} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1.5">Status</label>
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input type="checkbox" checked={editing.active} onChange={e => setEditing(p => p ? ({ ...p, active: e.target.checked }) : p)} className="accent-[#2B8EF0]" />
                      <span className="text-sm text-gray-400">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={close} className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white">Cancel</button>
                <button onClick={save} className="flex-1 py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl text-sm transition-all">
                  {isNew ? "Create" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#10151D] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-semibold text-white mb-2">Delete Category?</h3>
              <p className="text-sm text-gray-400 mb-6">Products in this category will not be deleted, but they will lose their category assignment.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
