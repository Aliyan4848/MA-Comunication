export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  brand: string
  shortDescription: string
  description: string
  price: number
  salePrice?: number
  costPrice?: number
  stock: number
  lowStockThreshold: number
  categoryId: string
  images: ProductImage[]
  specifications: Record<string, string>
  features: string[]
  featured: boolean
  newArrival: boolean
  bestSeller: boolean
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  sortOrder: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  active: boolean
  sortOrder: number
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
<<<<<<< HEAD
  orderNumber: string
=======
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
  customerName: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
  items: OrderItem[]
  subtotal: number
  deliveryCharge: number
  total: number
  status: OrderStatus
  paymentMethod: string
  createdAt: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface SiteSettings {
  businessName: string
  logo: string
  tagline: string
  phone: string
  email: string
  address: string
  whatsapp: string
  facebook: string
  instagram: string
  tiktok: string
  hours: string
  footerText: string
<<<<<<< HEAD
  deliveryCharge: number
  currency: string
=======
  adminPassword: string
  deliveryCharge: number
>>>>>>> edf10e1ecac4770e7e71900a0fd57266b81d2cc3
}

export interface HomepageContent {
  hero: {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    secondaryCtaText: string
    secondaryCtaLink: string
    image: string
  }
  promo: {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    image: string
    enabled: boolean
  }
  featuredProductIds: string[]
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}
