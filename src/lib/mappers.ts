import type { Category, HomepageContent, Order, Product, ProductImage, SiteSettings } from "../types"

// The database uses snake_case; the app's existing components expect the
// camelCase shapes already defined in src/types. These mappers keep that
// boundary in one place instead of scattering .snake_case reads everywhere.

export function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    image: row.image || "",
    active: row.active,
    sortOrder: row.sort_order,
  }
}

export function mapProductImage(row: any): ProductImage {
  return { id: row.id, url: row.url, alt: row.alt || "", sortOrder: row.sort_order }
}

export function mapProduct(row: any): Product {
  const images: ProductImage[] = (row.product_images || [])
    .slice()
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map(mapProductImage)
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    brand: row.brand || "",
    shortDescription: row.short_description || "",
    description: row.description || "",
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    costPrice: row.cost_price != null ? Number(row.cost_price) : undefined,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    categoryId: row.category_id || "",
    images,
    specifications: row.specifications || {},
    features: row.features || [],
    featured: row.featured,
    newArrival: row.new_arrival,
    bestSeller: row.best_seller,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Reverse mapping: app Product -> DB column shape (for insert/update), images handled separately.
export function productToRow(p: Product) {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    brand: p.brand,
    short_description: p.shortDescription,
    description: p.description,
    price: p.price,
    sale_price: p.salePrice ?? null,
    stock: p.stock,
    low_stock_threshold: p.lowStockThreshold,
    category_id: p.categoryId || null,
    specifications: p.specifications,
    features: p.features,
    featured: p.featured,
    new_arrival: p.newArrival,
    best_seller: p.bestSeller,
    published: p.published,
  }
}

export function categoryToRow(c: Category) {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    active: c.active,
    sort_order: c.sortOrder,
  }
}

export function mapSettings(row: any): SiteSettings {
  return {
    businessName: row.business_name,
    logo: row.logo || "",
    tagline: row.tagline || "",
    phone: row.phone || "",
    email: row.email || "",
    address: row.address || "",
    whatsapp: row.whatsapp || "",
    facebook: row.facebook || "",
    instagram: row.instagram || "",
    tiktok: row.tiktok || "",
    hours: row.hours || "",
    footerText: row.footer_text || "",
    deliveryCharge: Number(row.delivery_charge),
    currency: row.currency || "PKR",
  }
}

export function settingsToRow(s: SiteSettings) {
  return {
    business_name: s.businessName,
    logo: s.logo,
    tagline: s.tagline,
    phone: s.phone,
    email: s.email,
    address: s.address,
    whatsapp: s.whatsapp,
    facebook: s.facebook,
    instagram: s.instagram,
    tiktok: s.tiktok,
    hours: s.hours,
    footer_text: s.footerText,
    delivery_charge: s.deliveryCharge,
    currency: s.currency,
  }
}

export function mapHomepage(row: any): HomepageContent {
  return {
    hero: row.hero,
    promo: row.promo,
    featuredProductIds: row.featured_product_ids || [],
  }
}

export function homepageToRow(h: HomepageContent) {
  return {
    hero: h.hero,
    promo: h.promo,
    featured_product_ids: h.featuredProductIds,
  }
}

export function mapOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email || "",
    city: row.city,
    address: row.address,
    notes: row.notes || "",
    items: (row.order_items || row.items || []).map((i: any) => ({
      productId: i.product_id,
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
      image: i.image || "",
    })),
    subtotal: Number(row.subtotal),
    deliveryCharge: Number(row.delivery_charge),
    total: Number(row.total),
    status: row.status,
    paymentMethod: row.payment_method === "cod" ? "Cash on Delivery" : row.payment_method,
    createdAt: row.created_at,
  }
}
