import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "../contexts/StoreContext"
import ProductCard from "../components/ui/ProductCard"
import ScrollReveal from "../components/ui/ScrollReveal"

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A-Z" },
]

export default function Shop() {
  const { products, categories } = useStore()
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const [search, setSearch] = useState(params.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(params.get("cat") || "")
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(50000)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const [onlyNew, setOnlyNew] = useState(false)
  const [onlyBest, setOnlyBest] = useState(false)
  const [sort, setSort] = useState("featured")

  const activeCategories = categories.filter(c => c.active)

  const filtered = useMemo(() => {
    let list = products.filter(p => p.published)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      )
    }
    if (selectedCategory) list = list.filter(p => p.categoryId === selectedCategory)
    list = list.filter(p => {
      const price = p.salePrice ?? p.price
      return price >= priceMin && price <= priceMax
    })
    if (onlyInStock) list = list.filter(p => p.stock > 0)
    if (onlyFeatured) list = list.filter(p => p.featured)
    if (onlyNew) list = list.filter(p => p.newArrival)
    if (onlyBest) list = list.filter(p => p.bestSeller)

    switch (sort) {
      case "newest": list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break
      case "price-asc": list = [...list].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break
      case "price-desc": list = [...list].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break
      case "name-asc": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [products, search, selectedCategory, priceMin, priceMax, onlyInStock, onlyFeatured, onlyNew, onlyBest, sort])

  const getCat = (id: string) => categories.find(c => c.id === id)

  const clearFilters = () => {
    setSearch(""); setSelectedCategory(""); setPriceMin(0); setPriceMax(50000)
    setOnlyInStock(false); setOnlyFeatured(false); setOnlyNew(false); setOnlyBest(false)
  }

  const hasFilters = search || selectedCategory || onlyInStock || onlyFeatured || onlyNew || onlyBest

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-white uppercase tracking-widest mb-3">Category</p>
        <div className="space-y-1.5">
          <button onClick={() => setSelectedCategory("")} className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? "bg-[#2B8EF0]/10 text-[#2B8EF0]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            All Categories
          </button>
          {activeCategories.map(c => (
            <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedCategory === c.id ? "bg-[#2B8EF0]/10 text-[#2B8EF0]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-white uppercase tracking-widest mb-3">Price Range</p>
        <div className="flex items-center gap-2">
          <input type="number" value={priceMin} onChange={e => setPriceMin(+e.target.value)} min={0}
            className="w-full bg-[#10151D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#2B8EF0]/50" placeholder="Min" />
          <span className="text-gray-600 shrink-0">–</span>
          <input type="number" value={priceMax} onChange={e => setPriceMax(+e.target.value)} min={0}
            className="w-full bg-[#10151D] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#2B8EF0]/50" placeholder="Max" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-white uppercase tracking-widest mb-3">Availability</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={onlyInStock} onChange={e => setOnlyInStock(e.target.checked)} className="accent-[#2B8EF0]" />
          <span className="text-sm text-gray-400">In Stock Only</span>
        </label>
      </div>

      <div>
        <p className="text-xs font-semibold text-white uppercase tracking-widest mb-3">Filter By</p>
        <div className="space-y-2">
          {[
            { label: "Featured", state: onlyFeatured, set: setOnlyFeatured },
            { label: "New Arrivals", state: onlyNew, set: setOnlyNew },
            { label: "Best Sellers", state: onlyBest, set: setOnlyBest },
          ].map(f => (
            <label key={f.label} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={f.state} onChange={e => f.set(e.target.checked)} className="accent-[#2B8EF0]" />
              <span className="text-sm text-gray-400">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 justify-center border border-red-400/20 rounded-lg py-2">
          <X size={13} /> Clear Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Shop</h1>
            <p className="text-gray-500 text-sm">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </ScrollReveal>

        {/* Search + sort bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#10151D] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2B8EF0]/40 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-[#10151D] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-white outline-none focus:border-[#2B8EF0]/40 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#10151D] border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <Filters />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#10151D] flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-600" />
                </div>
                <p className="text-white font-semibold mb-2">No products found</p>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="text-sm text-[#2B8EF0] hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p, i) => (
                  <ScrollReveal key={p.id} delay={Math.min(i * 0.05, 0.4)}>
                    <ProductCard product={p} category={getCat(p.categoryId)} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0A0F16] border-r border-white/5 z-50 overflow-y-auto p-6 admin-scroll"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>
              <Filters />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
