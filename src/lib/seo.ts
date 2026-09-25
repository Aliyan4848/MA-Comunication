import { useEffect } from "react"

const SITE_URL = "https://ma-comunication.vercel.app"
const SITE_NAME = "MA Communication"

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function canonicalPath(path: string) {
  const withoutQuery = (path.split(/[?#]/, 1)[0] || "/").replace(/\/{2,}/g, "/")
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : "/"
}

function setCanonical(path: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", `${SITE_URL}${canonicalPath(path)}`)
}

interface SeoOptions {
  title: string
  description?: string
  path: string
  image?: string
  noIndex?: boolean
  type?: "website" | "product"
}

/**
 * Sets document title, meta description, canonical URL, and Open Graph tags
 * for the current route. This is a client-side SPA, so these updates happen
 * after initial paint — search engines that execute JS (Googlebot does) will
 * still see them; social-preview crawlers that don't run JS fall back to the
 * static defaults baked into index.html via .figma/make/site.json.
 */
export function useSeo({ title, description, path, image, noIndex, type = "website" }: SeoOptions) {
  useEffect(() => {
    const fullTitle = !title ? SITE_NAME : title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const url = `${SITE_URL}${canonicalPath(path)}`
    document.title = fullTitle
    setMeta("name", "description", description || "Shop mobile accessories from MA Communication in Pakistan.")
    setMeta("name", "twitter:title", fullTitle)
    setMeta("name", "twitter:description", description || "Shop mobile accessories from MA Communication in Pakistan.")
    setMeta("property", "og:title", fullTitle)
    setMeta("property", "og:description", description || "Shop mobile accessories from MA Communication in Pakistan.")
    setMeta("property", "og:site_name", SITE_NAME)
    setMeta("property", "og:type", type)
    setMeta("property", "og:url", url)
    if (image) {
      const absoluteImage = new URL(image, SITE_URL).href
      setMeta("property", "og:image", absoluteImage)
      setMeta("name", "twitter:image", absoluteImage)
      setMeta("name", "twitter:card", "summary_large_image")
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove()
      document.head.querySelector('meta[name="twitter:image"]')?.remove()
    }
    setCanonical(path)

    let robotsEl = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (noIndex) {
      if (!robotsEl) {
        robotsEl = document.createElement("meta")
        robotsEl.setAttribute("name", "robots")
        document.head.appendChild(robotsEl)
      }
      robotsEl.setAttribute("content", "noindex, nofollow")
    } else {
      setMeta("name", "robots", "index, follow, max-image-preview:large")
    }
  }, [title, description, path, image, noIndex, type])
}

/** Injects a JSON-LD structured data script for the current page. Removes itself on unmount. */
export function useStructuredData(data: object | null) {
  useEffect(() => {
    const existing = document.head.querySelector<HTMLScriptElement>("script#seo-structured-data")
    existing?.remove()
    if (!data) return
    const script = document.createElement("script")
    script.id = "seo-structured-data"
    script.type = "application/ld+json"
    script.text = JSON.stringify(data).replace(/</g, "\\u003c")
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [JSON.stringify(data)])
}
