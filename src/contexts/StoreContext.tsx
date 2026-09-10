import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  mapCategory, mapProduct, mapSettings, mapHomepage, mapOrder,
  productToRow, categoryToRow, settingsToRow, homepageToRow,
} from "../lib/mappers"
import { useAuth } from "./AuthContext"
import type { Category, Product, Order, OrderStatus, SiteSettings, HomepageContent } from "../types"

export interface CheckoutInput {
  customerName: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
  items: { productId: string; quantity: number }[]
}

export interface CheckoutResult {
  orderId: string
  orderNumber: string
  total: number
}

interface StoreContextType {
  products: Product[]
  categories: Category[]
  orders: Order[]
  settings: SiteSettings
  homepage: HomepageContent
  loading: boolean
  ordersLoading: boolean
  error: string | null

  addProduct: (p: Product) => Promise<void>
  updateProduct: (p: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProduct: (slug: string) => Product | undefined

  addCategory: (c: Category) => Promise<void>
  updateCategory: (c: Category) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  placeOrder: (input: CheckoutInput) => Promise<CheckoutResult>
  fetchPublicOrder: (id: string) => Promise<Order | null>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  getOrder: (id: string) => Order | undefined
  refreshOrders: () => Promise<void>

  updateSettings: (s: SiteSettings) => Promise<void>
  updateHomepage: (h: HomepageContent) => Promise<void>

  uploadProductImage: (file: File) => Promise<string>
}

const StoreContext = createContext<StoreContextType | null>(null)

const emptySettings: SiteSettings = {
  businessName: "", logo: "", tagline: "", phone: "", email: "", address: "",
  whatsapp: "", facebook: "", instagram: "", tiktok: "", hours: "", footerText: "",
  deliveryCharge: 0, currency: "PKR",
}

const emptyHomepage: HomepageContent = {
  hero: { title: "", subtitle: "", ctaText: "", ctaLink: "", secondaryCtaText: "", secondaryCtaLink: "", image: "" },
  promo: { title: "", subtitle: "", ctaText: "", ctaLink: "", image: "", enabled: false },
  featuredProductIds: [],
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<SiteSettings>(emptySettings)
  const [homepage, setHomepage] = useState<HomepageContent>(emptyHomepage)
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshProducts = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .order("created_at", { ascending: false })
    if (err) { setError(err.message); return }
    setProducts((data || []).map(mapProduct))
  }, [])

  const refreshCategories = useCallback(async () => {
    const { data, error: err } = await supabase.from("categories").select("*").order("sort_order")
    if (err) { setError(err.message); return }
    setCategories((data || []).map(mapCategory))
  }, [])

  const refreshSettings = useCallback(async () => {
    const { data, error: err } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
    if (err) { setError(err.message); return }
    if (data) setSettings(mapSettings(data))
  }, [])

  const refreshHomepage = useCallback(async () => {
    const { data, error: err } = await supabase.from("homepage_content").select("*").eq("id", 1).maybeSingle()
    if (err) { setError(err.message); return }
    if (data) setHomepage(mapHomepage(data))
  }, [])

  const refreshOrders = useCallback(async () => {
    if (!isAdmin) { setOrders([]); return }
    setOrdersLoading(true)
    const { data, error: err } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
    setOrdersLoading(false)
    if (err) { setError(err.message); return }
    setOrders((data || []).map(mapOrder))
  }, [isAdmin])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([refreshProducts(), refreshCategories(), refreshSettings(), refreshHomepage()]).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [refreshProducts, refreshCategories, refreshSettings, refreshHomepage])

  useEffect(() => { refreshOrders() }, [refreshOrders])

  // ---------------- Products ----------------
  const addProduct = useCallback(async (p: Product) => {
    const { data, error: err } = await supabase.from("products").insert(productToRow(p)).select("id").single()
    if (err) throw new Error(err.message)
    if (p.images.length > 0 && data) {
      const rows = p.images.map((img, i) => ({ product_id: data.id, url: img.url, alt: img.alt, sort_order: i }))
      const { error: imgErr } = await supabase.from("product_images").insert(rows)
      if (imgErr) throw new Error(imgErr.message)
    }
    await refreshProducts()
  }, [refreshProducts])

  const updateProduct = useCallback(async (p: Product) => {
    const { error: err } = await supabase.from("products").update(productToRow(p)).eq("id", p.id)
    if (err) throw new Error(err.message)
    // Replace image set (simple + correct; catalog-sized data makes this cheap)
    const { error: delErr } = await supabase.from("product_images").delete().eq("product_id", p.id)
    if (delErr) throw new Error(delErr.message)
    if (p.images.length > 0) {
      const rows = p.images.map((img, i) => ({ product_id: p.id, url: img.url, alt: img.alt, sort_order: i }))
      const { error: imgErr } = await supabase.from("product_images").insert(rows)
      if (imgErr) throw new Error(imgErr.message)
    }
    await refreshProducts()
  }, [refreshProducts])

  const deleteProduct = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("products").delete().eq("id", id)
    if (err) throw new Error(err.message)
    await refreshProducts()
  }, [refreshProducts])

  const getProduct = useCallback((slug: string) => products.find(p => p.slug === slug), [products])

  const uploadProductImage = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop() || "jpg"
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: err } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })
    if (err) throw new Error(err.message)
    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    return data.publicUrl
  }, [])

  // ---------------- Categories ----------------
  const addCategory = useCallback(async (c: Category) => {
    const { error: err } = await supabase.from("categories").insert(categoryToRow(c))
    if (err) throw new Error(err.message)
    await refreshCategories()
  }, [refreshCategories])

  const updateCategory = useCallback(async (c: Category) => {
    const { error: err } = await supabase.from("categories").update(categoryToRow(c)).eq("id", c.id)
    if (err) throw new Error(err.message)
    await refreshCategories()
  }, [refreshCategories])

  const deleteCategory = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("categories").delete().eq("id", id)
    if (err) throw new Error(err.message)
    await refreshCategories()
  }, [refreshCategories])

  // ---------------- Orders ----------------
  // The ONLY path to creating an order: a SECURITY DEFINER Postgres function that
  // validates stock and computes prices server-side. The browser never sets a price.
  const placeOrder = useCallback(async (input: CheckoutInput): Promise<CheckoutResult> => {
    const idempotencyKey = crypto.randomUUID()
    const { data, error: err } = await supabase.rpc("create_order", {
      p_customer_name: input.customerName,
      p_phone: input.phone,
      p_email: input.email,
      p_city: input.city,
      p_address: input.address,
      p_notes: input.notes,
      p_items: input.items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
      p_idempotency_key: idempotencyKey,
    })
    if (err) throw new Error(err.message)
    const result = data as { id: string; order_number: string; total: number }
    await refreshProducts() // stock changed
    return { orderId: result.id, orderNumber: result.order_number, total: Number(result.total) }
  }, [refreshProducts])

  const fetchPublicOrder = useCallback(async (id: string): Promise<Order | null> => {
    const { data, error: err } = await supabase.rpc("get_order_public", { p_order_id: id })
    if (err || !data) return null
    return mapOrder(data)
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    const { error: err } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    if (err) throw new Error(err.message)
    await refreshOrders()
  }, [refreshOrders])

  const getOrder = useCallback((id: string) => orders.find(o => o.id === id), [orders])

  // ---------------- Settings / Homepage ----------------
  const updateSettings = useCallback(async (s: SiteSettings) => {
    const { error: err } = await supabase.from("site_settings").update(settingsToRow(s)).eq("id", 1)
    if (err) throw new Error(err.message)
    setSettings(s)
  }, [])

  const updateHomepage = useCallback(async (h: HomepageContent) => {
    const { error: err } = await supabase.from("homepage_content").update(homepageToRow(h)).eq("id", 1)
    if (err) throw new Error(err.message)
    setHomepage(h)
  }, [])

  return (
    <StoreContext.Provider
      value={{
        products, categories, orders, settings, homepage, loading, ordersLoading, error,
        addProduct, updateProduct, deleteProduct, getProduct,
        addCategory, updateCategory, deleteCategory,
        placeOrder, fetchPublicOrder, updateOrderStatus, getOrder, refreshOrders,
        updateSettings, updateHomepage, uploadProductImage,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}
