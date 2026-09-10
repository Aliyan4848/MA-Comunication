// Runs at build time (see "prebuild" in package.json) — NOT in the browser.
// Queries public, published data from Supabase (anon key, read-only via RLS)
// and writes a static public/sitemap.xml that lists real routes.
// Deliberately excludes /admin/* — those are also blocked in public/robots.txt.
import { createClient } from "@supabase/supabase-js"
import { writeFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, "..", "public", "sitemap.xml")

const SITE_URL = process.env.VITE_SITE_URL || "https://ma-comunication.vercel.app"
const SUPABASE_URL = process.env.SITEMAP_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SITEMAP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/categories", changefreq: "weekly", priority: "0.7" },
  { path: "/new-arrivals", changefreq: "daily", priority: "0.6" },
  { path: "/best-sellers", changefreq: "daily", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.4" },
]

function urlEntry(path, changefreq, priority) {
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function main() {
  const entries = STATIC_ROUTES.map(r => urlEntry(r.path, r.changefreq, r.priority))

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[sitemap] Missing Supabase env vars — writing sitemap with static routes only.")
  } else {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("published", true)
      if (prodErr) throw prodErr
      for (const p of products || []) {
        entries.push(urlEntry(`/products/${p.slug}`, "weekly", "0.8"))
      }

      const { data: categories, error: catErr } = await supabase
        .from("categories")
        .select("slug")
        .eq("active", true)
      if (catErr) throw catErr
      for (const c of categories || []) {
        entries.push(urlEntry(`/categories/${c.slug}`, "weekly", "0.6"))
      }

      console.log(`[sitemap] Included ${products?.length || 0} products and ${categories?.length || 0} categories.`)
    } catch (err) {
      console.warn("[sitemap] Failed to fetch dynamic routes from Supabase, falling back to static routes only:", err.message)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`
  writeFileSync(outPath, xml)
  console.log(`[sitemap] Wrote ${entries.length} URLs to ${outPath}`)
}

main()
