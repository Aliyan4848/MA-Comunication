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
}

interface StoreContextType {
  products: Product[]
  categories: Category[]
  orders: Order[]
  settings: SiteSettings
  homepage: HomepageContent
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
}

const StoreContext = createContext<StoreContextType | null>(null)

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
