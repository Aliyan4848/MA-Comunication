import { CheckCircle, Truck, ShieldCheck, MessageSquare } from "lucide-react"
import ScrollReveal from "../../components/ui/ScrollReveal"

const reasons = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Products",
    desc: "Every item in our catalogue is quality-verified before listing. No fakes, no compromises.",
    color: "#2B8EF0",
    glow: "rgba(43,142,240,0.12)",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    desc: "Fast delivery across Pakistan. Cash on Delivery available for your convenience.",
    color: "#00D4FF",
    glow: "rgba(0,212,255,0.1)",
  },
  {
    icon: CheckCircle,
    title: "Device Compatibility",
    desc: "Detailed specs and compatibility guides help you choose the right product every time.",
    color: "#10B981",
    glow: "rgba(16,185,129,0.1)",
  },
  {
    icon: MessageSquare,
    title: "After-Sale Support",
    desc: "Our team is available on WhatsApp and phone for any assistance, before or after purchase.",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.1)",
  },
]

export default function WhySection() {
  return (
    <section className="py-24 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #0A0F16 0%, #080C12 100%)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Left text */}
          <ScrollReveal direction="left">
            <div>
              <p className="text-[11px] font-bold text-[#2B8EF0] uppercase tracking-[0.2em] mb-4">Why MA Communication</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 leading-tight">
                A technology accessories<br />brand built on trust.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-md">
                We started MA Communication because premium mobile accessories in Pakistan were either overpriced or unreliable. We changed that.
              </p>
              <div className="flex items-center gap-8">
                {[
                  { n: "500+", l: "Products" },
                  { n: "COD", l: "Payment" },
                  { n: "PK", l: "Nationwide" },
                ].map(s => (
                  <div key={s.l}>
                    <p className="text-2xl font-black text-white">{s.n}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <ScrollReveal key={r.title} delay={i * 0.1}>
                <div
                  className="relative rounded-2xl border border-white/5 p-5 overflow-hidden group hover:border-white/10 transition-all duration-300"
                  style={{ background: "#10151D" }}
                >
                  {/* Subtle glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${r.glow} 0%, transparent 70%)` }}
                  />
                  <div
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${r.color}18`, border: `1px solid ${r.color}25` }}
                  >
                    <r.icon size={18} style={{ color: r.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 relative">{r.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed relative">{r.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
