import { useState } from "react"
import { Phone, Mail, MapPin, Clock, Globe, Link2, MessageCircle } from "lucide-react"
import { useStore } from "../contexts/StoreContext"
import { useToast } from "../contexts/ToastContext"
import ScrollReveal from "../components/ui/ScrollReveal"

export default function Contact() {
  const { settings } = useStore()
  const { toast } = useToast()
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.message) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setForm({ name: "", phone: "", email: "", message: "" })
      toast("Message sent! We will get back to you soon.")
    }, 800)
  }

  const inputClass = "w-full bg-[#0A0F16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/50 transition-colors"

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#2B8EF0] uppercase tracking-widest mb-3">Get In Touch</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">We're here to help</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Questions about a product? Need help with your order? Reach out — we typically respond within a few hours.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <ScrollReveal direction="left">
              <div className="rounded-xl bg-[#10151D] border border-white/5 p-6 space-y-5">
                {settings.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2B8EF0]/10 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-[#2B8EF0]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <a href={`tel:${settings.phone}`} className="text-sm text-white hover:text-[#2B8EF0] transition-colors font-medium">{settings.phone}</a>
                    </div>
                  </div>
                )}
                {settings.whatsapp && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <MessageCircle size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                      <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-emerald-400 transition-colors font-medium">{settings.whatsapp}</a>
                    </div>
                  </div>
                )}
                {settings.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2B8EF0]/10 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-[#2B8EF0]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${settings.email}`} className="text-sm text-white hover:text-[#2B8EF0] transition-colors font-medium">{settings.email}</a>
                    </div>
                  </div>
                )}
                {settings.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2B8EF0]/10 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-[#2B8EF0]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm text-white font-medium">{settings.address}</p>
                    </div>
                  </div>
                )}
                {settings.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2B8EF0]/10 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-[#2B8EF0]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Hours</p>
                      <p className="text-sm text-white font-medium">{settings.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.1}>
              <div className="rounded-xl bg-[#10151D] border border-white/5 p-6">
                <p className="text-xs font-semibold text-white uppercase tracking-wide mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {settings.facebook && (
                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#2B8EF0]/10 flex items-center justify-center text-gray-400 hover:text-[#2B8EF0] transition-all">
                      <Globe size={16} />
                    </a>
                  )}
                  {settings.instagram && (
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-500/10 flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all">
                      <Link2 size={16} />
                    </a>
                  )}
                  {settings.whatsapp && (
                    <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-all">
                      <MessageCircle size={16} />
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Form */}
          <ScrollReveal direction="right">
            <div className="rounded-xl bg-[#10151D] border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-5">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Your Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Full name" className={inputClass} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+92..." className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
                    <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@..." className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="How can we help you?" rows={5} required className={inputClass + " resize-none"} />
                </div>
                <button type="submit" disabled={sending} className="w-full py-3 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-[#2B8EF0]/25">
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
