import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { CheckCircle, Truck, CreditCard, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { user } = useAuth()
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    paymentMethod: 'cod',
  })
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [btnClicked, setBtnClicked] = useState(false)

  const deliveryFee = cartTotal >= 499 ? 0 : 49
  const totalAmount = cartTotal + deliveryFee

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (cartItems.length === 0) { toast.error('Cart is empty'); return }
    if (!form.address || !form.city || !form.pincode) { toast.error('Fill complete delivery address'); return }

    setBtnClicked(true)
    // Snapshot cart before clearing
    const snapshot = [...cartItems]
    const deliveryAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`
    const items = snapshot.map(item => ({
      product_id: item.product_id,
      name: item.products?.name,
      price: item.products?.price,
      quantity: item.quantity,
      size: item.selected_size,
      color: item.selected_color,
      image: item.products?.images?.[0],
    }))

    // Show success screen IMMEDIATELY on button press
    const tempId = Math.random().toString(36).slice(2, 10).toUpperCase()
    setOrderId(tempId)
    setPlaced(true)
    await clearCart()

    // Save order to DB in background
    supabase.from('orders').insert([{
      customer_id: user.id,
      customer_name: form.name,
      customer_email: form.email,
      customer_mobile: form.mobile,
      delivery_address: deliveryAddress,
      items,
      total_amount: totalAmount,
      payment_method: form.paymentMethod,
      status: 'placed',
    }]).select().single().then(({ data }) => {
      if (data) setOrderId(data.id.slice(0, 8).toUpperCase())
      snapshot.forEach(item => {
        supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity }).catch(() => {})
      })
    })
  }

  // ── Success Screen ──────────────────────────────────────────
  if (placed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
        <Header />
        <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div style={styles.successCard}>
            <div style={styles.successIconWrap}>
              <CheckCircle size={64} color="#16a34a" strokeWidth={1.5} />
            </div>
            <h1 style={styles.successTitle}>Order Placed!</h1>
            <p style={styles.successSub}>
              Thank you for shopping with Bunkers. Your order is confirmed and will be delivered soon.
            </p>
            <div style={styles.successOrderId}>
              Order ID: <strong>#{orderId}</strong>
            </div>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 0 }}>
              We'll contact you on <strong>{form.mobile}</strong> for delivery updates.
            </p>
            <div style={styles.successActions}>
              <button className="btn-primary" onClick={() => navigate('/profile')} style={{ padding: '12px 28px' }}>
                View My Orders
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')} style={{ padding: '12px 28px' }}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (cartItems.length === 0) {
    navigate('/')
    return null
  }

  // ── Checkout Form ───────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <Header />
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <h1 style={styles.pageTitle}>Checkout</h1>
        <div style={styles.layout} className='checkout-layout'>

          {/* Left: Form */}
          <form onSubmit={handlePlaceOrder} style={styles.formSection}>

            {/* Delivery Address */}
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <h2 style={styles.sectionTitle}><MapPin size={18} /> Delivery Address</h2>
              <div style={styles.formGrid} className='checkout-form-grid'>
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input className="form-input" name="mobile" value={form.mobile} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Email</label>
                  <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Street Address</label>
                  <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="House no, street, area" required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input className="form-input" name="city" value={form.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input className="form-input" name="state" value={form.state} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={styles.sectionTitle}><CreditCard size={18} /> Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {[
                  { value: 'cod',  label: 'Cash on Delivery',    sub: 'Pay when you receive' },
                  { value: 'upi',  label: 'UPI',                 sub: 'Google Pay, PhonePe, Paytm' },
                  { value: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay' },
                ].map(opt => (
                  <label key={opt.value} style={{ ...styles.payOption, ...(form.paymentMethod === opt.value ? styles.payOptionActive : {}) }}>
                    <input type="radio" name="paymentMethod" value={opt.value} checked={form.paymentMethod === opt.value} onChange={handleChange} style={{ marginRight: 12 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
              {form.paymentMethod !== 'cod' && (
                <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: 12, marginTop: 16, fontSize: 13, color: '#854d0e' }}>
                  ⚠️ Online payment gateway integration required for production. Currently processing as COD.
                </div>
              )}
            </div>
          </form>

          {/* Right: Order Summary */}
          <div>
            <div className="card" style={{ padding: 24, position: 'sticky', top: 90 }}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 16 }}>Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={styles.summaryItem}>
                    <img
                      src={item.products?.images?.[0]}
                      alt={item.products?.name}
                      style={styles.summaryImg}
                      onError={e => { e.target.src = 'https://via.placeholder.com/56x64' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.products?.name}</div>
                      {item.selected_size && <div style={{ fontSize: 11, color: '#9ca3af' }}>Size: {item.selected_size}</div>}
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Qty: {item.quantity}</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>₹{(item.products?.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div style={styles.summaryRow}>
                <span>Delivery</span>
                <span style={{ color: deliveryFee === 0 ? '#16a34a' : undefined }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span style={{ color: '#e94560' }}>₹{totalAmount.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={btnClicked}
                className="btn-primary"
                style={{
                  width: '100%', justifyContent: 'center', padding: '15px', fontSize: 15, marginTop: 20,
                  background: btnClicked ? '#16a34a' : undefined,
                  opacity: 1,
                }}
              >
                {btnClicked ? '✓ Order Placed!' : <><Truck size={17} /> Place Order</>}
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                By placing order you agree to our terms & conditions
              </p>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 24 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' },
  formSection: { display: 'flex', flexDirection: 'column' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  payOption: { display: 'flex', alignItems: 'center', padding: 16, border: '1.5px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' },
  payOptionActive: { borderColor: '#e94560', background: '#fff1f3' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: 10 },
  summaryImg: { width: 56, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  summaryDivider: { height: 1, background: '#f3f4f6', margin: '12px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#374151' },
  successCard: {
    background: 'white', borderRadius: 20, padding: '60px 40px',
    maxWidth: 520, margin: '0 auto', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    animation: 'fadeIn 0.3s ease',
  },
  successIconWrap: {
    width: 100, height: 100, borderRadius: '50%',
    background: '#dcfce7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px',
  },
  successTitle: { fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, marginBottom: 12 },
  successSub: { color: '#6b7280', fontSize: 15, marginBottom: 20, lineHeight: 1.7 },
  successOrderId: {
    background: '#f8f7f4', borderRadius: 10,
    padding: '12px 20px', fontSize: 15, marginBottom: 16,
    display: 'inline-block', fontFamily: 'monospace',
  },
  successActions: { display: 'flex', gap: 12, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap' },
}
