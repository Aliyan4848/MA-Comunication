import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Trash2, GripVertical, Image, Save } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
import type { Product, ProductImage } from "../../types"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

const emptyProduct = (): Product => ({
  id: "",
  name: "",
  slug: "",
  sku: "",
  brand: "",
  shortDescription: "",
  description: "",
  price: 0,
  salePrice: undefined,
  costPrice: undefined,
  stock: 0,
  lowStockThreshold: 5,
  categoryId: "",
  images: [],
  specifications: {},
  features: [],
  featured: false,
  newArrival: false,
  bestSeller: false,
  published: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === "new"
  const { products, categories, addProduct, updateProduct } = useStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const existing = isNew ? null : products.find(p => p.id === id)
  const [form, setForm] = useState<Product>(existing ? { ...existing } : emptyProduct())
  const [specKey, setSpecKey] = useState("")
  const [specVal, setSpecVal] = useState("")
  const [featureInput, setFeatureInput] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [autoSlug, setAutoSlug] = useState(isNew)

  const set = (field: keyof Product, val: any) => setForm(prev => ({ ...prev, [field]: val }))

  const handleNameChange = (name: string) => {
    set("name", name)
    if (autoSlug) set("slug", slugify(name))
  }

  const handleSave = () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast("Please fill in required fields: Name, Price, Category", "error")
      return
    }
    setSaving(true)
    setTimeout(() => {
      const now = new Date().toISOString()
      if (isNew) {
        addProduct({ ...form, id: "prod-" + Date.now(), createdAt: now, updatedAt: now })
        toast("Product created successfully!")
      } else {
        updateProduct({ ...form, updatedAt: now })
        toast("Product updated successfully!")
      }
      setSaving(false)
      navigate("/admin/products")
    }, 400)
  }

  const addImage = () => {
    if (!imageUrl.trim()) return
    const img: ProductImage = {
      id: "img-" + Date.now(),
      url: imageUrl.trim(),
      alt: form.name || "Product image",
      sortOrder: form.images.length,
    }
    set("images", [...form.images, img])
    setImageUrl("")
  }

  const removeImage = (imgId: string) => set("images", form.images.filter(i => i.id !== imgId))

  const addSpec = () => {
    if (!specKey || !specVal) return
    set("specifications", { ...form.specifications, [specKey]: specVal })
    setSpecKey(""); setSpecVal("")
  }

  const removeSpec = (key: string) => {
    const next = { ...form.specifications }
    delete next[key]
    set("specifications", next)
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    set("features", [...form.features, featureInput.trim()])
    setFeatureInput("")
  }

  const inputClass = "w-full bg-[#0A0F16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/50 transition-colors"

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/products")} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{isNew ? "Add New Product" : "Edit Product"}</h1>
          {!isNew && <p className="text-gray-500 text-xs mt-0.5">ID: {form.id}</p>}
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50">
          <Save size={15} /> {saving ? "Saving..." : "Save Product"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information">
            <Field label="Product Name *">
              <input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. 65W GaN Fast Charger" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug">
                <input value={form.slug} onChange={e => { setAutoSlug(false); set("slug", e.target.value) }} placeholder="product-slug" className={inputClass} />
              </Field>
              <Field label="SKU">
                <input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="CHG-65W-GAN" className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand">
                <input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="MA Power" className={inputClass} />
              </Field>
              <Field label="Category *">
                <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} className={inputClass + " cursor-pointer"}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Regular Price (Rs.) *">
                <input type="number" value={form.price || ""} onChange={e => set("price", +e.target.value)} placeholder="2499" className={inputClass} min={0} />
              </Field>
              <Field label="Sale Price (Rs.)">
                <input type="number" value={form.salePrice || ""} onChange={e => set("salePrice", e.target.value ? +e.target.value : undefined)} placeholder="1999" className={inputClass} min={0} />
              </Field>
              <Field label="Cost Price (Rs.)">
                <input type="number" value={form.costPrice || ""} onChange={e => set("costPrice", e.target.value ? +e.target.value : undefined)} placeholder="1200" className={inputClass} min={0} />
              </Field>
            </div>
          </Section>

          {/* Inventory */}
          <Section title="Inventory">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock Quantity">
                <input type="number" value={form.stock} onChange={e => set("stock", +e.target.value)} className={inputClass} min={0} />
              </Field>
              <Field label="Low Stock Threshold">
                <input type="number" value={form.lowStockThreshold} onChange={e => set("lowStockThreshold", +e.target.value)} className={inputClass} min={0} />
              </Field>
            </div>
          </Section>

          {/* Images */}
          <Section title="Product Images">
            <div className="flex gap-2">
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://image-url.com/photo.jpg" className={inputClass + " flex-1"} onKeyDown={e => e.key === "Enter" && addImage()} />
              <button onClick={addImage} className="px-4 py-2.5 bg-[#2B8EF0]/10 hover:bg-[#2B8EF0]/20 text-[#2B8EF0] border border-[#2B8EF0]/30 rounded-xl text-sm transition-colors flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Enter image URL and press Add or Enter. First image is the main image.</p>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {form.images.map((img, i) => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt={img.alt} className="w-20 h-20 rounded-xl object-cover bg-[#0A0F16] border border-white/10" />
                    {i === 0 && <span className="absolute -top-1 -left-1 text-[10px] bg-[#2B8EF0] text-white px-1.5 py-0.5 rounded-full font-bold">Main</span>}
                    <button onClick={() => removeImage(img.id)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Descriptions */}
          <Section title="Product Information">
            <Field label="Short Description">
              <textarea value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} placeholder="One-line product summary..." rows={2} className={inputClass + " resize-none"} />
            </Field>
            <Field label="Full Description">
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Detailed product description..." rows={5} className={inputClass + " resize-none"} />
            </Field>
          </Section>

          {/* Specifications */}
          <Section title="Specifications">
            <div className="flex gap-2">
              <input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="Key (e.g. Length)" className={inputClass + " flex-1"} />
              <input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="Value (e.g. 2 meters)" className={inputClass + " flex-1"} onKeyDown={e => e.key === "Enter" && addSpec()} />
              <button onClick={addSpec} className="px-4 py-2.5 bg-[#2B8EF0]/10 hover:bg-[#2B8EF0]/20 text-[#2B8EF0] border border-[#2B8EF0]/30 rounded-xl text-sm transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {Object.entries(form.specifications).length > 0 && (
              <div className="mt-3 space-y-2">
                {Object.entries(form.specifications).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3 bg-[#0A0F16] rounded-xl px-4 py-2.5">
                    <span className="text-xs font-semibold text-gray-400 w-28 shrink-0">{k}</span>
                    <span className="text-xs text-gray-300 flex-1">{v}</span>
                    <button onClick={() => removeSpec(k)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Features */}
          <Section title="Key Features">
            <div className="flex gap-2">
              <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="e.g. 65W fast charging" className={inputClass + " flex-1"} onKeyDown={e => { if (e.key === "Enter") addFeature() }} />
              <button onClick={addFeature} className="px-4 py-2.5 bg-[#2B8EF0]/10 hover:bg-[#2B8EF0]/20 text-[#2B8EF0] border border-[#2B8EF0]/30 rounded-xl text-sm transition-colors">
                <Plus size={14} />
              </button>
            </div>
            {form.features.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0A0F16] rounded-xl px-4 py-2.5">
                    <span className="text-[#2B8EF0] text-xs shrink-0">✓</span>
                    <span className="text-xs text-gray-300 flex-1">{f}</span>
                    <button onClick={() => set("features", form.features.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Section title="Visibility">
            <div className="space-y-3">
              <Toggle label="Published" desc="Visible on storefront" checked={form.published} onChange={v => set("published", v)} />
              <Toggle label="Featured" desc="Show in Featured section" checked={form.featured} onChange={v => set("featured", v)} />
              <Toggle label="New Arrival" desc="Show in New Arrivals" checked={form.newArrival} onChange={v => set("newArrival", v)} />
              <Toggle label="Best Seller" desc="Show in Best Sellers" checked={form.bestSeller} onChange={v => set("bestSeller", v)} />
            </div>
          </Section>

          {/* Preview */}
          {form.images.length > 0 && (
            <div className="rounded-xl bg-[#10151D] border border-white/5 p-4">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Preview</p>
              <img src={form.images[0].url} alt={form.name} className="w-full aspect-square rounded-xl object-cover bg-[#0A0F16]" />
              <p className="text-sm font-medium text-white mt-3 line-clamp-2">{form.name || "Product name"}</p>
              <p className="text-sm text-[#2B8EF0] font-bold mt-1">
                {form.salePrice ? `Rs. ${form.salePrice.toLocaleString()}` : form.price ? `Rs. ${form.price.toLocaleString()}` : "—"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#10151D] border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-gray-600">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-[#2B8EF0]" : "bg-white/10"}`}
        style={{ height: "22px", width: "40px" }}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? "left-5" : "left-0.5"}`} style={{ width: "18px", height: "18px" }} />
      </button>
    </div>
  )
}
