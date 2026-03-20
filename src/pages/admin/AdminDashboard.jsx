import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/AdminSidebar'
import { Package, ShoppingBag, Users, TrendingUp, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    setLoading(true)
    const [{ count: products }, { count: orders }, { count: customers }, { data: orderData }, { data: recent }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').in('status', ['shipped', 'delivered']),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    ])
    const revenue = orderData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    setStats({ products: products || 0, orders: orders || 0, customers: customers || 0, revenue })
    if (recent) setRecentOrders(recent)
    setLoading(false)
  }

  const STATUS_ICONS = {
    placed:    { icon: Clock,        color: '#854d0e', bg: '#fef9c3' },
    shipped:   { icon: Truck,        color: '#5b21b6', bg: '#ede9fe' },
    delivered: { icon: CheckCircle,  color: '#166534', bg: '#dcfce7' },
    cancelled: { icon: XCircle,      color: '#ef4444', bg: '#fee2e2' },
  }

  return (
    <div style={styles.layout} className="admin-layout">
      <AdminSidebar />
      <main style={styles.main} className="admin-main">
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSub}>Welcome back, Admin. Here's your store overview.</p>
          </div>
          <div style={styles.dateBadge}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={styles.statsGrid}>
              {[
                { label: 'Total Products', value: stats.products, icon: Package, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: '#8b5cf6', bg: '#f5f3ff' },
                { label: 'Customers', value: stats.customers, icon: Users, color: '#10b981', bg: '#ecfdf5' },
                { label: 'Revenue (Shipped+Delivered)', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: '#e94560', bg: '#fff1f3' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card" style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: bg }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <div style={styles.statValue}>{value}</div>
                    <div style={styles.statLabel}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="card" style={styles.recentCard}>
              <h2 style={styles.cardTitle}>Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14, padding: '20px 0' }}>No orders yet</p>
              ) : (
                <div style={styles.table}>
                  <div style={styles.tableHeader}>
                    <span>Order ID</span>
                    <span>Customer</span>
                    <span>Mobile</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Date</span>
                  </div>
                  {recentOrders.map(order => {
                    const s = STATUS_ICONS[order.status] || STATUS_ICONS.pending
                    const StatusIcon = s.icon
                    return (
                      <div key={order.id} style={styles.tableRow}>
                        <span style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span style={styles.cell}>{order.customer_name}</span>
                        <span style={styles.cell}>{order.customer_mobile}</span>
                        <span style={{ ...styles.cell, fontWeight: 700 }}>₹{order.total_amount?.toLocaleString()}</span>
                        <span>
                          <span style={{ ...styles.statusChip, background: s.bg, color: s.color }}>
                            <StatusIcon size={12} />
                            {order.status}
                          </span>
                        </span>
                        <span style={{ ...styles.cell, color: '#9ca3af' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f8f7f4' },
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 },
  pageSub: { color: '#6b7280', fontSize: 14 },
  dateBadge: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: '#6b7280' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 },
  statCard: { display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px' },
  statIcon: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700 },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  recentCard: { padding: '24px 28px' },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 20 },
  table: { display: 'flex', flexDirection: 'column', gap: 0 },
  tableHeader: { display: 'grid', gridTemplateColumns: '140px 1fr 120px 100px 120px 100px', gap: 12, padding: '10px 16px', background: '#f8f7f4', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  tableRow: { display: 'grid', gridTemplateColumns: '140px 1fr 120px 100px 120px 100px', gap: 12, padding: '14px 16px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' },
  orderId: { fontFamily: 'monospace', fontWeight: 700, fontSize: 13 },
  cell: { fontSize: 14, color: '#374151' },
  statusChip: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, textTransform: 'capitalize' },
}
