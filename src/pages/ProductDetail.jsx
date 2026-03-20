import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Star, ShoppingCart, Heart, Package, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) { navigate('/'); return }
    setProduct(data)
    setLoading(false)
  }

  const fetchReviews = async () => {
    const { data } = await supabase.from('feedback').select('*').eq('product_id', id).order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in first'); navigate('/login'); return }
    if (product.sizes?.length > 0 && !selectedSize) { toast.error('Please select a size'); return }
    setAdding(true)
    await addToCart(product.id, qty, selectedSize, selectedColor)
    toast.success('Added to cart!')
    setAdding(false)
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/checkout')
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to leave a review'); return }
    setSubmittingReview(true)
    const { error } = await supabase.from('feedback').insert([{
      customer_id: user.id,
      product_id: product.id,
      customer_name: user.name,
      rating: reviewForm.rating,
      review_text: reviewForm.review_text,
    }])
    if (!error) {
      toast.success('Review submitted!')
      setReviewForm({ rating: 5, review_text: '' })
      fetchReviews()
    } else {
      toast.error('Failed to submit review')
    }
    setSubmittingReview(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div className="page-loader"><div className="spinner" /></div>
    </div>
  )

  if (!product) return null

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600x700?text=No+Image']
  const discountPct = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : product.discount_percent || 0

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <Header />
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ChevronLeft size={18} /> Back
        </button>

        <div style={styles.mainGrid} className='product-detail-grid'>
          {/* Image Gallery */}
          <div style={styles.gallery} className='product-gallery'>
            <div style={styles.mainImgWrapper}>
              <img
                src={images[imgIndex]}
                alt={product.name}
                style={styles.mainImg}
                onError={e => { e.target.src = 'https://via.placeholder.com/600x700?text=No+Image' }}
              />
              {discountPct > 0 && <span style={styles.discBadge}>{discountPct}% OFF</span>}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} style={{ ...styles.imgArrow, left: 10 }}><ChevronLeft size={18} /></button>
                  <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} style={{ ...styles.imgArrow, right: 10 }}><ChevronRight size={18} /></button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={styles.thumbnails}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} style={{ ...styles.thumb, ...(i === imgIndex ? styles.thumbActive : {}) }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://via.placeholder.com/80x80' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={styles.info}>
            {product.brand && <div style={styles.brand}>{product.brand}</div>}
            <h1 style={styles.name}>{product.name}</h1>

            {/* Rating */}
            <div style={styles.ratingRow}>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16}
                    fill={s <= Math.round(product.rating || 0) ? '#f0a500' : 'none'}
                    color={s <= Math.round(product.rating || 0) ? '#f0a500' : '#d1d5db'}
                  />
                ))}
              </div>
              <span style={styles.ratingText}>{product.rating?.toFixed(1) || '0.0'}</span>
              <span style={styles.reviewCount}>{product.reviews_count || reviews.length} reviews</span>
              <span style={{ ...styles.stockBadge, background: product.stock > 0 ? '#dcfce7' : '#fee2e2', color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div style={styles.priceRow}>
              <span style={styles.price}>₹{product.price?.toLocaleString()}</span>
              {product.original_price > product.price && (
                <>
                  <span style={styles.originalPrice}>₹{product.original_price?.toLocaleString()}</span>
                  <span style={styles.savingBadge}>Save ₹{(product.original_price - product.price).toLocaleString()}</span>
                </>
              )}
            </div>

            <div style={styles.divider} />

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div style={styles.optionGroup}>
                <div style={styles.optionLabel}>Color: <strong>{selectedColor || 'Select'}</strong></div>
                <div style={styles.colorGrid}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      style={{ ...styles.colorChip, ...(selectedColor === c ? styles.chipActive : {}) }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={styles.optionGroup}>
                <div style={styles.optionLabel}>Size: <strong>{selectedSize || 'Select'}</strong></div>
                <div style={styles.sizeGrid}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      style={{ ...styles.sizeChip, ...(selectedSize === s ? styles.chipActive : {}) }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={styles.optionGroup}>
              <div style={styles.optionLabel}>Quantity</div>
              <div style={styles.qtyRow}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>-</button>
                <span style={styles.qtyNum}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={styles.qtyBtn}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actionRow}>
              <button onClick={handleAddToCart} disabled={adding || product.stock === 0} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
                <ShoppingCart size={16} />
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div style={styles.trustGrid}>
              {[
                { icon: Truck, text: 'Free delivery above ₹499' },
                { icon: RotateCcw, text: '7-day easy returns' },
                { icon: Shield, text: 'Secure payments' },
                { icon: Package, text: 'Quality assured' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={styles.trustItem}>
                  <Icon size={18} color="#6b7280" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div style={styles.description}>
                <h3 style={styles.descTitle}>Product Description</h3>
                <p style={styles.descText}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>Customer Reviews</h2>

          {/* Add review */}
          <div style={styles.addReview}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Write a Review</h3>
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label>Your Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                      <Star size={24}
                        fill={s <= reviewForm.rating ? '#f0a500' : 'none'}
                        color={s <= reviewForm.rating ? '#f0a500' : '#d1d5db'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Share your experience…"
                  value={reviewForm.review_text}
                  onChange={e => setReviewForm(f => ({ ...f, review_text: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submittingReview} style={{ alignSelf: 'flex-start' }}>
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Review list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {reviews.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14 }}>No reviews yet. Be the first!</p>
            ) : reviews.map(r => (
              <div key={r.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewAvatar}>{r.customer_name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.customer_name}</div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} fill={s <= r.rating ? '#f0a500' : 'none'} color={s <= r.rating ? '#f0a500' : '#d1d5db'} />
                      ))}
                    </div>
                  </div>
                  <span style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {r.review_text && <p style={styles.reviewText}>{r.review_text}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 14, marginBottom: 20, padding: '6px 0' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 48, alignItems: 'start', '@media(max-width:768px)': { gridTemplateColumns: '1fr' } },
  gallery: { position: 'sticky', top: 90 },
  mainImgWrapper: { position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'white', aspectRatio: '5/6' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  discBadge: { position: 'absolute', top: 14, left: 14, background: '#e94560', color: 'white', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 },
  imgArrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  thumbnails: { display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  thumb: { width: 68, height: 78, borderRadius: 10, overflow: 'hidden', border: '2px solid transparent', cursor: 'pointer' },
  thumbActive: { borderColor: '#e94560' },
  info: { paddingTop: 8 },
  brand: { fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 },
  name: { fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginBottom: 16 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  ratingText: { fontSize: 16, fontWeight: 700 },
  reviewCount: { fontSize: 13, color: '#6b7280' },
  stockBadge: { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  price: { fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: '#1a1a2e' },
  originalPrice: { fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' },
  savingBadge: { background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 },
  divider: { height: 1, background: '#f3f4f6', margin: '20px 0' },
  optionGroup: { marginBottom: 20 },
  optionLabel: { fontSize: 14, color: '#6b7280', marginBottom: 10 },
  colorGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  colorChip: { padding: '7px 16px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' },
  sizeGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  sizeChip: { width: 48, height: 48, border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  chipActive: { borderColor: '#e94560', background: '#fff1f3', color: '#e94560' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 0, background: '#f8f7f4', borderRadius: 10, width: 'fit-content', overflow: 'hidden', border: '1.5px solid #e5e7eb' },
  qtyBtn: { width: 40, height: 40, fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', transition: 'background 0.15s' },
  qtyNum: { width: 44, textAlign: 'center', fontWeight: 700, fontSize: 15 },
  actionRow: { display: 'flex', gap: 12, marginTop: 4, marginBottom: 24 },
  trustGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px', background: '#f8f7f4', borderRadius: 12, marginBottom: 24 },
  trustItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' },
  description: { background: '#f8f7f4', borderRadius: 12, padding: 20 },
  descTitle: { fontSize: 15, fontWeight: 700, marginBottom: 10 },
  descText: { fontSize: 14, color: '#4b5563', lineHeight: 1.7 },
  reviewsSection: { marginTop: 60, padding: '40px', background: 'white', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  reviewsTitle: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 24 },
  addReview: { background: '#f8f7f4', borderRadius: 12, padding: 24, marginBottom: 8 },
  reviewCard: { padding: '20px', border: '1px solid #f3f4f6', borderRadius: 12 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 },
  reviewDate: { marginLeft: 'auto', fontSize: 12, color: '#9ca3af' },
  reviewText: { fontSize: 14, color: '#4b5563', lineHeight: 1.6 },
}
