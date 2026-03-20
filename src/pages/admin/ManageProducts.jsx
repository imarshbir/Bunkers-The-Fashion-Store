import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/AdminSidebar'
import { Plus, Edit2, Trash2, X, Save, Search, Image as ImageIcon, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', price: '', original_price: '', discount_percent: 0,
  stock: '', category: '', subcategory: '', brand: '',
  sizes: '', colors: '', images: '',
  is_featured: false, is_active: true,
}

const CATEGORIES = ['Men', 'Women', 'Kids', 'Unisex', 'Ethnic', 'Formal', 'Sports', 'Casual']

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setForm({
      ...product,
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      stock: product.stock?.toString() || '',
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      images: product.images?.join('\n') || '',
    })
    setEditingId(product.id)
    setShowModal(true)
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock || !form.category) {
      toast.error('Fill required fields: Name, Price, Stock, Category')
      return
    }
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      discount_percent: form.discount_percent ? parseInt(form.discount_percent) : 0,
      stock: parseInt(form.stock),
      category: form.category,
      subcategory: form.subcategory,
      brand: form.brand,
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      is_featured: form.is_featured,
      is_active: form.is_active,
    }

    let error
    if (editingId) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editingId))
    } else {
      ({ error } = await supabase.from('products').insert([payload]))
    }

    if (error) {
      toast.error('Save failed: ' + error.message)
    } else {
      toast.success(editingId ? 'Product updated!' : 'Product added!')
      setShowModal(false)
      fetchProducts()
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('Delete failed')
    else { toast.success('Product deleted'); fetchProducts() }
    setDeletingId(null)
    setConfirmDelete(null)
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.layout} className="admin-layout">
      <AdminSidebar />
      <main style={styles.main} className="admin-main">
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Manage Products</h1>
            <p style={styles.pageSub}>{products.length} products in store</p>
          </div>
          <button className="btn-primary" onClick={openAdd} style={{ padding: '10px 22px' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchBar}>
          <Search size={16} color="#9ca3af" />
          <input
            style={styles.searchInput}
            placeholder="Search by name, category, brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Featured</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No products found</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.productCell}>
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} style={styles.productImg} onError={e => { e.target.style.display = 'none' }} />
                          ) : (
                            <div style={styles.productImgPlaceholder}><ImageIcon size={16} color="#d1d5db" /></div>
                          )}
                          <div>
                            <div style={styles.productName}>{p.name}</div>
                            <div style={styles.productBrand}>{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}><span style={styles.catChip}>{p.category}</span></td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700 }}>₹{p.price?.toLocaleString()}</div>
                        {p.original_price > p.price && <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{p.original_price?.toLocaleString()}</div>}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.stockBadge, background: p.stock > 10 ? '#dcfce7' : p.stock > 0 ? '#fef9c3' : '#fee2e2', color: p.stock > 10 ? '#166534' : p.stock > 0 ? '#854d0e' : '#991b1b' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusDot, background: p.is_active ? '#dcfce7' : '#fee2e2', color: p.is_active ? '#166534' : '#991b1b' }}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: 18 }}>{p.is_featured ? '⭐' : '—'}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={styles.editBtn} title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setConfirmDelete(p)} style={styles.deleteBtn} title="Delete" disabled={deletingId === p.id}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={styles.modalBody}>
              <div style={styles.formGrid2}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic Cotton Shirt" required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Detailed product description…" style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input className="form-input" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input className="form-input" name="original_price" type="number" min="0" step="0.01" value={form.original_price} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input className="form-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input className="form-input" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" />
                </div>
                <div className="form-group">
                  <label>Subcategory</label>
                  <input className="form-input" name="subcategory" value={form.subcategory} onChange={handleChange} placeholder="e.g. T-Shirts" />
                </div>
                <div className="form-group">
                  <label>Sizes (comma-separated)</label>
                  <input className="form-input" name="sizes" value={form.sizes} onChange={handleChange} placeholder="S, M, L, XL, XXL" />
                </div>
                <div className="form-group">
                  <label>Colors (comma-separated)</label>
                  <input className="form-input" name="colors" value={form.colors} onChange={handleChange} placeholder="Red, Blue, Black" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Image URLs (one per line)</label>
                  <textarea className="form-input" name="images" value={form.images} onChange={handleChange} rows={4}
                    placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
                    style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Enter direct image URLs, one per line. Use Unsplash, Cloudinary, or any CDN.</span>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 24 }}>
                  <label style={styles.checkLabel}>
                    <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                    Featured Product ⭐
                  </label>
                  <label style={styles.checkLabel}>
                    <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                    Active (visible on site)
                  </label>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '11px 28px' }}>
                  <Save size={15} /> {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={styles.confirmModal}>
            <div style={styles.confirmIcon}><AlertCircle size={36} color="#ef4444" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Product?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
              Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deletingId === confirmDelete.id}
                style={{ ...styles.dangerBtn, flex: 1 }}
              >
                {deletingId === confirmDelete.id ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f8f7f4' },
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 },
  pageSub: { color: '#6b7280', fontSize: 14 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', marginBottom: 20, maxWidth: 400 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8f7f4' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 14, verticalAlign: 'middle' },
  productCell: { display: 'flex', alignItems: 'center', gap: 12 },
  productImg: { width: 48, height: 54, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  productImgPlaceholder: { width: 48, height: 54, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  productName: { fontWeight: 600, fontSize: 14, lineHeight: 1.3 },
  productBrand: { fontSize: 12, color: '#9ca3af' },
  catChip: { background: '#f3f4f6', color: '#374151', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  stockBadge: { fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 },
  statusDot: { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  editBtn: { padding: '7px', borderRadius: 8, background: '#eff6ff', color: '#3b82f6', transition: 'background 0.15s' },
  deleteBtn: { padding: '7px', borderRadius: 8, background: '#fee2e2', color: '#ef4444', transition: 'background 0.15s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(2px)' },
  modal: { background: 'white', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 },
  closeBtn: { color: '#6b7280', padding: 6, borderRadius: 8 },
  modalBody: { flex: 1, overflowY: 'auto', padding: '24px 28px' },
  formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 28px', borderTop: '1px solid #f3f4f6', flexShrink: 0 },
  confirmModal: { background: 'white', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  confirmIcon: { width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dangerBtn: { padding: '11px 20px', background: '#ef4444', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background 0.2s' },
}
