// Emits route-specific HTML shells after the Vite build so Google and social
// crawlers receive real metadata before the client-side app starts.
import { createClient } from "@supabase/supabase-js"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const SITE_URL = "https://ma-comunication.vercel.app"
const SITE_NAME = "MA Communication"
const SUPABASE_URL = process.env.SITEMAP_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SITEMAP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function escapeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function setMeta(html, attribute, key, content) {
  const escapedKey = escapeRegex(key)
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}=["']${escapedKey}["'])[^>]*>`, "i")
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`)
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
}

function setCanonical(html, path) {
  const url = new URL(path, SITE_URL).href
  const pattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`)
}

function setJsonLd(html, data) {
  const existing = /<script\b(?=[^>]*\bid=["']seo-structured-data["'])[^>]*>[\s\S]*?<\/script>/i
  const tag = `<script id="seo-structured-data" type="application/ld+json">${escapeJsonLd(data)}</script>`
  return existing.test(html) ? html.replace(existing, tag) : html.replace("</head>", `  ${tag}\n  </head>`)
}

function addBreadcrumb(path, label, parentPath, parentLabel) {
  const items = [
    { name: "Home", item: `${SITE_URL}/` },
    ...(parentPath ? [{ name: parentLabel, item: new URL(parentPath, SITE_URL).href }] : []),
    { name: label, item: new URL(path, SITE_URL).href },
  ]
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.item })),
  }
}

function applyPageMetadata(template, { title, description, path, image, type = "website", structuredData }) {
  let html = setTitle(template, title)
  html = setMeta(html, "name", "description", description)
  html = setMeta(html, "name", "robots", "index, follow, max-image-preview:large")
  html = setMeta(html, "property", "og:title", title)
  html = setMeta(html, "property", "og:description", description)
  html = setMeta(html, "property", "og:site_name", SITE_NAME)
  html = setMeta(html, "property", "og:type", type)
  html = setMeta(html, "property", "og:url", new URL(path, SITE_URL).href)
  html = setMeta(html, "name", "twitter:title", title)
  html = setMeta(html, "name", "twitter:description", description)
  html = setMeta(html, "name", "twitter:card", image ? "summary_large_image" : "summary")
  if (image) {
    html = setMeta(html, "property", "og:image", image)
    html = setMeta(html, "name", "twitter:image", image)
  }
  html = setCanonical(html, path)
  return setJsonLd(html, structuredData)
}

function organizationSchema(settings) {
  const business = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: settings?.business_name || SITE_NAME,
    url: `${SITE_URL}/`,
  }
  if (settings?.logo) business.logo = new URL(settings.logo, SITE_URL).href
  if (settings?.phone || settings?.email) {
    business.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(settings.phone ? { telephone: settings.phone } : {}),
      ...(settings.email ? { email: settings.email } : {}),
      areaServed: "PK",
    }
  }
  if (settings?.address) {
    const [locality = "", ...countryParts] = settings.address.split(",").map(part => part.trim())
    business.address = {
      "@type": "PostalAddress",
      ...(locality ? { addressLocality: locality } : {}),
      ...(countryParts.length ? { addressCountry: countryParts.join(", ") } : {}),
    }
  }
  const hours = settings?.hours?.match(/(Mon|Monday)\s*[–-]\s*(Sat|Saturday):\s*(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*(\d{1,2}:\d{2}\s*[AP]M)/i)
  if (hours) {
    const to24Hour = value => {
      const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
      if (!match) return undefined
      const [, rawHour, minute, period] = match
      let hour = Number(rawHour) % 12
      if (period.toUpperCase() === "PM") hour += 12
      return `${String(hour).padStart(2, "0")}:${minute}`
    }
    business.openingHoursSpecification = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: to24Hour(hours[3]),
      closes: to24Hour(hours[4]),
    }
  }
  return business
}

function productSchema(product, images, reviewStats, reviews) {
  const path = `/products/${encodeURIComponent(product.slug)}`
  const url = new URL(path, SITE_URL).href
  const primaryPrice = product.sale_price ?? product.price
  const schema = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    description: product.short_description || product.description || product.name,
    image: images.filter(image => image.url).map(image => new URL(image.url, SITE_URL).href),
    sku: product.sku || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: Number(primaryPrice),
      availability: Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  }
  if (reviewStats?.review_count > 0 && reviewStats?.average_rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(reviewStats.average_rating),
      reviewCount: Number(reviewStats.review_count),
    }
  }
  if (reviews?.length) {
    schema.review = reviews.map(review => ({
      "@type": "Review",
      name: review.title || `Review for ${product.name}`,
      ...(review.body ? { reviewBody: review.body } : {}),
      datePublished: review.created_at,
      author: { "@type": "Person", name: review.reviewer_name },
      reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    }))
  }
  return schema
}

async function main() {
  const template = readFileSync(join(dist, "index.html"), "utf8")
  const defaultDescription = "Shop mobile accessories from MA Communication in Pakistan."
  let home = applyPageMetadata(template, {
    title: `${SITE_NAME} | Mobile Accessories in Pakistan`,
    description: defaultDescription,
    path: "/",
    type: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        organizationSchema(null),
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, publisher: { "@id": `${SITE_URL}/#organization` }, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" } },
      ],
    },
  })

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    writeFileSync(join(dist, "index.html"), home)
    console.warn("[seo-pages] Missing Supabase build environment values; public route metadata shells were not generated.")
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const [settingsResult, productsResult, categoriesResult] = await Promise.all([
    supabase.from("site_settings").select("business_name,logo,phone,email,address,hours").eq("id", 1).maybeSingle(),
    supabase.from("products").select("id,name,slug,sku,brand,short_description,description,price,sale_price,stock,category_id,updated_at,product_images(url,alt,sort_order)").eq("published", true),
    supabase.from("categories").select("id,name,slug,description,image,updated_at").eq("active", true),
  ])
  if (settingsResult.error) throw settingsResult.error
  if (productsResult.error) throw productsResult.error
  if (categoriesResult.error) throw categoriesResult.error

  const [{ data: reviewStatsRows, error: reviewStatsError }, { data: reviewRows, error: reviewError }] = await Promise.all([
    supabase.from("product_review_stats").select("product_id,review_count,average_rating"),
    supabase.from("reviews").select("product_id,title,body,reviewer_name,rating,created_at").eq("status", "approved").order("created_at", { ascending: false }),
  ])
  if (reviewStatsError || reviewError) console.warn("[seo-pages] Approved review structured data was omitted because the public review data was unavailable.")
  const reviewStats = new Map((reviewStatsRows || []).map(row => [row.product_id, row]))
  const reviewsByProduct = new Map()
  for (const review of reviewRows || []) {
    const list = reviewsByProduct.get(review.product_id) || []
    list.push(review)
    reviewsByProduct.set(review.product_id, list)
  }

  const settings = settingsResult.data
  const business = organizationSchema(settings)
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" },
  }
  const homeDescription = "Shop chargers, cables, earbuds, power banks and mobile accessories from MA Communication in Pakistan."
  home = applyPageMetadata(template, {
    title: `${SITE_NAME} | Mobile Accessories in Pakistan`,
    description: homeDescription,
    path: "/",
    image: settings?.logo ? new URL(settings.logo, SITE_URL).href : undefined,
    type: "website",
    structuredData: { "@context": "https://schema.org", "@graph": [business, website] },
  })
  writeFileSync(join(dist, "index.html"), home)

  const categories = new Map((categoriesResult.data || []).map(category => [category.id, category]))
  const productImages = new Map()
  const products = (productsResult.data || []).filter(product => product.slug)
  for (const product of products) {
    const images = (product.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order)
    productImages.set(product.id, images)
    const path = `/products/${encodeURIComponent(product.slug)}`
    const category = categories.get(product.category_id)
    const title = `${product.name} | ${category?.name ? `${category.name} in Pakistan` : "Mobile Accessories in Pakistan"} | ${SITE_NAME}`
    const description = (product.short_description || product.description || `Shop ${product.name} from MA Communication in Pakistan.`).replace(/\s+/g, " ").slice(0, 160)
    const graph = [productSchema(product, images, reviewStats.get(product.id), reviewsByProduct.get(product.id)), addBreadcrumb(path, product.name, category ? `/categories/${encodeURIComponent(category.slug)}` : undefined, category?.name)]
    const html = applyPageMetadata(template, { title, description, path, image: images[0]?.url, type: "product", structuredData: { "@context": "https://schema.org", "@graph": graph } })
    const output = join(dist, `${path.slice(1)}.html`)
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, html)
  }

  for (const category of categoriesResult.data || []) {
    if (!category.slug) continue
    const path = `/categories/${encodeURIComponent(category.slug)}`
    const description = (category.description || `Shop ${category.name} and related mobile accessories at MA Communication in Pakistan.`).replace(/\s+/g, " ").slice(0, 160)
    const categoryProducts = products.filter(product => product.category_id === category.id)
    const itemList = {
      "@type": "ItemList",
      itemListElement: categoryProducts.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: new URL(`/products/${encodeURIComponent(product.slug)}`, SITE_URL).href, name: product.name })),
    }
    const graph = [itemList, addBreadcrumb(path, category.name, "/categories", "Categories")]
    const html = applyPageMetadata(template, { title: `${category.name} in Pakistan | ${SITE_NAME}`, description, path, image: category.image || undefined, structuredData: { "@context": "https://schema.org", "@graph": graph } })
    const output = join(dist, `${path.slice(1)}.html`)
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, html)
  }

  const allProductsBreadcrumb = addBreadcrumb("/categories", "Categories")
  const categoriesHtml = applyPageMetadata(template, {
    title: `Mobile Accessory Categories in Pakistan | ${SITE_NAME}`,
    description: "Browse mobile accessory categories at MA Communication, including chargers, cables, earbuds, power banks and more.",
    path: "/categories",
    structuredData: { "@context": "https://schema.org", "@graph": [allProductsBreadcrumb, business] },
  })
  writeFileSync(join(dist, "categories.html"), categoriesHtml)
  console.log(`[seo-pages] Generated metadata shells for ${products.length} products and ${(categoriesResult.data || []).length} categories.`)
}

main().catch(error => {
  console.error("[seo-pages] Failed to generate route metadata:", error.message)
  process.exitCode = 1
})
