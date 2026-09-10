import { Shield, Layers, Headphones, Zap } from "lucide-react"
import ScrollReveal from "../../components/ui/ScrollReveal"

const items = [
  { icon: Shield, title: "Genuine Quality", desc: "Verified accessories sourced from trusted suppliers" },
  { icon: Layers, title: "500+ Products", desc: "Everything you need for your devices in one place" },
  { icon: Headphones, title: "Real Support", desc: "Customer-focused help before and after purchase" },
  { icon: Zap, title: "Latest Tech", desc: "First access to new gadgets and accessories" },
]

export default function TrustStrip() {
  return (
    <section className="border-y border-white/[0.04]" style={{ background: "#080C12" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {items.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08}>
              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-[#2B8EF0]/10 border border-[#2B8EF0]/15 flex items-center justify-center shrink-0 group-hover:bg-[#2B8EF0]/15 transition-colors">
                  <item.icon size={16} className="text-[#2B8EF0]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
