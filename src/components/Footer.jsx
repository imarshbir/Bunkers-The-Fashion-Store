import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          <div>
            <div style={styles.brand}>BUNKERS</div>
            <p style={styles.tagline}>Fashion for everyone.<br />Quality you can trust.</p>
            <div style={styles.social}>
              <a href="#" style={styles.socialLink}>Instagram</a>
              <a href="#" style={styles.socialLink}>Twitter</a>
              <a href="#" style={styles.socialLink}>Facebook</a>
            </div>
          </div>
          <div>
            <h4 style={styles.colTitle}>Shop</h4>
            <div style={styles.links}>
              <Link to="/?category=Men" style={styles.link}>Men's Fashion</Link>
              <Link to="/?category=Women" style={styles.link}>Women's Fashion</Link>
              <Link to="/?category=Kids" style={styles.link}>Kids</Link>
              <Link to="/?category=Ethnic" style={styles.link}>Ethnic Wear</Link>
            </div>
          </div>
          <div>
            <h4 style={styles.colTitle}>Account</h4>
            <div style={styles.links}>
              <Link to="/login" style={styles.link}>Sign In</Link>
              <Link to="/register" style={styles.link}>Register</Link>
              <Link to="/profile" style={styles.link}>My Orders</Link>
              <Link to="/profile" style={styles.link}>My Profile</Link>
            </div>
          </div>
          <div>
            <h4 style={styles.colTitle}>Help</h4>
            <div style={styles.links}>
              <a href="#" style={styles.link}>Return Policy</a>
              <a href="#" style={styles.link}>Shipping Info</a>
              <a href="#" style={styles.link}>Size Guide</a>
              <a href="#" style={styles.link}>Contact Us</a>
            </div>
          </div>
        </div>
        <div style={styles.bottom}>
          <span>© {new Date().getFullYear()} Bunkers Fashion. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: { background: '#1a1a2e', color: 'rgba(255,255,255,0.75)', marginTop: 60, paddingTop: 48, paddingBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, paddingBottom: 40 },
  brand: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: 3, marginBottom: 12 },
  tagline: { fontSize: 13, lineHeight: 1.7, marginBottom: 16 },
  social: { display: 'flex', gap: 16 },
  socialLink: { fontSize: 13, color: '#e94560', fontWeight: 600, textDecoration: 'none' },
  colTitle: { color: 'white', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  links: { display: 'flex', flexDirection: 'column', gap: 10 },
  link: { fontSize: 13, color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', textDecoration: 'none' },
  bottom: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' },
}
