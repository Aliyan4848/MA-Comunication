import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import ScrollReveal from "../../components/ui/ScrollReveal"

export default function CategoriesSection() {
  const { categories, products } = useStore()
  const active = categories.filter(c => c.active).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8)

  const getCount = (id: string) => products.filter(p => p.published && p.categoryId === id).length

  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[11px] font-bold text-[#2B8EF0] uppercase tracking-[0.2em] mb-3">Shop By Category</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Everything you need,<br className="hidden sm:block" /> all in one place.
              </h2>
            </div>
            <Link
              to="/categories"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-white transition-colors group"
            >
              View all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Featured large + small grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {active.map((cat, i) => {
            const isLarge = i === 0
            return (
              <ScrollReveal key={cat.id} delay={Math.min(i * 0.06, 0.35)} className={isLarge ? "col-span-2 row-span-2 sm:col-span-1 sm:row-span-1 lg:col-span-2 lg:row-span-2" : ""}>
                <Link to={`/categories/${cat.slug}`} className="group block h-full">
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    transition={{ duration: 0.2 }}
                    className={`relative overflow-hidden rounded-2xl border border-white/5 group-hover:border-[#2B8EF0]/25 transition-all duration-300 bg-[#10151D] ${isLarge ? "aspect-[4/3] lg:aspect-[4/3]" : "aspect-[4/3]"}`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                    {/* Gradient */}
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(10,15,22,0.92) 0%, rgba(10,15,22,0.3) 50%, transparent 100%)" }}
                    />
                    {/* Hover accent */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "radial-gradient(ellipse at bottom center, rgba(43,142,240,0.12) 0%, transparent 70%)" }}
                    />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-bold text-white text-sm sm:text-base leading-tight mb-1">{cat.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{getCount(cat.id)} products</p>
                        <span className="flex items-center gap-1 text-xs text-[#2B8EF0] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Shop <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
            View all categories <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
