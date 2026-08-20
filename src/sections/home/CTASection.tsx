import { Link } from "react-router-dom"
import { ArrowRight, MessageCircle } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import ScrollReveal from "../../components/ui/ScrollReveal"

export default function CTASection() {
  const { settings } = useStore()
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#0A0F16] px-8 py-16">
            <div
              className="absolute inset-0 opacity-40"
              style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(43,142,240,0.15) 0%, transparent 70%)" }}
            />
            <div className="relative">
              <p className="text-xs font-semibold text-[#2B8EF0] uppercase tracking-widest mb-4">Get Started</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Ready to upgrade your setup?
              </h2>
              <p className="text-gray-400 mb-8 text-base">
                Browse our full collection or reach out via WhatsApp for personalised product recommendations.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#2B8EF0]/25"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
                  >
                    <MessageCircle size={16} />
                    WhatsApp Us
                  </a>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
