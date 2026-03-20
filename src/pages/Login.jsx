import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.identifier || !form.password) { toast.error('Fill all fields'); return }
    setLoading(true)
    try {
      await login({ identifier: form.identifier, password: form.password })
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className='auth-card'>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>BUNKERS</span>
        </Link>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label>Email or Mobile Number</label>
            <input
              className="form-input"
              type="text"
              name="identifier"
              placeholder="Enter email or 10-digit mobile"
              value={form.identifier}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={styles.pwdWrapper}>
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                style={{ paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
          >
            <LogIn size={16} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}><span>New to Bunkers?</span></div>
        <Link to="/register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          Create Account
        </Link>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f8f7f4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: 'white', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #f3f4f6',
  },
  logo: { display: 'block', marginBottom: 28, textAlign: 'center' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, letterSpacing: 3, color: '#1a1a2e' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 6, textAlign: 'center' },
  subtitle: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 },
  pwdWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', padding: 4 },
  divider: {
    textAlign: 'center', position: 'relative', margin: '20px 0 16px',
    color: '#9ca3af', fontSize: 13,
  },
}
