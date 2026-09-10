import { Link } from "react-router-dom"
import { Zap, Phone, Mail, MapPin, Globe, Video, Link2, MessageCircle } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"

export default function Footer() {
  const { settings } = useStore()

  return (
    <footer className="bg-[#0A0F16] border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2B8EF0]/20 border border-[#2B8EF0]/30 flex items-center justify-center">
                <Zap size={16} className="text-[#2B8EF0]" />
              </div>
              <span className="font-bold text-white">
                MA <span className="text-[#2B8EF0]">Communication</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{settings.footerText}</p>
            <div className="flex flex-col gap-2.5">
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                  <Phone size={14} className="text-[#2B8EF0]" />
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                  <Mail size={14} className="text-[#2B8EF0]" />
                  {settings.email}
                </a>
              )}
              {settings.address && (
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-[#2B8EF0] mt-0.5 shrink-0" />
                  {settings.address}
                </div>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Shop</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { to: "/shop", label: "All Products" },
                { to: "/new-arrivals", label: "New Arrivals" },
                { to: "/best-sellers", label: "Best Sellers" },
                { to: "/categories", label: "Categories" },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { to: "/contact", label: "Contact Us" },
                { to: "/contact", label: "Shipping Info" },
                { to: "/contact", label: "Returns" },
                { to: "/contact", label: "FAQs" },
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex flex-col gap-3">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#2B8EF0]/10 transition-colors">
                    <Globe size={15} className="text-gray-400 group-hover:text-[#2B8EF0]" />
                  </div>
                  Facebook
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                    <Link2 size={15} className="text-gray-400 group-hover:text-pink-400" />
                  </div>
                  Instagram
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Video size={15} className="text-gray-400 group-hover:text-white" />
                  </div>
                  TikTok
                </a>
              )}
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                    <MessageCircle size={15} className="text-gray-400 group-hover:text-green-400" />
                  </div>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2026 {settings.businessName}. All rights reserved.</p>
          <p className="text-xs text-gray-700">Premium Mobile Accessories · Pakistan</p>
        </div>
      </div>
    </footer>
  )
}
