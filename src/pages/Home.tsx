import HeroSection from "../sections/home/HeroSection"
import TrustStrip from "../sections/home/TrustStrip"
import CategoriesSection from "../sections/home/CategoriesSection"
import FeaturedProducts from "../sections/home/FeaturedProducts"
import PromoBanner from "../sections/home/PromoBanner"
import WhySection from "../sections/home/WhySection"
import CTASection from "../sections/home/CTASection"
import { useStore } from "../contexts/StoreContext"
import { useSeo } from "../lib/seo"

export default function Home() {
  const { homepage } = useStore()
  useSeo({
    title: "MA Communication | Mobile Accessories in Pakistan",
    description: "Shop mobile chargers, cables, earbuds, power banks, smart watches and speakers from MA Communication in Pakistan.",
    path: "/",
    image: homepage.hero.image,
  })
  return (
    <main>
      <HeroSection />
      <TrustStrip />
      <CategoriesSection />
      <FeaturedProducts
        title="Featured Products"
        subtitle="Handpicked accessories selected for quality and value"
        accent="Curated For You"
        featuredIds={homepage.featuredProductIds}
        linkTo="/shop"
        linkLabel="View all products"
      />
      <PromoBanner />
      <FeaturedProducts
        title="New Arrivals"
        subtitle="The latest additions to our collection — just landed"
        accent="Just In"
        filter={p => p.newArrival}
        linkTo="/new-arrivals"
        linkLabel="View all new arrivals"
      />
      <WhySection />
      <FeaturedProducts
        title="Best Sellers"
        subtitle="Our most popular products, loved by customers across Pakistan"
        accent="Trending Now"
        filter={p => p.bestSeller}
        linkTo="/best-sellers"
        linkLabel="View all best sellers"
      />
      <CTASection />
    </main>
  )
}
