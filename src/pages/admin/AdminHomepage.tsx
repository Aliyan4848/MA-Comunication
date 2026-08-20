import { useState } from "react"
import { Save, Check } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
import type { HomepageContent } from "../../types"

export default function AdminHomepage() {
  const { homepage, updateHomepage, products } = useStore()
  const { toast } = useToast()
  const [form, setForm] = useState<HomepageContent>({ ...homepage, hero: { ...homepage.hero }, promo: { ...homepage.promo }, featuredProductIds: [...homepage.featuredProductIds] })
  const [saving, setSaving] = useState(false)

  const save = () => {
    setSaving(true)
    setTimeout(() => { updateHomepage(form); setSaving(false); toast("Homepage updated!") }, 400)
  }

  const inputClass = "w-full bg-[#0A0F16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/50 transition-colors"

  const toggleFeatured = (id: string) => {
    setForm(prev => ({
      ...prev,
      featuredProductIds: prev.featuredProductIds.includes(id)
        ? prev.featuredProductIds.filter(x => x !== id)
        : [...prev.featuredProductIds, id],
    }))
  }

  const publishedProducts = products.filter(p => p.published)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Homepage</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage homepage content</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition-all">
          <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Hero */}
        <Section title="Hero Section">
          <Field label="Headline">
            <input value={form.hero.title} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, title: e.target.value } }))} className={inputClass} placeholder="Power Your Everyday." />
          </Field>
          <Field label="Subtitle">
            <textarea value={form.hero.subtitle} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, subtitle: e.target.value } }))} rows={3} className={inputClass + " resize-none"} />
          </Field>
          <Field label="Hero Image URL">
            <input value={form.hero.image} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, image: e.target.value } }))} className={inputClass} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary CTA Text">
              <input value={form.hero.ctaText} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, ctaText: e.target.value } }))} className={inputClass} />
            </Field>
            <Field label="Primary CTA Link">
              <input value={form.hero.ctaLink} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, ctaLink: e.target.value } }))} className={inputClass} />
            </Field>
            <Field label="Secondary CTA Text">
              <input value={form.hero.secondaryCtaText} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, secondaryCtaText: e.target.value } }))} className={inputClass} />
            </Field>
            <Field label="Secondary CTA Link">
              <input value={form.hero.secondaryCtaLink} onChange={e => setForm(f => ({ ...f, hero: { ...f.hero, secondaryCtaLink: e.target.value } }))} className={inputClass} />
            </Field>
          </div>
        </Section>

        {/* Promo Banner */}
        <Section title="Promotional Banner">
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.promo.enabled} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, enabled: e.target.checked } }))} className="accent-[#2B8EF0]" />
              <span className="text-sm text-gray-300">Enable promotional banner</span>
            </label>
          </div>
          <div className={form.promo.enabled ? "" : "opacity-40 pointer-events-none"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Banner Title">
                <input value={form.promo.title} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, title: e.target.value } }))} className={inputClass} />
              </Field>
              <Field label="Banner Subtitle">
                <input value={form.promo.subtitle} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, subtitle: e.target.value } }))} className={inputClass} />
              </Field>
              <Field label="CTA Text">
                <input value={form.promo.ctaText} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, ctaText: e.target.value } }))} className={inputClass} />
              </Field>
              <Field label="CTA Link">
                <input value={form.promo.ctaLink} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, ctaLink: e.target.value } }))} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Banner Image URL">
                  <input value={form.promo.image} onChange={e => setForm(f => ({ ...f, promo: { ...f.promo, image: e.target.value } }))} className={inputClass} placeholder="https://..." />
                </Field>
              </div>
            </div>
          </div>
        </Section>

        {/* Featured Products */}
        <Section title="Featured Products Selection">
          <p className="text-xs text-gray-500 mb-4">{form.featuredProductIds.length} products selected. Click to toggle.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {publishedProducts.map(p => {
              const selected = form.featuredProductIds.includes(p.id)
              return (
                <button key={p.id} onClick={() => toggleFeatured(p.id)} className={`relative rounded-xl overflow-hidden border transition-all text-left ${selected ? "border-[#2B8EF0] bg-[#2B8EF0]/5" : "border-white/5 bg-[#10151D] hover:border-white/15"}`}>
                  <div className="aspect-square overflow-hidden">
                    <img src={p.images[0]?.url || ""} alt={p.name} className="w-full h-full object-cover opacity-70" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-white line-clamp-2 leading-snug">{p.name}</p>
                  </div>
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#2B8EF0] rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Section>
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
