import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { User, Package, Heart, ShoppingCart, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'cart', label: 'My Cart', icon: ShoppingCart },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
]

const ORDER_STATUS_META = {
  placed:    { bg: '#dbeafe', color: '#1e40af', label: 'Order Placed' },
  shipped:   { bg: '#ede9fe', color: '#5b21b6', label: 'Shipped'      },
  delivered: { bg: '#dcfce7', color: '#166534', label: 'Delivered'    },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled'    },
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth()
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: user?.name || '', address: user?.address || '', city: user?.city || '', state: user?.state || '', pincode: user?.pincode || '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders()
    if (activeTab === 'wishlist') fetchWishlist()
  }, [activeTab])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    const { data } = await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoadingOrders(false)
  }

  const fetchWishlist = async () => {
    setLoadingWishlist(true)
    const { data } = await supabase.from('wishlist').select('*, products(*)').eq('customer_id', user.id)
    if (data) setWishlist(data)
    setLoadingWishlist(false)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile(editForm)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <Header />
      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
        <div style={styles.layout} className='profile-layout'>
          {/* Sidebar */}
          <aside style={styles.sidebar} className='profile-sidebar'>
            <div style={styles.userCard}>
              <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
            <nav style={styles.nav}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{ ...styles.navItem, ...(activeTab === id ? styles.navActive : {}) }}>
                  <Icon size={17} /> {label}
                </button>
              ))}
              <button onClick={handleLogout} style={{ ...styles.navItem, color: '#ef4444', marginTop: 8 }}>
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main style={styles.main}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card" style={{ padding: 32 }}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>My Profile</h2>
                  {!editing ? (
                    <button className="btn-secondary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => setEditing(true)}>
                      <Edit2 size={14} /> Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }} onClick={handleSaveProfile} disabled={saving}>
                        <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button className="btn-ghost" onClick={() => setEditing(false)}><X size={14} /></button>
                    </div>
                  )}
                </div>

                <div style={styles.profileGrid}>
                  {[
                    { label: 'Full Name', field: 'name', value: user?.name },
                    { label: 'Email Address', field: null, value: user?.email },
                    { label: 'Mobile Number', field: null, value: user?.mobile },
                    { label: 'Delivery Address', field: 'address', value: user?.address },
                    { label: 'City', field: 'city', value: user?.city },
                    { label: 'State', field: 'state', value: user?.state },
                    { label: 'PIN Code', field: 'pincode', value: user?.pincode },
                  ].map(({ label, field, value }) => (
                    <div key={label} className="form-group">
                      <label>{label}</label>
                      {editing && field ? (
                        <input className="form-input" value={editForm[field]} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))} />
                      ) : (
                        <div style={styles.profileValue}>{value || '—'}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 20 }}>My Orders</h2>
                {loadingOrders ? <div className="page-loader"><div className="spinner" /></div>
                  : orders.length === 0 ? (
                    <div className="empty-state card">
                      <Package size={48} color="#d1d5db" />
                      <h3>No orders yet</h3>
                      <p>When you place orders, they'll appear here</p>
                      <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {orders.map(order => {
                        const statusStyle = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.placed
                        return (
                          <div key={order.id} className="card" style={{ padding: 24 }}>
                            <div style={styles.orderHeader}>
                              <div>
                                <div style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                                <div style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                              </div>
                              <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                                {statusStyle.label}
                              </span>
                            </div>
                            <div style={styles.orderItems}>
                              {order.items?.map((item, i) => (
                                <div key={i} style={styles.orderItem}>
                                  <img src={item.image || 'https://via.placeholder.com/60x70?text=Item'} alt={item.name} style={styles.orderItemImg} onError={e => { e.target.src = 'https://via.placeholder.com/60x70?text=Item' }} />
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</div>
                                    <div style={{ fontWeight: 700, color: '#e94560', fontSize: 14 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={styles.orderFooter}>
                              <span style={{ fontSize: 13, color: '#6b7280' }}>Delivery: {order.delivery_address}</span>
                              <span style={{ fontWeight: 700, fontSize: 16 }}>Total: ₹{order.total_amount?.toLocaleString()}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
              </div>
            )}

            {/* Cart Tab */}
            {activeTab === 'cart' && (
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 20 }}>My Cart</h2>
                {cartItems.length === 0 ? (
                  <div className="empty-state card">
                    <ShoppingCart size={48} color="#d1d5db" />
                    <h3>Your cart is empty</h3>
                    <button className="btn-primary" onClick={() => navigate('/')}>Browse Products</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      {cartItems.map(item => (
                        <div key={item.id} className="card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                          <img src={item.products?.images?.[0]} alt={item.products?.name} style={{ width: 70, height: 80, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://via.placeholder.com/70x80' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{item.products?.name}</div>
                            {item.selected_size && <div style={{ fontSize: 12, color: '#9ca3af' }}>Size: {item.selected_size}</div>}
                            <div style={{ fontWeight: 700, color: '#e94560' }}>₹{(item.products?.price * item.quantity).toLocaleString()}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>-</button>
                            <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', padding: 6 }}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
                        <span>Total</span><span style={{ color: '#e94560' }}>₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <button className="btn-primary" onClick={() => navigate('/checkout')} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 20 }}>My Wishlist</h2>
                {loadingWishlist ? <div className="page-loader"><div className="spinner" /></div>
                  : wishlist.length === 0 ? (
                    <div className="empty-state card">
                      <Heart size={48} color="#d1d5db" />
                      <h3>No items in wishlist</h3>
                      <button className="btn-primary" onClick={() => navigate('/')}>Browse Products</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                      {wishlist.map(w => w.products && (
                        <div key={w.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/product/${w.product_id}`)}>
                          <img src={w.products.images?.[0]} alt={w.products.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} onError={e => { e.target.src = 'https://via.placeholder.com/200x260' }} />
                          <div style={{ padding: 12 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{w.products.name}</div>
                            <div style={{ fontWeight: 700, color: '#e94560' }}>₹{w.products.price?.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' },
  sidebar: { background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 90 },
  userCard: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '28px 20px', textAlign: 'center' },
  avatar: { width: 56, height: 56, borderRadius: '50%', background: '#e94560', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, margin: '0 auto 10px' },
  userName: { color: 'white', fontWeight: 700, fontSize: 15 },
  userEmail: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 3 },
  nav: { padding: '12px 8px' },
  navItem: { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#6b7280', transition: 'all 0.2s', background: 'none', textAlign: 'left', cursor: 'pointer' },
  navActive: { background: '#fff1f3', color: '#e94560', fontWeight: 600 },
  main: { minHeight: 400 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 },
  profileValue: { padding: '12px 16px', background: '#f8f7f4', borderRadius: 8, fontSize: 15, color: '#374151', fontWeight: 500 },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontWeight: 700, fontSize: 15, fontFamily: 'monospace' },
  orderDate: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99 },
  orderItems: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  orderItem: { display: 'flex', gap: 12, alignItems: 'center' },
  orderItemImg: { width: 60, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8 },
  qtyBtn: { width: 30, height: 30, border: '1.5px solid #e5e7eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, cursor: 'pointer' },
}
