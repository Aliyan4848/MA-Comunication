import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ChevronLeft, ShoppingCart, Minus, Plus, Share2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "../contexts/StoreContext"
import { useCart } from "../contexts/CartContext"
import { useToast } from "../contexts/ToastContext"
import ProductCard from "../components/ui/ProductCard"
import ScrollReveal from "../components/ui/ScrollReveal"
import ProductReviews from "../components/ui/ProductReviews"
import { useSeo, useStructuredData } from "../lib/seo"

function formatPrice(p: number) {
  return "Rs. " + p.toLocaleString()
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { products, categories } = useStore()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()

  const product = products.find(p => p.slug === slug)
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)

  useSeo({
    title: product ? product.name : "Product not found",
    description: product ? (product.shortDescription || product.description).slice(0, 160) : undefined,
    path: `/products/${slug || ""}`,
    image: product?.images[0]?.url,
    noIndex: !product || !product.published,
  })
  useStructuredData(
    product && product.published
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription || product.description,
          sku: product.sku,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          image: product.images.map(i => i.url),
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: product.salePrice ?? product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }
      : null
  )

  if (!product || !product.published) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--ma-foreground)] mb-3">Product not found</p>
          <Link to="/shop" className="text-[#2B8EF0] hover:underline text-sm">Back to shop</Link>
        </div>
      </div>
    )
  }

  const category = categories.find(c => c.id === product.categoryId)
  const price = product.salePrice ?? product.price
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0
  const mainImage = product.images[imgIdx]?.url || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&auto=format"

  const related = products
    .filter(p => p.published && p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    if (product.stock === 0) return
    addToCart({ productId: product.id, name: product.name, price, image: mainImage, quantity: qty, stock: product.stock })
    toast(`${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate("/cart")
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--ma-muted)] mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-[var(--ma-foreground)] transition-colors">
            <ChevronLeft size={14} /> Back
          </button>
          <span>/</span>
          {category && <Link to={`/categories/${category.slug}`} className="hover:text-[var(--ma-foreground)] transition-colors">{category.name}</Link>}
          <span>/</span>
          <span className="text-[var(--ma-muted)] truncate max-w-48">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-[var(--ma-card)] mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={mainImage}
                  alt={product.images[imgIdx]?.alt || product.name}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === imgIdx ? "border-[#2B8EF0]" : "border-[var(--ma-border)] hover:border-white/30"}`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {category && (
              <Link to={`/categories/${category.slug}`} className="text-xs text-[#2B8EF0] uppercase tracking-widest mb-3 hover:underline">
                {category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ma-foreground)] mb-4 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[var(--ma-foreground)]">{formatPrice(price)}</span>
              {product.salePrice && (
                <>
                  <span className="text-lg text-[var(--ma-muted)] line-through">{formatPrice(product.price)}</span>
                  <span className="text-sm font-semibold text-[#2B8EF0] bg-[#2B8EF0]/10 px-2 py-0.5 rounded-full">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${product.stock === 0 ? "bg-red-500" : product.stock <= product.lowStockThreshold ? "bg-yellow-500" : "bg-emerald-500"}`} />
              <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-400" : product.stock <= product.lowStockThreshold ? "text-yellow-400" : "text-emerald-400"}`}>
                {product.stock === 0 ? "Out of Stock" : product.stock <= product.lowStockThreshold ? `Only ${product.stock} left` : "In Stock"}
              </span>
              <span className="text-[var(--ma-muted)] text-sm">· SKU: {product.sku}</span>
            </div>

            <p className="text-[var(--ma-muted)] text-sm leading-relaxed mb-8">{product.shortDescription}</p>

            {/* Qty + Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-3 bg-[var(--ma-card)] border border-[var(--ma-border)] rounded-xl px-3 py-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] transition-colors">
                    <Minus size={15} />
                  </button>
                  <span className="w-6 text-center text-[var(--ma-foreground)] font-medium text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] transition-colors">
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2B8EF0]/10 hover:bg-[#2B8EF0] border border-[#2B8EF0]/30 hover:border-transparent text-[#2B8EF0] hover:text-white font-semibold rounded-xl transition-all duration-200"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            )}

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full py-3.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#2B8EF0]/25"
            >
              {product.stock === 0 ? "Out of Stock" : "Buy Now — Cash on Delivery"}
            </button>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mt-8 pt-8 border-t border-[var(--ma-border)]">
                <p className="text-xs font-semibold text-[var(--ma-foreground)] uppercase tracking-widest mb-4">Key Features</p>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--ma-muted)]">
                      <span className="text-[#2B8EF0] mt-0.5 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Description + Specs tabs */}
        <DescriptionSpecs product={product} />

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-8">
                <h2 className="text-xl font-bold text-[var(--ma-foreground)]">Related Products</h2>
                {category && (
                  <Link to={`/categories/${category.slug}`} className="text-sm text-[var(--ma-muted)] hover:text-[var(--ma-foreground)] flex items-center gap-1 transition-colors">
                    View all <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.07}>
                  <ProductCard product={p} category={category} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DescriptionSpecs({ product }: { product: any }) {
  const [tab, setTab] = useState<"description" | "specs">("description")
  const specKeys = Object.keys(product.specifications)

  return (
    <div>
      <div className="flex gap-4 border-b border-[var(--ma-border)] mb-8">
        {(["description", "specs"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize transition-all border-b-2 ${tab === t ? "border-[#2B8EF0] text-[var(--ma-foreground)]" : "border-transparent text-[var(--ma-muted)] hover:text-[var(--ma-foreground)]"}`}
          >
            {t === "description" ? "Description" : "Specifications"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "description" ? (
          <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-[var(--ma-muted)] leading-relaxed text-sm max-w-3xl">{product.description}</p>
          </motion.div>
        ) : (
          <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {specKeys.length === 0 ? (
              <p className="text-[var(--ma-muted)] text-sm">No specifications available.</p>
            ) : (
              <div className="max-w-2xl">
                <table className="w-full">
                  <tbody>
                    {specKeys.map((key, i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-[var(--ma-card)]" : ""}>
                        <td className="py-2.5 px-4 text-xs font-semibold text-[var(--ma-muted)] w-40 rounded-l-lg">{key}</td>
                        <td className="py-2.5 px-4 text-sm text-[var(--ma-foreground)] rounded-r-lg">{product.specifications[key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
