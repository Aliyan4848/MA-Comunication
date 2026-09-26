import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  mapCategory, mapProduct, mapSettings, mapHomepage, mapOrder,
  productToRow, categoryToRow, settingsToRow, homepageToRow,
} from "../lib/mappers"
import { useAuth } from "./AuthContext"
<<<<<<< HEAD
import type { Category, Product, Order, OrderStatus, SiteSettings, HomepageContent } from "../types"
=======
import type { Category, Product, Order, SiteSettings, HomepageContent } from "../types"
>>>>>>> a03a587 (safety fixes)

export interface CheckoutInput {
  customerName: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
  items: { productId: string; quantity: number }[]
<<<<<<< HEAD
=======
  idempotencyKey: string
>>>>>>> a03a587 (safety fixes)
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
<<<<<<< HEAD
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
=======
>>>>>>> a03a587 (safety fixes)
  getOrder: (id: string) => Order | undefined
  refreshOrders: () => Promise<void>

  updateSettings: (s: SiteSettings) => Promise<void>
  updateHomepage: (h: HomepageContent) => Promise<void>

  uploadProductImage: (file: File) => Promise<string>

  // Customer account features
  fetchMyProfile: () => Promise<{ fullName: string; phone: string } | null>
  updateMyProfile: (fullName: string, phone: string) => Promise<void>
  fetchMyAddresses: () => Promise<any[]>
  addMyAddress: (a: { label: string; fullName: string; phone: string; addressLine: string; city: string; isDefault: boolean }) => Promise<void>
  updateMyAddress: (id: string, a: { label: string; fullName: string; phone: string; addressLine: string; city: string; isDefault: boolean }) => Promise<void>
  deleteMyAddress: (id: string) => Promise<void>
  fetchMyOrders: () => Promise<any[]>
  fetchMyOrderDetail: (orderId: string) => Promise<any>
  trackGuestOrder: (orderNumber: string, contact: string) => Promise<any>
  updateOrderStatusAdmin: (orderId: string, newStatus: string, note?: string) => Promise<void>
  setOrderShipment: (orderId: string, courier: string, trackingNumber: string) => Promise<void>
  fetchProductReviews: (productId: string) => Promise<{ reviews: any[]; stats: any }>
  submitReview: (productId: string, orderId: string, rating: number, title: string, body: string) => Promise<void>
}

const StoreContext = createContext<StoreContextType | null>(null)

const PRODUCT_COLUMNS = "id,name,slug,sku,brand,short_description,description,price,sale_price,stock,low_stock_threshold,category_id,specifications,features,featured,new_arrival,best_seller,published,created_at,updated_at"

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
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: false })
    if (err) { setError(err.message); return }

    const productIds = (data || []).map(product => product.id)
    const [{ data: imageRows, error: imageError }, { data: costRows, error: costError }] = await Promise.all([
      productIds.length
        ? supabase.from("product_images").select("id,product_id,url,alt,sort_order").in("product_id", productIds)
        : Promise.resolve({ data: [], error: null }),
      isAdmin
        ? supabase.rpc("admin_get_product_costs")
        : Promise.resolve({ data: [], error: null }),
    ])
    if (imageError) { setError(imageError.message); return }
    if (costError) { setError(costError.message); return }

    const imagesByProduct = new Map<string, any[]>()
    for (const image of imageRows || []) {
      const rows = imagesByProduct.get(image.product_id) || []
      rows.push(image)
      imagesByProduct.set(image.product_id, rows)
    }
    const costsByProduct = new Map((costRows || []).map((row: any) => [row.product_id, row.cost_price]))
    setProducts((data || []).map(product => mapProduct({
      ...product,
      product_images: imagesByProduct.get(product.id) || [],
      cost_price: isAdmin ? costsByProduct.get(product.id) ?? null : null,
    })))
  }, [isAdmin])

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
    const { error: costError } = await supabase.rpc("admin_set_product_cost", {
      p_product_id: data.id,
      p_cost_price: p.costPrice ?? null,
    })
    if (costError) throw new Error(costError.message)
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
    const { error: costError } = await supabase.rpc("admin_set_product_cost", {
      p_product_id: p.id,
      p_cost_price: p.costPrice ?? null,
    })
    if (costError) throw new Error(costError.message)
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
<<<<<<< HEAD
    const idempotencyKey = crypto.randomUUID()
=======
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.idempotencyKey)) {
      throw new Error("Invalid checkout attempt. Refresh checkout and try again.")
    }
>>>>>>> a03a587 (safety fixes)
    const { data, error: err } = await supabase.rpc("create_order", {
      p_customer_name: input.customerName,
      p_phone: input.phone,
      p_email: input.email,
      p_city: input.city,
      p_address: input.address,
      p_notes: input.notes,
      p_items: input.items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
<<<<<<< HEAD
      p_idempotency_key: idempotencyKey,
=======
      p_idempotency_key: input.idempotencyKey,
>>>>>>> a03a587 (safety fixes)
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

<<<<<<< HEAD
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    const { error: err } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    if (err) throw new Error(err.message)
    await refreshOrders()
  }, [refreshOrders])

=======
>>>>>>> a03a587 (safety fixes)
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

  // ---------------- Customer account features ----------------
  const fetchMyProfile = useCallback(async () => {
    const { data: sess } = await supabase.auth.getUser()
    if (!sess.user) return null
    const { data, error: err } = await supabase.from("profiles").select("full_name, phone").eq("id", sess.user.id).maybeSingle()
    if (err || !data) return { fullName: "", phone: "" }
    return { fullName: data.full_name || "", phone: data.phone || "" }
  }, [])

  const updateMyProfile = useCallback(async (fullName: string, phone: string) => {
    const { data: sess } = await supabase.auth.getUser()
    if (!sess.user) throw new Error("Not signed in")
    const { error: err } = await supabase.from("profiles").upsert({ id: sess.user.id, full_name: fullName, phone, updated_at: new Date().toISOString() })
    if (err) throw new Error(err.message)
  }, [])

  const fetchMyAddresses = useCallback(async () => {
    const { data, error: err } = await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at", { ascending: false })
    if (err) throw new Error(err.message)
    return data || []
  }, [])

  const addMyAddress = useCallback(async (a: any) => {
    const { data: sess } = await supabase.auth.getUser()
    if (!sess.user) throw new Error("Not signed in")
    if (a.isDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", sess.user.id)
    const { error: err } = await supabase.from("addresses").insert({
      user_id: sess.user.id, label: a.label, full_name: a.fullName, phone: a.phone, address_line: a.addressLine, city: a.city, is_default: a.isDefault,
    })
    if (err) throw new Error(err.message)
  }, [])

  const updateMyAddress = useCallback(async (id: string, a: any) => {
    const { data: sess } = await supabase.auth.getUser()
    if (a.isDefault && sess.user) await supabase.from("addresses").update({ is_default: false }).eq("user_id", sess.user.id)
    const { error: err } = await supabase.from("addresses").update({
      label: a.label, full_name: a.fullName, phone: a.phone, address_line: a.addressLine, city: a.city, is_default: a.isDefault,
    }).eq("id", id)
    if (err) throw new Error(err.message)
  }, [])

  const deleteMyAddress = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("addresses").delete().eq("id", id)
    if (err) throw new Error(err.message)
  }, [])

  const fetchMyOrders = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, courier, tracking_number, order_items(name, image, quantity)")
      .order("created_at", { ascending: false })
    if (err) throw new Error(err.message)
    return data || []
  }, [])

  const fetchMyOrderDetail = useCallback(async (orderId: string) => {
    const { data, error: err } = await supabase.rpc("get_my_order", { p_order_id: orderId })
    if (err) throw new Error(err.message)
    return data
  }, [])

  const trackGuestOrder = useCallback(async (orderNumber: string, contact: string) => {
    const { data, error: err } = await supabase.rpc("track_guest_order", { p_order_number: orderNumber, p_contact: contact })
    if (err) throw new Error(err.message)
    // The function returns { error, message } instead of raising, so that a
    // failed lookup still commits its brute-force-protection bookkeeping
    // (an uncaught Postgres exception would roll that back along with it).
    if (data && typeof data === "object" && "error" in data) {
      throw new Error((data as any).message || "No order found matching that order number and contact info")
    }
    return data
  }, [])

  const updateOrderStatusAdmin = useCallback(async (orderId: string, newStatus: string, note?: string) => {
    const { error: err } = await supabase.rpc("update_order_status", { p_order_id: orderId, p_new_status: newStatus, p_changed_by: "admin", p_note: note || "" })
    if (err) throw new Error(err.message)
    await refreshOrders()
  }, [refreshOrders])

  const setOrderShipment = useCallback(async (orderId: string, courier: string, trackingNumber: string) => {
    const { error: err } = await supabase.rpc("set_order_shipment", { p_order_id: orderId, p_courier: courier, p_tracking_number: trackingNumber })
    if (err) throw new Error(err.message)
    await refreshOrders()
  }, [refreshOrders])

  const fetchProductReviews = useCallback(async (productId: string) => {
    const [{ data: reviewRows }, { data: statsRow }] = await Promise.all([
      supabase.from("reviews").select("*, review_images(url)").eq("product_id", productId).eq("status", "approved").order("created_at", { ascending: false }),
      supabase.from("product_review_stats").select("*").eq("product_id", productId).maybeSingle(),
    ])
    return { reviews: reviewRows || [], stats: statsRow || { review_count: 0, average_rating: 0, distribution: {} } }
  }, [])

  const submitReview = useCallback(async (productId: string, orderId: string, rating: number, title: string, body: string) => {
    const { error: err } = await supabase.rpc("submit_review", { p_product_id: productId, p_order_id: orderId, p_rating: rating, p_title: title, p_body: body })
    if (err) throw new Error(err.message)
  }, [])

  return (
    <StoreContext.Provider
      value={{
        products, categories, orders, settings, homepage, loading, ordersLoading, error,
        addProduct, updateProduct, deleteProduct, getProduct,
        addCategory, updateCategory, deleteCategory,
<<<<<<< HEAD
        placeOrder, fetchPublicOrder, updateOrderStatus, getOrder, refreshOrders,
=======
        placeOrder, fetchPublicOrder, getOrder, refreshOrders,
>>>>>>> a03a587 (safety fixes)
        updateSettings, updateHomepage, uploadProductImage,
        fetchMyProfile, updateMyProfile, fetchMyAddresses, addMyAddress, updateMyAddress, deleteMyAddress,
        fetchMyOrders, fetchMyOrderDetail, trackGuestOrder, updateOrderStatusAdmin, setOrderShipment,
        fetchProductReviews, submitReview,
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
