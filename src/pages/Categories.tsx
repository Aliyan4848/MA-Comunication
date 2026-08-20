import { useParams, Link } from "react-router-dom"
import { useStore } from "../contexts/StoreContext"
import ProductCard from "../components/ui/ProductCard"
import ScrollReveal from "../components/ui/ScrollReveal"
import { motion } from "framer-motion"

export function CategoriesPage() {
  const { categories } = useStore()
  const active = categories.filter(c => c.active).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-white mb-2">All Categories</h1>
          <p className="text-gray-500 text-sm mb-10">Browse our complete range of mobile accessories</p>
        </ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {active.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 0.06}>
              <Link to={`/categories/${cat.slug}`} className="group block">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#10151D] border border-white/5 group-hover:border-[#2B8EF0]/30 transition-colors">
                  <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/80 via-[#05070A]/20 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <p className="text-sm font-semibold text-white">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>}
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { categories, products } = useStore()
  const category = categories.find(c => c.slug === slug)
  const catProducts = products.filter(p => p.published && p.categoryId === category?.id)
  const getCat = (id: string) => categories.find(c => c.id === id)

  if (!category) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-white font-semibold mb-3">Category not found</p>
        <Link to="/categories" className="text-[#2B8EF0] hover:underline text-sm">View all categories</Link>
      </div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ScrollReveal>
          <div className="mb-10">
            <Link to="/categories" className="text-xs text-gray-500 hover:text-white transition-colors mb-4 block">← All Categories</Link>
            <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
            {category.description && <p className="text-gray-500 text-sm">{category.description}</p>}
            <p className="text-gray-600 text-sm mt-1">{catProducts.length} products</p>
          </div>
        </ScrollReveal>
        {catProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {catProducts.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} category={getCat(p.categoryId)} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
