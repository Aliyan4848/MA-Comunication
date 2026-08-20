import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Edit, Trash2, Copy, Eye, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
import type { Product } from "../../types"

function fmt(n: number) { return "Rs. " + n.toLocaleString() }

export default function AdminProducts() {
  const { products, categories, deleteProduct, addProduct } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchCat = !catFilter || p.categoryId === catFilter
    return matchSearch && matchCat
  })

  const getCat = (id: string) => categories.find(c => c.id === id)?.name || "—"

  const handleDelete = (id: string) => {
    deleteProduct(id)
    setConfirmDelete(null)
    toast("Product deleted", "error")
  }

  const handleDuplicate = (p: Product) => {
    const dup: Product = {
      ...p,
      id: "prod-" + Date.now(),
      name: p.name + " (Copy)",
      slug: p.slug + "-copy-" + Date.now(),
      sku: p.sku + "-COPY",
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addProduct(dup)
    toast("Product duplicated as draft")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all text-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-[#10151D] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/40" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-[#10151D] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#2B8EF0]/40 cursor-pointer">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#10151D] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Product</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Category</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Price</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Stock</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Flags</th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium uppercase tracking-wide">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-600 text-sm">No products found</td></tr>
                ) : (
                  filtered.map(p => (
                    <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]?.url || ""}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#0A0F16] border border-white/5 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm line-clamp-1">{p.name}</p>
                            <p className="text-gray-600 text-xs font-mono">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{getCat(p.categoryId)}</td>
                      <td className="py-3 px-4">
                        <p className="text-white text-sm font-medium">{fmt(p.salePrice ?? p.price)}</p>
                        {p.salePrice && <p className="text-gray-600 text-xs line-through">{fmt(p.price)}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${p.stock === 0 ? "text-red-400" : p.stock <= p.lowStockThreshold ? "text-yellow-400" : "text-emerald-400"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {p.featured && <span className="text-[10px] px-1.5 py-0.5 bg-[#2B8EF0]/10 text-[#2B8EF0] rounded border border-[#2B8EF0]/20">Featured</span>}
                          {p.newArrival && <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">New</span>}
                          {p.bestSeller && <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded border border-violet-500/20">Best</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-500"}`}>
                          {p.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 justify-end">
                          <a href={`/products/${p.slug}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                            <Eye size={13} />
                          </a>
                          <button onClick={() => navigate(`/admin/products/${p.id}`)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#2B8EF0]/10 flex items-center justify-center text-gray-500 hover:text-[#2B8EF0] transition-all">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDuplicate(p)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                            <Copy size={13} />
                          </button>
                          <button onClick={() => setConfirmDelete(p.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#10151D] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-semibold text-white mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
