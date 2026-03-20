import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <aside style={styles.sidebar} className='admin-sidebar'>
      <Link to="/admin/dashboard" style={styles.logo}>
        <span style={styles.logoText}>BUNKERS</span>
        <span style={styles.logoSub}>Admin Panel</span>
      </Link>

      <nav style={styles.nav} className='admin-sidebar-nav'>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path} style={{ ...styles.navItem, ...(active ? styles.navActive : {}) }}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => { logout(); navigate('/admin') }}
        style={styles.logoutBtn}
      >
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 240, flexShrink: 0,
    background: '#1a1a2e', minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    padding: '0 0 24px',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  logo: {
    display: 'flex', flexDirection: 'column', lineHeight: 1,
    padding: '28px 24px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: 3 },
  logoSub: { fontSize: 9, color: '#e94560', letterSpacing: 4, textTransform: 'uppercase', marginTop: 4 },
  nav: { flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    color: 'rgba(255,255,255,0.65)', transition: 'all 0.2s',
  },
  navActive: {
    background: '#e94560', color: 'white',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    margin: '16px 12px 0',
    padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
    background: 'transparent',
  },
}
