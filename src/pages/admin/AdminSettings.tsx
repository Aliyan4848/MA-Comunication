import { useState } from "react"
import { Save, Eye, EyeOff } from "lucide-react"
import { useStore } from "../../contexts/StoreContext"
import { useToast } from "../../contexts/ToastContext"
<<<<<<< HEAD
import { useAuth } from "../../contexts/AuthContext"
=======
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
import type { SiteSettings } from "../../types"

export default function AdminSettings() {
  const { settings, updateSettings } = useStore()
  const { toast } = useToast()
<<<<<<< HEAD
  const { updatePassword } = useAuth()
  const [form, setForm] = useState<SiteSettings>({ ...settings })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [passSaving, setPassSaving] = useState(false)

  const set = (field: keyof SiteSettings, val: any) => setForm(prev => ({ ...prev, [field]: val }))

  const save = async () => {
    setSaving(true)
    try {
      await updateSettings(form)
      toast("Settings saved!")
    } catch (e: any) {
      toast(e.message || "Failed to save settings", "error")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (newPassword.length < 8) { toast("Password must be at least 8 characters", "error"); return }
    setPassSaving(true)
    const { error } = await updatePassword(newPassword)
    setPassSaving(false)
    if (error) { toast(error, "error"); return }
    setNewPassword("")
    toast("Admin password updated!")
=======
  const [form, setForm] = useState<SiteSettings>({ ...settings })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (field: keyof SiteSettings, val: any) => setForm(prev => ({ ...prev, [field]: val }))

  const save = () => {
    setSaving(true)
    setTimeout(() => { updateSettings(form); setSaving(false); toast("Settings saved!") }, 400)
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
  }

  const inputClass = "w-full bg-[#0A0F16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#2B8EF0]/50 transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage business information and website settings</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#2B8EF0] hover:bg-[#1A7DE0] text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition-all">
          <Save size={15} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Business Info */}
        <Section title="Business Information">
          <Field label="Business Name">
            <input value={form.businessName} onChange={e => set("businessName", e.target.value)} className={inputClass} placeholder="MA Communication" />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={e => set("tagline", e.target.value)} className={inputClass} placeholder="Power Your Everyday" />
          </Field>
          <Field label="Footer Description">
            <textarea value={form.footerText} onChange={e => set("footerText", e.target.value)} rows={2} className={inputClass + " resize-none"} />
          </Field>
        </Section>

        {/* Contact */}
        <Section title="Contact Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputClass} placeholder="+92 300 0000000" />
            </Field>
            <Field label="WhatsApp">
              <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} className={inputClass} placeholder="+92 300 0000000" />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={e => set("email", e.target.value)} className={inputClass} placeholder="info@..." type="email" />
            </Field>
            <Field label="Business Hours">
              <input value={form.hours} onChange={e => set("hours", e.target.value)} className={inputClass} placeholder="Mon–Sat: 10am–8pm" />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={e => set("address", e.target.value)} className={inputClass} placeholder="City, Pakistan" />
          </Field>
        </Section>

        {/* Social */}
        <Section title="Social Media Links">
          <Field label="Facebook URL">
            <input value={form.facebook} onChange={e => set("facebook", e.target.value)} className={inputClass} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="Instagram URL">
            <input value={form.instagram} onChange={e => set("instagram", e.target.value)} className={inputClass} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="TikTok URL">
            <input value={form.tiktok} onChange={e => set("tiktok", e.target.value)} className={inputClass} placeholder="https://tiktok.com/@..." />
          </Field>
        </Section>

        {/* Orders */}
        <Section title="Order Settings">
          <Field label="Delivery Charge (Rs.)">
            <input type="number" value={form.deliveryCharge} onChange={e => set("deliveryCharge", +e.target.value)} className={inputClass} min={0} />
          </Field>
          <p className="text-xs text-gray-600">This amount is added to every order at checkout.</p>
        </Section>

        {/* Admin */}
        <Section title="Admin Access">
<<<<<<< HEAD
          <Field label="New Admin Password">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
=======
          <Field label="Admin Password">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.adminPassword}
                onChange={e => set("adminPassword", e.target.value)}
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
                className={inputClass + " pr-10"}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
<<<<<<< HEAD
          <button
            onClick={changePassword}
            disabled={passSaving || newPassword.length === 0}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-all"
          >
            {passSaving ? "Updating..." : "Update Password"}
          </button>
          <p className="text-xs text-gray-600">
            Sign-in is handled by Supabase Auth. To add or remove admin accounts, use the Supabase dashboard (Authentication → Users, then add the user's id to the <code className="text-gray-500">admins</code> table).
          </p>
=======
          <p className="text-xs text-yellow-600">⚠ Store this password securely. You need it to log into this admin panel.</p>
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#10151D] border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
