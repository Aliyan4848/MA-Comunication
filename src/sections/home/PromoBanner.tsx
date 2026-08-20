import { Link } from "react-router-dom"
import { ArrowRight, Tag } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import ScrollReveal from "../../components/ui/ScrollReveal"

export default function PromoBanner() {
  const { homepage } = useStore()
  const { promo } = homepage
  if (!promo.enabled) return null

  return (
    <section className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden min-h-[240px] flex items-center border border-white/5">
            {/* Base */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #080C12 0%, #0A0F16 100%)" }} />

            {/* Background image */}
            {promo.image && (
              <>
                <div className="absolute inset-0">
                  <img src={promo.image} alt="" className="w-full h-full object-cover opacity-15" />
                </div>
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, #080C12 30%, rgba(8,12,18,0.7) 60%, rgba(8,12,18,0.2) 100%)" }}
                />
              </>
            )}

            {/* Decorative blue glow right side */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #2B8EF0, transparent 70%)", filter: "blur(60px)" }} />
            </div>

            {/* Grid lines overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative px-8 sm:px-14 py-12">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#2B8EF0]/15 border border-[#2B8EF0]/25 flex items-center justify-center">
                  <Tag size={12} className="text-[#2B8EF0]" />
                </div>
                <p className="text-[11px] font-bold text-[#2B8EF0] uppercase tracking-[0.18em]">Special Offer</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight max-w-xl">
                {promo.title}
              </h2>
              <p className="text-gray-400 text-base mb-8 max-w-lg leading-relaxed">{promo.subtitle}</p>
              <Link
                to={promo.ctaLink}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 font-bold text-white rounded-xl transition-all duration-200 text-sm group"
                style={{ background: "linear-gradient(135deg, #2B8EF0, #1A7DE0)" }}
              >
                {promo.ctaText}
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
