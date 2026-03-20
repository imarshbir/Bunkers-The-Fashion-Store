import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut, Package, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartSidebar from './CartSidebar'

const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Unisex', 'Ethnic', 'Formal', 'Sports']

export default function Header({ onSearch, searchQuery }) {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [query, setQuery] = useState(searchQuery || '')
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    if (onSearch) onSearch(query)
    else navigate(`/?search=${encodeURIComponent(query)}`)
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <style>{`
        .header-search { flex: 1; max-width: 600px; }
        .header-signin { padding: 9px 20px; font-size: 13px; }
        .header-username { display: flex; }
        .header-menu-btn { display: none; color: white; padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.1); }
        @media (max-width: 768px) {
          .header-search { display: none !important; }
          .header-signin { display: none !important; }
          .header-username span.uname { display: none; }
          .header-menu-btn { display: flex !important; align-items: center; justify-content: center; }
        }
        .dropdown-item-btn:hover { background: #f3f4f6; }
        .cat-btn:hover { color: white; background: rgba(255,255,255,0.1); }
        .product-card:hover img { transform: scale(1.05); }
        .product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }
      `}</style>

      <header style={styles.header}>
        <div className="container" style={styles.inner}>

          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <span style={styles.logoText}>BUNKERS</span>
            <span style={styles.logoSub}>Fashion</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="header-search">
            <div style={styles.searchBox}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search clothing, brands…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchBtn}>Search</button>
            </div>
          </form>

          {/* Actions */}
          <div style={styles.actions}>
            {/* Profile / Sign In */}
            {user ? (
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} style={styles.profileBtn} className="header-username">
                  <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
                  <span className="uname" style={styles.userName}>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} color="white" />
                </button>
                {profileOpen && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</div>
                      </div>
                    </div>
                    <div style={styles.dropdownDivider} />
                    <Link to="/profile" onClick={() => setProfileOpen(false)} style={styles.dropdownItem} className="dropdown-item-btn">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} style={styles.dropdownItem} className="dropdown-item-btn">
                      <Package size={15} /> My Orders
                    </Link>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} style={styles.dropdownItem} className="dropdown-item-btn">
                      <Heart size={15} /> Wishlist
                    </Link>
                    <div style={styles.dropdownDivider} />
                    <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: '#ef4444', width: '100%', textAlign: 'left' }} className="dropdown-item-btn">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary header-signin">Sign In</Link>
            )}

            {/* Cart */}
            <button onClick={() => user ? setCartOpen(true) : navigate('/login')} style={styles.cartBtn}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>

            {/* Hamburger — mobile only */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="header-menu-btn">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Category bar */}
        <div style={styles.categoryBar}>
          <div className="container" style={styles.categoryInner}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className="cat-btn"
                onClick={() => {
                  setMenuOpen(false)
                  onSearch ? onSearch('', cat === 'All' ? '' : cat) : navigate(`/?category=${cat}`)
                }}
                style={styles.categoryBtn}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={styles.mobileMenu}>
            {/* Mobile search */}
            <form onSubmit={handleSearch} style={{ padding: '12px 16px 8px' }}>
              <div style={styles.searchBox}>
                <Search size={16} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={styles.searchInput}
                />
                <button type="submit" style={styles.searchBtn}>Go</button>
              </div>
            </form>

            {/* Mobile auth buttons */}
            {!user ? (
              <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px' }} onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '11px', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            ) : (
              <div style={{ padding: '8px 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: 10, marginBottom: 8 }}>
                  <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={styles.mobileNavLink}><User size={14} /> Profile</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={styles.mobileNavLink}><Package size={14} /> Orders</Link>
                  <button onClick={handleLogout} style={{ ...styles.mobileNavLink, border: 'none', cursor: 'pointer', color: '#f87171' }}><LogOut size={14} /> Sign Out</button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

const styles = {
  header: { position: 'sticky', top: 0, zIndex: 100, background: '#1a1a2e', boxShadow: '0 2px 20px rgba(0,0,0,0.25)' },
  inner: { height: 64, display: 'flex', alignItems: 'center', gap: 16 },
  logo: { display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0, textDecoration: 'none' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: 3 },
  logoSub: { fontSize: 8, color: '#e94560', letterSpacing: 5, textTransform: 'uppercase', marginTop: 1 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 8, padding: '0 12px', height: 42 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1a1a2e', background: 'transparent', minWidth: 0 },
  searchBtn: { background: '#e94560', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, flexShrink: 0, border: 'none', cursor: 'pointer' },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: '#e94560', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  userName: { color: 'white', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdown: { position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #f3f4f6', minWidth: 220, zIndex: 200, padding: 8 },
  dropdownHeader: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 12px' },
  dropdownAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 },
  dropdownDivider: { height: 1, background: '#f3f4f6', margin: '4px 0' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', width: '100%', textAlign: 'left', textDecoration: 'none' },
  cartBtn: { position: 'relative', color: 'white', padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' },
  cartBadge: { position: 'absolute', top: -4, right: -4, background: '#e94560', color: 'white', fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' },
  categoryBar: { background: '#16213e', borderTop: '1px solid rgba(255,255,255,0.06)' },
  categoryInner: { display: 'flex', gap: 0, overflowX: 'auto', padding: 0, scrollbarWidth: 'none' },
  categoryBtn: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, padding: '10px 14px', whiteSpace: 'nowrap', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  mobileMenu: { background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.1)' },
  mobileNavLink: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, textDecoration: 'none' },
}
