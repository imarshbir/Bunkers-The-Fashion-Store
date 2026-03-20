import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(false)

  useEffect(() => {
    if (user) fetchCart()
    else setCartItems([])
  }, [user])

  const fetchCart = async () => {
    setCartLoading(true)
    const { data, error } = await supabase
      .from('cart_items')
      .select(`*, products(*)`)
      .eq('customer_id', user.id)
    if (!error && data) setCartItems(data)
    setCartLoading(false)
  }

  const addToCart = async (productId, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!user) return false

    // Check if already in cart
    const existing = cartItems.find(i => i.product_id === productId && i.selected_size === selectedSize && i.selected_color === selectedColor)

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
      if (!error) await fetchCart()
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert([{ customer_id: user.id, product_id: productId, quantity, selected_size: selectedSize, selected_color: selectedColor }])
      if (!error) await fetchCart()
    }
    return true
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId)
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)
    if (!error) await fetchCart()
  }

  const removeFromCart = async (cartItemId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)
    if (!error) await fetchCart()
  }

  const clearCart = async () => {
    if (!user) return
    await supabase.from('cart_items').delete().eq('customer_id', user.id)
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, cartLoading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}
