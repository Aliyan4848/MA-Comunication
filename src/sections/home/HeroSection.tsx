import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ShoppingBag, Star, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { useRef } from "react"
import { useStore } from "../../contexts/StoreContext"

const PRODUCT_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop&auto=format",
    label: "Pro ANC Earbuds",
    price: "Rs. 3,999",
    tag: "Best Seller",
    tagColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    offset: "-translate-y-4",
  },
  {
    url: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&h=500&fit=crop&auto=format",
    label: "SmartWatch Pro S5",
    price: "Rs. 10,999",
    tag: "New",
    tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    offset: "translate-y-6",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format",
    label: "65W GaN Charger",
    price: "Rs. 1,999",
    tag: "-20%",
    tagColor: "bg-[#2B8EF0]/20 text-[#2B8EF0] border-[#2B8EF0]/30",
    offset: "-translate-y-8",
  },
]

export default function HeroSection() {
  const { homepage, products } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 60])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 30])

  return (
    <section ref={ref} className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#05070A]" />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #2B8EF0, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #00D4FF, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 xl:gap-20 items-center min-h-[80vh]">
          {/* Left — Text */}
          <motion.div style={{ y, opacity }} className="flex flex-col">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="self-start"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2B8EF0]/25 bg-[#2B8EF0]/8 mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B8EF0] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B8EF0]" />
                </span>
                <span className="text-[#2B8EF0] text-xs font-semibold tracking-wide">Premium Mobile Accessories · Pakistan</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl lg:text-[68px] xl:text-7xl font-black text-white leading-[1.02] tracking-tight mb-6"
            >
              {homepage.hero.title.split(".")[0]}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #2B8EF0, #00D4FF)" }}>.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="text-base sm:text-lg text-gray-400 leading-relaxed mb-10 max-w-[480px]"
            >
              {homepage.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to={homepage.hero.ctaLink}
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 font-semibold text-white rounded-xl transition-all duration-200 text-sm"
                style={{ background: "linear-gradient(135deg, #2B8EF0, #1A7DE0)" }}
              >
                <ShoppingBag size={16} />
                {homepage.hero.ctaText}
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to={homepage.hero.secondaryCtaLink}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 font-semibold text-gray-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 text-sm"
              >
                Browse Categories
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
              className="flex items-center gap-6 mt-12 pt-10 border-t border-white/5"
            >
              <div className="flex -space-x-2">
                {["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format",
                  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&auto=format",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format"].map((src, i) => (
                  <img key={i} src={src} alt="Customer" className="w-8 h-8 rounded-full border-2 border-[#05070A] object-cover" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Trusted by 10,000+ customers</p>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div>
                <p className="text-base font-bold text-white">COD</p>
                <p className="text-xs text-gray-500 mt-0.5">Available</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Product Grid */}
          <motion.div style={{ y: yImg }} className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[480px]">
              {/* Main hero image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/5"
                style={{ background: "linear-gradient(160deg, #10151D 0%, #0A0F16 100%)" }}
              >
                <div className="absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(43,142,240,0.08) 0%, transparent 70%)" }} />
                <img
                  src={homepage.hero.image}
                  alt="MA Communication products"
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                  loading="eager"
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, #05070A 0%, rgba(5,7,10,0.4) 40%, transparent 100%)" }} />

                {/* Floating product mini cards on image */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-16 left-5 bg-[#0A0F16]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2B8EF0]/15 flex items-center justify-center text-lg">⚡</div>
                    <div>
                      <p className="text-[11px] text-gray-500 leading-none">New Arrival</p>
                      <p className="text-sm font-bold text-white mt-0.5">65W GaN Charger</p>
                      <p className="text-xs text-[#2B8EF0] font-semibold">Rs. 1,999</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute top-8 right-5 bg-[#0A0F16]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-lg">📦</div>
                    <div>
                      <p className="text-[11px] text-gray-500 leading-none">Fast Delivery</p>
                      <p className="text-sm font-bold text-white mt-0.5">Nationwide</p>
                      <p className="text-xs text-emerald-400 font-semibold">COD Available</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Three product thumbnails below */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                {PRODUCT_IMAGES.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-[#2B8EF0]/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden bg-[#10151D]">
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/90 via-[#05070A]/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${p.tagColor} mb-1 inline-block`}>
                        {p.tag}
                      </span>
                      <p className="text-[11px] font-bold text-white leading-none truncate">{p.label}</p>
                      <p className="text-[10px] text-[#2B8EF0] font-semibold mt-0.5">{p.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, #05070A, transparent)" }} />
    </section>
  )
}
