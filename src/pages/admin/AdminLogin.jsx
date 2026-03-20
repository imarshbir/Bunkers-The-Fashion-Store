import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Lock, Eye, EyeOff, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { adminLogin, isAdmin } = useAuth()
  const navigate = useNavigate()

  if (isAdmin) { navigate('/admin/dashboard'); return null }

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      adminLogin({ email: form.email, password: form.password })
      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}><Shield size={32} color="#e94560" /></div>
        <div style={styles.logoText}>BUNKERS</div>
        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.sub}>Sign in to manage your store</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@bunkers.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter admin password"
                style={{ paddingRight: 42 }}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 4 }}>
            <Lock size={16} />
            {loading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={styles.hint}>
          <div style={styles.hintTitle}>Default Credentials</div>
          <div style={styles.hintRow}><span>Email:</span> <code>admin@bunkers.com</code></div>
          <div style={styles.hintRow}><span>Password:</span> <code>Admin*123</code></div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { background: 'white', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' },
  iconWrap: { width: 64, height: 64, borderRadius: '50%', background: '#fff1f3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#1a1a2e', marginBottom: 8 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub: { color: '#6b7280', fontSize: 14, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'left' },
  eyeBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', padding: 4 },
  hint: { marginTop: 24, background: '#f8f7f4', borderRadius: 10, padding: '14px 18px', textAlign: 'left' },
  hintTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 8 },
  hintRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#374151' },
}
