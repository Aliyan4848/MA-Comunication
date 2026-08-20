import { motion } from "framer-motion"
import { ShoppingCart, Heart, Eye } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import type { Product, Category } from "../../types"
import { useCart } from "../../contexts/CartContext"
import { useToast } from "../../contexts/ToastContext"

interface Props {
  product: Product
  category?: Category
}

function fmt(p: number) {
  return "Rs. " + p.toLocaleString()
}

export default function ProductCard({ product, category }: Props) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const mainImage =
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop&auto=format"
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0
  const displayPrice = product.salePrice ?? product.price
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock) return
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      image: mainImage,
      quantity: 1,
      stock: product.stock,
    })
    toast(`Added to cart`)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300"
      style={{ background: "#10151D", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image area */}
        <div className="relative overflow-hidden bg-[#0A0F16]" style={{ aspectRatio: "1 / 1" }}>
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(10,15,22,0.6) 0%, transparent 60%)" }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2B8EF0] text-white">
                -{discount}%
              </span>
            )}
            {product.newArrival && !discount && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                New
              </span>
            )}
            {product.bestSeller && !discount && !product.newArrival && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-violet-500/15 text-violet-300 border-violet-500/30">
                Best Seller
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
              <span className="text-white text-xs font-semibold tracking-wide bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
            <button
              onClick={e => e.preventDefault()}
              className="w-8 h-8 rounded-xl bg-[#0A0F16]/85 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-400/30 transition-all"
              aria-label="Wishlist"
            >
              <Heart size={13} />
            </button>
            <button
              onClick={e => { e.preventDefault(); navigate(`/products/${product.slug}`) }}
              className="w-8 h-8 rounded-xl bg-[#0A0F16]/85 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all"
              aria-label="View product"
            >
              <Eye size={13} />
            </button>
          </div>

          {/* Hover border accent */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#2B8EF0]/20 rounded-2xl transition-all duration-300 pointer-events-none" />
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          {category && (
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
              {category.name}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-200 leading-snug line-clamp-2 mb-3 group-hover:text-white transition-colors flex-1">
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-black text-white">{fmt(displayPrice)}</span>
            {product.salePrice && (
              <span className="text-xs text-gray-600 line-through">{fmt(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                outOfStock ? "bg-red-500" : lowStock ? "bg-yellow-500" : "bg-emerald-500"
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                outOfStock ? "text-red-400" : lowStock ? "text-yellow-400" : "text-emerald-400"
              }`}
            >
              {outOfStock ? "Out of Stock" : lowStock ? `Only ${product.stock} left` : "In Stock"}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: outOfStock ? "rgba(255,255,255,0.04)" : "rgba(43,142,240,0.1)",
            border: `1px solid ${outOfStock ? "rgba(255,255,255,0.06)" : "rgba(43,142,240,0.25)"}`,
            color: outOfStock ? "#4B5563" : "#2B8EF0",
          }}
          onMouseEnter={e => {
            if (!outOfStock) {
              (e.currentTarget as HTMLButtonElement).style.background = "#2B8EF0"
              ;(e.currentTarget as HTMLButtonElement).style.color = "#fff"
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"
            }
          }}
          onMouseLeave={e => {
            if (!outOfStock) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(43,142,240,0.1)"
              ;(e.currentTarget as HTMLButtonElement).style.color = "#2B8EF0"
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(43,142,240,0.25)"
            }
          }}
        >
          <ShoppingCart size={14} />
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  )
}
