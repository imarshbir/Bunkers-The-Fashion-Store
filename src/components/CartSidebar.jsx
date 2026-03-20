import { useNavigate } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartSidebar({ open, onClose }) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, cartLoading } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }}
        />
      )}
      {/* Drawer */}
      <div className='cart-drawer' style={{
        ...styles.drawer,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
      }}>
        <div style={styles.header}>
          <h2 style={styles.title}>Your Cart <span style={styles.count}>({cartItems.length})</span></h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        {cartLoading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : cartItems.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={56} color="#d1d5db" />
            <h3>Your cart is empty</h3>
            <p>Add items to get started</p>
            <button className="btn-primary" onClick={onClose}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div style={styles.items}>
              {cartItems.map(item => (
                <div key={item.id} style={styles.item}>
                  <img
                    src={item.products?.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'}
                    alt={item.products?.name}
                    style={styles.itemImage}
                  />
                  <div style={styles.itemInfo}>
                    <div style={styles.itemName}>{item.products?.name}</div>
                    {item.selected_size && <div style={styles.itemMeta}>Size: {item.selected_size}</div>}
                    {item.selected_color && <div style={styles.itemMeta}>Color: {item.selected_color}</div>}
                    <div style={styles.itemPrice}>₹{(item.products?.price * item.quantity).toLocaleString()}</div>
                    <div style={styles.qtyControls}>
                      <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={13} />
                      </button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Subtotal</span>
                <span style={styles.totalValue}>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Delivery</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{cartTotal >= 499 ? 'FREE' : '₹49'}</span>
              </div>
              <div style={styles.divider} />
              <div style={{ ...styles.totalRow, marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 20, color: '#e94560' }}>
                  ₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toLocaleString()}
                </span>
              </div>
              <button className="btn-primary" onClick={handleCheckout} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                Proceed to Checkout
              </button>
              {cartTotal < 499 && (
                <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
                  Add ₹{(499 - cartTotal).toFixed(0)} more for FREE delivery
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

const styles = {
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 400, maxWidth: '92vw',
    background: 'white', zIndex: 201,
    display: 'flex', flexDirection: 'column',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px',
    borderBottom: '1px solid #f3f4f6',
    flexShrink: 0,
  },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 },
  count: { color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 15 },
  closeBtn: { padding: 6, borderRadius: 8, color: '#6b7280', transition: 'background 0.2s' },
  items: { flex: 1, overflowY: 'auto', padding: '12px 0' },
  item: {
    display: 'flex', gap: 12, padding: '14px 20px',
    borderBottom: '1px solid #f9fafb',
    position: 'relative',
  },
  itemImage: { width: 70, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 },
  itemMeta: { fontSize: 12, color: '#9ca3af' },
  itemPrice: { fontSize: 15, fontWeight: 700, color: '#e94560', marginTop: 4 },
  qtyControls: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#374151', transition: 'all 0.15s',
  },
  qtyNum: { fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' },
  removeBtn: { color: '#d1d5db', alignSelf: 'flex-start', padding: 4, transition: 'color 0.15s' },
  footer: { padding: 20, borderTop: '1px solid #f3f4f6', flexShrink: 0 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: '#6b7280' },
  totalValue: { fontSize: 16, fontWeight: 600 },
  divider: { height: 1, background: '#f3f4f6', margin: '12px 0' },
}
