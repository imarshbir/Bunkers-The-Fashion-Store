import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [imgError, setImgError] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in to add items to cart'); return }
    setAdding(true)
    await addToCart(product.id, 1)
    toast.success('Added to cart!')
    setAdding(false)
  }

  const toggleWishlist = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in'); return }
    if (!wishlisted) {
      await supabase.from('wishlist').insert([{ customer_id: user.id, product_id: product.id }])
      setWishlisted(true)
      toast.success('Added to wishlist')
    } else {
      await supabase.from('wishlist').delete().eq('customer_id', user.id).eq('product_id', product.id)
      setWishlisted(false)
    }
  }

  const discountPct = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : product.discount_percent || 0

  return (
    <Link to={`/product/${product.id}`} style={styles.card} className="product-card">
      <div style={styles.imageWrapper}>
        <img
          src={imgError ? 'https://via.placeholder.com/300x340?text=No+Image' : (product.images?.[0] || 'https://via.placeholder.com/300x340?text=No+Image')}
          alt={product.name}
          style={styles.image}
          onError={() => setImgError(true)}
        />
        {discountPct > 0 && (
          <span style={styles.discountBadge}>{discountPct}% OFF</span>
        )}
        {product.stock === 0 && (
          <div style={styles.outOfStock}>Out of Stock</div>
        )}
        <button onClick={toggleWishlist} style={{ ...styles.wishBtn, ...(wishlisted ? styles.wishActive : {}) }}>
          <Heart size={16} fill={wishlisted ? '#e94560' : 'none'} />
        </button>
      </div>

      <div style={styles.info}>
        {product.brand && <div style={styles.brand}>{product.brand}</div>}
        <h3 style={styles.name}>{product.name}</h3>

        <div style={styles.ratingRow}>
          <div className="stars">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12}
                fill={s <= Math.round(product.rating || 0) ? '#f0a500' : 'none'}
                color={s <= Math.round(product.rating || 0) ? '#f0a500' : '#d1d5db'}
              />
            ))}
          </div>
          {product.reviews_count > 0 && (
            <span style={styles.reviewCount}>({product.reviews_count.toLocaleString()})</span>
          )}
        </div>

        <div style={styles.priceRow}>
          <span style={styles.price}>₹{product.price?.toLocaleString()}</span>
          {product.original_price > product.price && (
            <span style={styles.originalPrice}>₹{product.original_price?.toLocaleString()}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          style={{
            ...styles.addBtn,
            ...(product.stock === 0 ? styles.addBtnDisabled : {}),
          }}
        >
          <ShoppingCart size={14} />
          {adding ? 'Adding…' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
}

const styles = {
  card: {
    background: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'pointer',
  },
  imageWrapper: {
    position: 'relative',
    paddingTop: '115%',
    overflow: 'hidden',
    background: '#f9fafb',
  },
  image: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  discountBadge: {
    position: 'absolute', top: 10, left: 10,
    background: '#e94560', color: 'white',
    fontSize: 11, fontWeight: 700, padding: '3px 8px',
    borderRadius: 6,
  },
  outOfStock: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: 14,
  },
  wishBtn: {
    position: 'absolute', top: 10, right: 10,
    background: 'white', borderRadius: '50%',
    width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    color: '#9ca3af', transition: 'all 0.2s',
  },
  wishActive: { color: '#e94560' },
  info: { padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  brand: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  name: { fontSize: 14, fontWeight: 600, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  reviewCount: { fontSize: 11, color: '#9ca3af' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  originalPrice: { fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' },
  addBtn: {
    marginTop: 8,
    background: '#1a1a2e',
    color: 'white',
    padding: '9px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background 0.2s',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  addBtnDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
}
