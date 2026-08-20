import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { StoreProvider } from "./contexts/StoreContext"
import { CartProvider } from "./contexts/CartContext"
import { ToastProvider } from "./contexts/ToastContext"

import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"

import Home from "./pages/Home"
import Shop from "./pages/Shop"
import ProductDetail from "./pages/ProductDetail"
import { CategoriesPage, CategoryDetailPage } from "./pages/Categories"
import FilteredProducts from "./pages/FilteredProducts"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import OrderConfirmation from "./pages/OrderConfirmation"
import About from "./pages/About"
import Contact from "./pages/Contact"
import NotFound from "./pages/NotFound"

import AdminLogin from "./pages/admin/AdminLogin"
import AdminLayout from "./pages/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminProductForm from "./pages/admin/AdminProductForm"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"
import AdminHomepage from "./pages/admin/AdminHomepage"
import AdminSettings from "./pages/admin/AdminSettings"

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function StoreFront() {
  const location = useLocation()
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
          <Route path="/products/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/categories" element={<PageTransition><CategoriesPage /></PageTransition>} />
          <Route path="/categories/:slug" element={<PageTransition><CategoryDetailPage /></PageTransition>} />
          <Route path="/new-arrivals" element={<PageTransition><FilteredProducts title="New Arrivals" subtitle="Just added to our collection" filter={(p: any) => p.newArrival} /></PageTransition>} />
          <Route path="/best-sellers" element={<PageTransition><FilteredProducts title="Best Sellers" subtitle="Most loved by our customers" filter={(p: any) => p.bestSeller} /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
          <Route path="/order-confirmation/:id" element={<PageTransition><OrderConfirmation /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Admin */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id" element={<AdminProductForm />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              {/* Storefront */}
              <Route path="/*" element={<StoreFront />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
