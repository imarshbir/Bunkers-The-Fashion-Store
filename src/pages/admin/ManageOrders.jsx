import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/AdminSidebar'
import { Search, Eye, X, Phone, Mail, MapPin, Truck, XCircle, CheckCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'

// Customer places order → status saved as 'placed' in DB
// Admin sees it labelled as "Pending" — they can then ship, deliver, or cancel
const STATUS_META = {
  placed:    { bg: '#fef9c3', color: '#854d0e', label: 'Pending',   icon: Package },
  shipped:   { bg: '#ede9fe', color: '#5b21b6', label: 'Shipped',   icon: Truck },
  delivered: { bg: '#dcfce7', color: '#166534', label: 'Delivered', icon: CheckCircle },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled', icon: XCircle },
}

// Admin dropdown options — 'placed' is not selectable (it's set by customer automatically)
const ADMIN_OPTIONS = [
  { value: 'placed',    label: 'Pending'   },
  { value: 'shipped',   label: 'Shipped'   },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ManageOrders() {
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId]       = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (error) {
      toast.error('Update failed: ' + error.message)
    } else {
      const label = STATUS_META[newStatus]?.label || newStatus
      toast.success(`Order updated to "${label}"`)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }))
    }
    setUpdatingId(null)
  }

  const filtered = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus
    const q = search.toLowerCase()
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_mobile?.includes(search) ||
      o.id?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})

  return (
    <div style={styles.layout} className="admin-layout">
      <AdminSidebar />
      <main style={styles.main} className="admin-main">

        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Orders</h1>
            <p style={styles.pageSub}>{orders.length} total orders</p>
          </div>
          <button onClick={fetchOrders} style={styles.refreshBtn}>↻ Refresh</button>
        </div>

        {/* Search + Filter tabs */}
        <div style={styles.filtersBar}>
          <div style={styles.searchBox}>
            <Search size={15} color="#9ca3af" />
            <input
              style={styles.searchInput}
              placeholder="Search by name, mobile, order ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={styles.tabs}>
            {[
              { key: 'all',       label: 'All',       count: orders.length },
              { key: 'placed',    label: 'Pending',   count: counts['placed']    || 0 },
              { key: 'shipped',   label: 'Shipped',   count: counts['shipped']   || 0 },
              { key: 'delivered', label: 'Delivered', count: counts['delivered'] || 0 },
              { key: 'cancelled', label: 'Cancelled', count: counts['cancelled'] || 0 },
            ].map(tab => {
              const active = filterStatus === tab.key
              const meta = STATUS_META[tab.key]
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  style={{
                    ...styles.tab,
                    ...(active ? {
                      background: meta?.bg || '#1a1a2e',
                      color: meta?.color || 'white',
                      borderColor: meta?.color || '#1a1a2e',
                      fontWeight: 700,
                    } : {}),
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      ...styles.tabCount,
                      background: active ? (meta?.color || '#1a1a2e') : '#e5e7eb',
                      color: active ? 'white' : '#6b7280',
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Mobile</th>
                    <th style={styles.th}>Items</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Update Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                        No orders found
                      </td>
                    </tr>
                  ) : filtered.map(order => {
                    const meta = STATUS_META[order.status] || STATUS_META.placed
                    const StatusIcon = meta.icon
                    const isBusy = updatingId === order.id

                    return (
                      <tr key={order.id} style={styles.tr}>

                        <td style={styles.td}>
                          <span style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                        </td>

                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{order.customer_name}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{order.customer_email}</div>
                        </td>

                        <td style={styles.td}>
                          <a href={`tel:${order.customer_mobile}`} style={styles.phoneLink}>
                            <Phone size={13} /> {order.customer_mobile}
                          </a>
                        </td>

                        <td style={styles.td}>
                          <div style={{ fontSize: 13 }}>
                            {order.items?.slice(0, 2).map((item, i) => (
                              <div key={i} style={{ lineHeight: 1.5 }}>{item.name} × {item.quantity}</div>
                            ))}
                            {order.items?.length > 2 && (
                              <div style={{ color: '#9ca3af', fontSize: 12 }}>+{order.items.length - 2} more</div>
                            )}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>₹{order.total_amount?.toLocaleString()}</span>
                        </td>

                        {/* Action buttons to update status */}
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                            {/* Current status badge */}
                            <span style={{ ...styles.statusBadge, background: meta.bg, color: meta.color }}>
                              <StatusIcon size={11} />
                              {meta.label}
                            </span>
                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {order.status === 'placed' && (
                                <>
                                  <button
                                    onClick={() => updateStatus(order.id, 'shipped')}
                                    disabled={isBusy}
                                    style={{ ...styles.actionBtn, background: '#ede9fe', color: '#5b21b6' }}
                                  >
                                    {isBusy ? '…' : '🚚 Ship'}
                                  </button>
                                  <button
                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                    disabled={isBusy}
                                    style={{ ...styles.actionBtn, background: '#fee2e2', color: '#991b1b' }}
                                  >
                                    {isBusy ? '…' : '✕ Cancel'}
                                  </button>
                                </>
                              )}
                              {order.status === 'shipped' && (
                                <>
                                  <button
                                    onClick={() => updateStatus(order.id, 'delivered')}
                                    disabled={isBusy}
                                    style={{ ...styles.actionBtn, background: '#dcfce7', color: '#166534' }}
                                  >
                                    {isBusy ? '…' : '✓ Delivered'}
                                  </button>
                                  <button
                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                    disabled={isBusy}
                                    style={{ ...styles.actionBtn, background: '#fee2e2', color: '#991b1b' }}
                                  >
                                    {isBusy ? '…' : '✕ Cancel'}
                                  </button>
                                </>
                              )}
                              {(order.status === 'delivered' || order.status === 'cancelled') && (
                                <span style={{ fontSize: 11, color: '#9ca3af', padding: '3px 0' }}>No further actions</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ ...styles.td, color: '#9ca3af', fontSize: 13, whiteSpace: 'nowrap' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        <td style={styles.td}>
                          <button onClick={() => setSelectedOrder(order)} style={styles.viewBtn} title="View full details">
                            <Eye size={15} />
                          </button>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div style={styles.modal}>

            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Order Details</h2>
                <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>
                  #{selectedOrder.id.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            <div style={styles.modalBody}>

              {/* Status updater in modal */}
              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Order Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {(() => {
                    const meta = STATUS_META[selectedOrder.status] || STATUS_META.placed
                    const StatusIcon = meta.icon
                    return (
                      <span style={{ ...styles.bigStatusBadge, background: meta.bg, color: meta.color }}>
                        <StatusIcon size={16} /> {meta.label}
                      </span>
                    )
                  })()}

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                    {selectedOrder.status === 'placed' && (
                      <>
                        <button
                          onClick={() => updateStatus(selectedOrder.id, 'shipped')}
                          disabled={updatingId === selectedOrder.id}
                          style={styles.modalActionBtn('#5b21b6', '#ede9fe')}
                        >
                          {updatingId === selectedOrder.id ? 'Updating…' : '🚚 Mark as Shipped'}
                        </button>
                        <button
                          onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                          disabled={updatingId === selectedOrder.id}
                          style={styles.modalActionBtn('#991b1b', '#fee2e2')}
                        >
                          {updatingId === selectedOrder.id ? 'Updating…' : '✕ Cancel Order'}
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <>
                        <button
                          onClick={() => updateStatus(selectedOrder.id, 'delivered')}
                          disabled={updatingId === selectedOrder.id}
                          style={styles.modalActionBtn('#166534', '#dcfce7')}
                        >
                          {updatingId === selectedOrder.id ? 'Updating…' : '✓ Mark as Delivered'}
                        </button>
                        <button
                          onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                          disabled={updatingId === selectedOrder.id}
                          style={styles.modalActionBtn('#991b1b', '#fee2e2')}
                        >
                          {updatingId === selectedOrder.id ? 'Updating…' : '✕ Cancel Order'}
                        </button>
                      </>
                    )}
                    {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>This order is in a final state — no further actions.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer info */}
              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Customer Information</div>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <UserIcon size={14} />
                    <span><strong>Name:</strong> {selectedOrder.customer_name}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <Phone size={14} />
                    <span><strong>Mobile:</strong> {selectedOrder.customer_mobile}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <Mail size={14} />
                    <span><strong>Email:</strong> {selectedOrder.customer_email}</span>
                  </div>
                  <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                    <MapPin size={14} />
                    <span><strong>Delivery Address:</strong> {selectedOrder.delivery_address}</span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Products Ordered</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={styles.itemRow}>
                      <img
                        src={item.image || 'https://via.placeholder.com/56x64?text=Item'}
                        alt={item.name}
                        style={styles.itemImg}
                        onError={e => { e.target.src = 'https://via.placeholder.com/56x64?text=Item' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          Qty: {item.quantity}
                          {item.size  ? ` · Size: ${item.size}`   : ''}
                          {item.color ? ` · Color: ${item.color}` : ''}
                        </div>
                        <div style={{ fontSize: 11, color: '#d1d5db', fontFamily: 'monospace', marginTop: 2 }}>
                          Product ID: {item.product_id?.slice(0, 18)}…
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Order Summary</div>
                <div style={styles.summaryBox}>
                  <div style={styles.summaryRow}>
                    <span>Payment Method</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {selectedOrder.payment_method || 'Cash on Delivery'}
                    </span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Order Placed On</span>
                    <span>{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ ...styles.summaryRow, fontSize: 18, fontWeight: 700, paddingTop: 12, borderTop: '1px solid #e5e7eb', marginTop: 8 }}>
                    <span>Total Amount</span>
                    <span style={{ color: '#e94560' }}>₹{selectedOrder.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const styles = {
  layout:       { display: 'flex', minHeight: '100vh', background: '#f8f7f4' },
  main:         { flex: 1, padding: '32px 36px', overflowY: 'auto' },
  topBar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle:    { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 },
  pageSub:      { color: '#6b7280', fontSize: 14 },
  refreshBtn:   { padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'white', cursor: 'pointer', color: '#374151' },

  filtersBar:   { display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  searchBox:    { display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '9px 14px', minWidth: 260 },
  searchInput:  { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' },
  tabs:         { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab:          { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#6b7280', background: 'white', border: '1.5px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.15s' },
  tabCount:     { fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99, minWidth: 20, textAlign: 'center' },

  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#f8f7f4' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' },
  tr:           { borderBottom: '1px solid #f3f4f6' },
  td:           { padding: '14px 16px', fontSize: 14, verticalAlign: 'middle' },
  orderId:      { fontFamily: 'monospace', fontWeight: 700, fontSize: 13 },
  phoneLink:    { display: 'flex', alignItems: 'center', gap: 5, color: '#3b82f6', fontWeight: 600, fontSize: 13 },

  statusBadge:  { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap' },
  statusDropdown: {
    padding: '6px 10px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    background: 'white',
    color: '#1a1a2e',
    cursor: 'pointer',
    outline: 'none',
    minWidth: 120,
  },

  viewBtn:      { padding: '7px', borderRadius: 8, background: '#f3f4f6', color: '#374151' },
  actionBtn:    { padding: '5px 12px', borderRadius: 6, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'opacity 0.15s', whiteSpace: 'nowrap' },

  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)' },
  modal:        { background: 'white', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 },
  modalTitle:   { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 2 },
  closeBtn:     { color: '#6b7280', padding: 6, borderRadius: 8 },
  modalBody:    { flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 24 },

  detailSection: {},
  detailLabel:  { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 10 },
  bigStatusBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, padding: '8px 18px', borderRadius: 10 },
  modalActionBtn: (color, bg) => ({ padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: bg, color: color, transition: 'opacity 0.15s' }),
  modalDropdown: {
    padding: '9px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: 'white',
    color: '#1a1a2e',
    cursor: 'pointer',
    outline: 'none',
    minWidth: 160,
  },

  infoGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  infoItem:     { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', background: '#f8f7f4', borderRadius: 8, padding: '10px 12px' },
  itemRow:      { display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f8f7f4', borderRadius: 10 },
  itemImg:      { width: 56, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  summaryBox:   { background: '#f8f7f4', borderRadius: 10, padding: '16px 20px' },
  summaryRow:   { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151', marginBottom: 8 },
}
