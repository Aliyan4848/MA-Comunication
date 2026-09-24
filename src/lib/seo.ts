import { useEffect } from "react"

const SITE_URL = (import.meta.env.VITE_SITE_URL as string) || "https://ma-comunication.vercel.app"
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

function setCanonical(path: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", `${SITE_URL}${path}`)
}

interface SeoOptions {
  title: string
  description?: string
  path: string
  image?: string
  noIndex?: boolean
}

/**
 * Sets document title, meta description, canonical URL, and Open Graph tags
 * for the current route. This is a client-side SPA, so these updates happen
 * after initial paint — search engines that execute JS (Googlebot does) will
 * still see them; social-preview crawlers that don't run JS fall back to the
 * static defaults baked into index.html via .figma/make/site.json.
 */
export function useSeo({ title, description, path, image, noIndex }: SeoOptions) {
  useEffect(() => {
    const fullTitle = !title ? SITE_NAME : title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    document.title = fullTitle
    if (description) {
      setMeta("name", "description", description)
      setMeta("property", "og:description", description)
    }
    setMeta("property", "og:title", fullTitle)
    setMeta("property", "og:type", "website")
    setMeta("property", "og:url", `${SITE_URL}${path}`)
    if (image) {
      setMeta("property", "og:image", image)
      setMeta("name", "twitter:image", image)
      setMeta("name", "twitter:card", "summary_large_image")
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
    } else if (robotsEl && robotsEl.getAttribute("content")?.includes("noindex")) {
      // Only remove a noindex tag we're responsible for; leave a global one (from site.json) alone.
      robotsEl.remove()
    }
  }, [title, description, path, image, noIndex])
}

/** Injects a JSON-LD structured data script for the current page. Removes itself on unmount. */
export function useStructuredData(data: object | null) {
  useEffect(() => {
    if (!data) return
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [JSON.stringify(data)])
}
