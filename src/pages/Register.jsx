import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', address: '',
    city: '', state: '', pincode: '',
    password: '', confirmPassword: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.includes('@')) errs.email = 'Valid email required'
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = '10-digit mobile required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to Bunkers 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className='auth-card'>
        <Link to="/" style={styles.logo}><span style={styles.logoText}>BUNKERS</span></Link>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join Bunkers for exclusive fashion deals</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              style={errors.name ? { borderColor: '#ef4444' } : {}}
            />
            {errors.name && <span style={styles.errMsg}>{errors.name}</span>}
          </div>

          {/* Email + Mobile */}
          <div style={styles.row} className='register-row'>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                style={errors.email ? { borderColor: '#ef4444' } : {}}
              />
              {errors.email && <span style={styles.errMsg}>{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                className="form-input"
                type="tel"
                name="mobile"
                placeholder="10-digit mobile no."
                value={form.mobile}
                onChange={handleChange}
                style={errors.mobile ? { borderColor: '#ef4444' } : {}}
              />
              {errors.mobile && <span style={styles.errMsg}>{errors.mobile}</span>}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="form-group">
            <label>Delivery Address</label>
            <input
              className="form-input"
              type="text"
              name="address"
              placeholder="House no, Street, Area"
              value={form.address}
              onChange={handleChange}
              style={errors.address ? { borderColor: '#ef4444' } : {}}
            />
            {errors.address && <span style={styles.errMsg}>{errors.address}</span>}
          </div>

          {/* City + State + PIN */}
          <div style={styles.row} className='register-row'>
            <div className="form-group">
              <label>City</label>
              <input
                className="form-input"
                type="text"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                className="form-input"
                type="text"
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>PIN Code</label>
              <input
                className="form-input"
                type="text"
                name="pincode"
                placeholder="PIN"
                value={form.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={styles.divider}><span>Set Password</span></div>

          {/* Password + Confirm */}
          <div style={styles.row} className='register-row'>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Password</label>
              <div style={styles.pwdWrapper}>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...(errors.password ? { borderColor: '#ef4444' } : {}), paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={styles.errMsg}>{errors.password}</span>}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Confirm Password</label>
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={errors.confirmPassword ? { borderColor: '#ef4444' } : {}}
              />
              {errors.confirmPassword && <span style={styles.errMsg}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
          >
            <UserPlus size={16} />
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#e94560', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    background: 'white', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 680,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #f3f4f6',
  },
  logo: { display: 'block', marginBottom: 24, textAlign: 'center' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, letterSpacing: 3, color: '#1a1a2e' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 6, textAlign: 'center' },
  subtitle: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 },
  pwdWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', padding: 4 },
  errMsg: { fontSize: 12, color: '#ef4444', marginTop: 2 },
  divider: { textAlign: 'center', color: '#9ca3af', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #f3f4f6', paddingBottom: 8 },
}
