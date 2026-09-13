import { useLayoutEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { StoreProvider } from "./contexts/StoreContext"
import { CartProvider } from "./contexts/CartContext"
import { ToastProvider } from "./contexts/ToastContext"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"

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
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import TrackOrder from "./pages/TrackOrder"

import AccountLayout from "./pages/account/AccountLayout"
import AccountProfile from "./pages/account/AccountProfile"
import AccountAddresses from "./pages/account/AccountAddresses"
import AccountOrders from "./pages/account/AccountOrders"
import AccountOrderDetail from "./pages/account/AccountOrderDetail"

import AdminLayout from "./pages/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminProductForm from "./pages/admin/AdminProductForm"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"
import AdminHomepage from "./pages/admin/AdminHomepage"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminReviews from "./pages/admin/AdminReviews"

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
      <ScrollToTop />
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
          <Route path="/track-order" element={<PageTransition><TrackOrder /></PageTransition>} />
          <Route path="/track-order/:orderNumber" element={<PageTransition><TrackOrder /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountProfile />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:id" element={<AccountOrderDetail />} />
          </Route>
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
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <ToastProvider>
              <Routes>
                {/* Admin — a single route owns "/admin/*"; AdminLayout decides
                    internally whether to show the login screen or the dashboard shell.
                    Its own ThemeProvider scope keeps the admin's theme choice
                    completely separate from the customer storefront's. */}
                <Route path="/admin" element={<ThemeProvider scope="admin"><AdminLayout /></ThemeProvider>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/:id" element={<AdminProductForm />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="homepage" element={<AdminHomepage />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                {/* Storefront */}
                <Route path="/*" element={<ThemeProvider scope="storefront"><StoreFront /></ThemeProvider>} />
              </Routes>
            </ToastProvider>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    })

    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    })
  }, [pathname, search])

  return null
}
