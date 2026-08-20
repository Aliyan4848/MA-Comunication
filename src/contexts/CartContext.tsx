import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { CartItem } from "../types"

interface CartContextType {
  items: CartItem[]
  count: number
  subtotal: number
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const CART_KEY = "ma_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const addToCart = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(x => x.productId === item.productId)
      if (existing) {
        return prev.map(x =>
          x.productId === item.productId
            ? { ...x, quantity: Math.min(x.quantity + item.quantity, x.stock) }
            : x
        )
      }
      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(x => x.productId !== productId))
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(x => x.productId !== productId))
      return
    }
    setItems(prev =>
      prev.map(x =>
        x.productId === productId ? { ...x, quantity: Math.min(qty, x.stock) } : x
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  return (
    <CartContext.Provider value={{ items, count, subtotal, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
