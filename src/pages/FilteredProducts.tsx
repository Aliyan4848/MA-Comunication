import { useStore } from "../contexts/StoreContext"
import ProductCard from "../components/ui/ProductCard"
import ScrollReveal from "../components/ui/ScrollReveal"

interface Props {
  title: string
  subtitle: string
  filter: (p: any) => boolean
}

export default function FilteredProducts({ title, subtitle, filter }: Props) {
  const { products, categories } = useStore()
  const displayed = products.filter(p => p.published && filter(p))
  const getCat = (id: string) => categories.find(c => c.id === id)

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-500 text-sm mb-10">{subtitle} · {displayed.length} products</p>
        </ScrollReveal>
        {displayed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((p, i) => (
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
