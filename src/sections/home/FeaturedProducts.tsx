import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import ProductCard from "../../components/ui/ProductCard"
import ScrollReveal from "../../components/ui/ScrollReveal"

interface Props {
  title?: string
  subtitle?: string
  filter?: (p: any) => boolean
  linkTo?: string
  linkLabel?: string
  featuredIds?: string[]
  accent?: string
}

export default function FeaturedProducts({
  title = "Featured Products",
  subtitle = "Handpicked accessories for your devices",
  filter,
  linkTo = "/shop",
  linkLabel = "View all products",
  featuredIds,
  accent = "Curated Selection",
}: Props) {
  const { products, categories } = useStore()

  let displayed = products.filter(p => p.published)
  if (featuredIds && featuredIds.length > 0) {
    displayed = featuredIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as typeof products
  } else if (filter) {
    displayed = displayed.filter(filter)
  } else {
    displayed = displayed.filter(p => p.featured)
  }
  displayed = displayed.slice(0, 8)

  const getCat = (id: string) => categories.find(c => c.id === id)

  if (displayed.length === 0) return null

  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[11px] font-bold text-[#2B8EF0] uppercase tracking-[0.2em] mb-3">{accent}</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">{title}</h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md">{subtitle}</p>
            </div>
            <Link
              to={linkTo}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-white transition-colors group shrink-0"
            >
              {linkLabel}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayed.map((product, i) => (
            <ScrollReveal key={product.id} delay={Math.min(i * 0.07, 0.42)}>
              <ProductCard product={product} category={getCat(product.categoryId)} />
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            to={linkTo}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            {linkLabel} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
