<<<<<<< HEAD
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
=======
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Product, Category, Order, SiteSettings, HomepageContent } from "../types"
import { defaultProducts, defaultCategories, defaultSettings, defaultHomepageContent } from "../data/seed"

const DATA_VERSION = "v3"

const KEYS = {
  products: "ma_products",
  categories: "ma_categories",
  orders: "ma_orders",
  settings: "ma_settings",
  homepage: "ma_homepage",
  initialized: "ma_initialized",
  version: "ma_data_version",
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
}

interface StoreContextType {
  products: Product[]
  categories: Category[]
  orders: Order[]
  settings: SiteSettings
  homepage: HomepageContent
<<<<<<< HEAD
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
=======
  // Products
  addProduct: (p: Product) => void
  updateProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  getProduct: (slug: string) => Product | undefined
  // Categories
  addCategory: (c: Category) => void
  updateCategory: (c: Category) => void
  deleteCategory: (id: string) => void
  // Orders
  addOrder: (o: Order) => void
  updateOrderStatus: (id: string, status: Order["status"]) => void
  getOrder: (id: string) => Order | undefined
  // Settings
  updateSettings: (s: SiteSettings) => void
  // Homepage
  updateHomepage: (h: HomepageContent) => void
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
}

const StoreContext = createContext<StoreContextType | null>(null)

<<<<<<< HEAD
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
=======
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [homepage, setHomepage] = useState<HomepageContent>(defaultHomepageContent)

  useEffect(() => {
    const storedVersion = localStorage.getItem(KEYS.version)
    const isInit = localStorage.getItem(KEYS.initialized)
    if (!isInit || storedVersion !== DATA_VERSION) {
      save(KEYS.products, defaultProducts)
      save(KEYS.categories, defaultCategories)
      save(KEYS.orders, [])
      save(KEYS.settings, defaultSettings)
      save(KEYS.homepage, defaultHomepageContent)
      localStorage.setItem(KEYS.initialized, "1")
      localStorage.setItem(KEYS.version, DATA_VERSION)
    }
    setProducts(load(KEYS.products, defaultProducts))
    setCategories(load(KEYS.categories, defaultCategories))
    setOrders(load(KEYS.orders, []))
    setSettings(load(KEYS.settings, defaultSettings))
    setHomepage(load(KEYS.homepage, defaultHomepageContent))
    setInitialized(true)
  }, [])

  const addProduct = useCallback((p: Product) => {
    setProducts(prev => {
      const next = [p, ...prev]
      save(KEYS.products, next)
      return next
    })
  }, [])

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => {
      const next = prev.map(x => (x.id === p.id ? p : x))
      save(KEYS.products, next)
      return next
    })
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const next = prev.filter(x => x.id !== id)
      save(KEYS.products, next)
      return next
    })
  }, [])

  const getProduct = useCallback(
    (slug: string) => products.find(p => p.slug === slug),
    [products]
  )

  const addCategory = useCallback((c: Category) => {
    setCategories(prev => {
      const next = [...prev, c]
      save(KEYS.categories, next)
      return next
    })
  }, [])

  const updateCategory = useCallback((c: Category) => {
    setCategories(prev => {
      const next = prev.map(x => (x.id === c.id ? c : x))
      save(KEYS.categories, next)
      return next
    })
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => {
      const next = prev.filter(x => x.id !== id)
      save(KEYS.categories, next)
      return next
    })
  }, [])

  const addOrder = useCallback((o: Order) => {
    setOrders(prev => {
      const next = [o, ...prev]
      save(KEYS.orders, next)
      return next
    })
  }, [])

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, status } : o))
      save(KEYS.orders, next)
      return next
    })
  }, [])

  const getOrder = useCallback(
    (id: string) => orders.find(o => o.id === id),
    [orders]
  )

  const updateSettings = useCallback((s: SiteSettings) => {
    setSettings(s)
    save(KEYS.settings, s)
  }, [])

  const updateHomepage = useCallback((h: HomepageContent) => {
    setHomepage(h)
    save(KEYS.homepage, h)
  }, [])

  if (!initialized) return null

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        settings,
        homepage,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addOrder,
        updateOrderStatus,
        getOrder,
        updateSettings,
        updateHomepage,
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
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
