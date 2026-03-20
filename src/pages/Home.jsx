import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { SlidersHorizontal, ChevronDown, Tag } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'created_at.desc', label: 'Newest First' },
  { value: 'price.asc', label: 'Price: Low to High' },
  { value: 'price.desc', label: 'Price: High to Low' },
  { value: 'rating.desc', label: 'Top Rated' },
]

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,500', min: 500, max: 1500 },
  { label: '₹1,500 – ₹3,000', min: 1500, max: 3000 },
  { label: 'Above ₹3,000', min: 3000, max: Infinity },
]

export default function Home() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('created_at.desc')
  const [priceRange, setPriceRange] = useState(0)
  const [featured, setFeatured] = useState([])

  useEffect(() => { fetchProducts() }, [searchQuery, activeCategory, sortBy])
  useEffect(() => { fetchFeatured() }, [])

  const fetchFeatured = async () => {
    const { data } = await supabase.from('products').select('*').eq('is_featured', true).eq('is_active', true).limit(8)
    if (data) setFeatured(data)
  }

  const fetchProducts = async () => {
    setLoading(true)
    const [col, dir] = sortBy.split('.')
    let q = supabase.from('products').select('*').eq('is_active', true).order(col, { ascending: dir === 'asc' })

    if (searchQuery) {
      q = q.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
    }
    if (activeCategory && activeCategory !== 'All') {
      q = q.eq('category', activeCategory)
    }

    const { data, error } = await q
    if (!error && data) {
      const range = PRICE_RANGES[priceRange]
      setProducts(data.filter(p => p.price >= range.min && (range.max === Infinity || p.price <= range.max)))
    }
    setLoading(false)
  }

  const handleSearch = (query, category) => {
    if (query !== undefined) setSearchQuery(query)
    if (category !== undefined) setActiveCategory(category)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <Header onSearch={handleSearch} searchQuery={searchQuery} />

      {/* Hero Banner */}
      {!searchQuery && !activeCategory && (
        <div style={styles.hero} className='hero-section'>
          <div className="container" style={styles.heroInner}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>New Collection 2025</span>
              <h1 style={styles.heroTitle} className='hero-title'>Dress to<br /><em>Impress</em></h1>
              <p style={styles.heroSubtitle}>Discover premium clothing for every occasion. From casual wear to ethnic masterpieces.</p>
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 36px' }} onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
                Shop Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured banner chips */}
      {!searchQuery && featured.length > 0 && (
        <div style={styles.featuredStrip}>
          <div className="container">
            <div style={styles.featuredHeader}>
              <h2 style={styles.sectionTitle}>Featured Picks</h2>
              <span style={styles.sectionSub}>Hand-picked bestsellers</span>
            </div>
            <div style={styles.featuredGrid} className='product-grid'>
              {featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* Main product listing */}
      <div id="products-section" className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SlidersHorizontal size={18} color="#6b7280" />
            <h2 style={styles.toolbarTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : activeCategory || 'All Products'}
            </h2>
            {products.length > 0 && <span style={styles.count}>{products.length} items</span>}
          </div>
          <div style={styles.toolbarRight}>
            {/* Price filter */}
            <select
              value={priceRange}
              onChange={e => { setPriceRange(Number(e.target.value)); fetchProducts() }}
              style={styles.select}
            >
              {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={styles.select}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginTop: 24 }}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <Tag size={56} color="#d1d5db" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn-primary" onClick={() => { setSearchQuery(''); setActiveCategory('') }}>Clear Filters</button>
          </div>
        ) : (
          <div style={styles.grid} className='product-grid'>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
      <div style={{ paddingTop: '115%', background: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: 14 }}>
        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, width: '60%' }} />
      </div>
    </div>
  )
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: 360, display: 'flex', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  heroInner: { padding: '60px 24px', position: 'relative', zIndex: 1 },
  heroContent: { maxWidth: 500 },
  heroBadge: {
    display: 'inline-block', background: 'rgba(233,69,96,0.2)',
    color: '#e94560', border: '1px solid rgba(233,69,96,0.4)',
    padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: 1,
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(40px, 6vw, 64px)',
    fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 20,
  },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380 },
  featuredStrip: { background: 'white', padding: '48px 0' },
  featuredHeader: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700 },
  sectionSub: { fontSize: 13, color: '#9ca3af' },
  featuredGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
    marginBottom: 24, padding: '16px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  toolbarTitle: { fontSize: 18, fontWeight: 700 },
  count: { fontSize: 13, color: '#9ca3af', fontWeight: 400 },
  toolbarRight: { display: 'flex', gap: 10 },
  select: {
    padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: 13, color: '#374151', background: 'white', outline: 'none',
    cursor: 'pointer',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 },
}
