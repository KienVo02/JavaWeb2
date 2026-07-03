import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('goalstore_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      localStorage.removeItem('goalstore_cart')
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('goalstore_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product, sizeName = 'M', quantity = 1) => {
    const productId = product.id
    const price = Number(product.salePrice || product.price || 0)
    const key = `${productId}-${sizeName}`
    const maxStock = resolveMaxStock(product, sizeName)
    const requestedQuantity = Math.max(1, Number(quantity) || 1)

    if (maxStock <= 0) {
      return { ok: false, message: 'Sản phẩm đã hết hàng.' }
    }

    setItems((current) => {
      const existing = current.find((item) => item.key === key)
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + requestedQuantity, maxStock)
        return current.map((item) =>
          item.key === key ? { ...item, quantity: nextQuantity, maxStock } : item,
        )
      }

      return [
        ...current,
        {
          key,
          productId,
          name: product.name,
          imageUrl: product.imageUrl,
          sizeName,
          price,
          quantity: Math.min(requestedQuantity, maxStock),
          maxStock,
        },
      ]
    })

    return { ok: true, message: 'Đã thêm vào giỏ hàng.' }
  }

  const updateQuantity = (key, quantity) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.key !== key) return item
          const maxStock = Number(item.maxStock || 999)
          return { ...item, quantity: Math.min(Math.max(1, quantity), maxStock) }
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (key) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  const clearCart = () => setItems([])

  const totals = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { count, amount }
  }, [items])

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totals }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return value
}

function resolveMaxStock(product, sizeName) {
  const matchedSize = product.sizes?.find((item) => item.sizeName === sizeName)
  const sizeStock = matchedSize ? Number(matchedSize.stockQuantity || 0) : null
  const productStock = Number(product.stockQuantity || 0)
  return sizeStock ?? productStock
}
