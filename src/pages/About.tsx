import { Shield, Zap, Star, Users } from "lucide-react"
import { Link } from "react-router-dom"
import ScrollReveal from "../components/ui/ScrollReveal"

export default function About() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <div className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(43,142,240,0.1) 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-xs font-semibold text-[#2B8EF0] uppercase tracking-widest mb-4">About Us</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Mobile accessories,<br />reimagined for Pakistan.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              MA Communication is a modern mobile accessories brand dedicated to bringing premium-quality technology products to customers across Pakistan. We curate a carefully selected range of chargers, cables, earbuds, power banks, smartwatches, and gadgets — all designed to complement your digital lifestyle.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 px-4 sm:px-6 bg-[#0A0F16] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-white text-center mb-12">What We Stand For</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Genuine Quality", desc: "Every product is verified for quality and authenticity before it reaches our catalogue." },
              { icon: Zap, title: "Modern Technology", desc: "We stay ahead of the curve so you always have access to the latest accessories." },
              { icon: Star, title: "Best Value", desc: "Premium products at fair prices — no compromise on quality, no inflated margins." },
              { icon: Users, title: "Customer First", desc: "We take care of our customers before, during and after every purchase." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="rounded-xl bg-[#10151D] border border-white/5 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#2B8EF0]/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon size={20} className="text-[#2B8EF0]" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                MA Communication started with a simple observation: finding reliable, affordable mobile accessories in Pakistan was harder than it should be. Too many options, too little quality assurance, and no single trusted destination.
              </p>
              <p>
                We set out to change that. By building a curated catalogue of products that we personally test and stand behind, we created a brand that customers can trust. Whether you need a fast charger for your laptop, wireless earbuds for your commute, or a power bank for long days out, we have you covered.
              </p>
              <p>
                Today, MA Communication serves customers across Pakistan with fast delivery, cash-on-delivery convenience, and the assurance that every product meets our standards.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-white mb-4">Ready to explore?</h2>
            <p className="text-gray-500 mb-6 text-sm">Discover our full range of premium mobile accessories.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#2B8EF0]/25">
              Shop Now
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
