import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const ADMIN_EMAIL = 'admin@bunkers.com'
const ADMIN_PASSWORD = 'Admin*123'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bunkers_user')
    const storedAdmin = localStorage.getItem('bunkers_admin')
    if (stored) setUser(JSON.parse(stored))
    if (storedAdmin) setIsAdmin(true)
    setLoading(false)
  }, [])

  const register = async ({ name, email, mobile, address, city, state, pincode, password }) => {
    // Check duplicate email
    const { data: existingEmail } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()
    if (existingEmail) throw new Error('Email already registered')

    // Check duplicate mobile
    const { data: existingMobile } = await supabase
      .from('customers')
      .select('id')
      .eq('mobile', mobile)
      .single()
    if (existingMobile) throw new Error('Mobile number already registered')

    const password_hash = await bcrypt.hash(password, 12)

    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, email: email.toLowerCase(), mobile, address, city, state, pincode, password_hash }])
      .select()
      .single()

    if (error) throw new Error(error.message)

    const userData = { id: data.id, name: data.name, email: data.email, mobile: data.mobile, address: data.address, city: data.city, state: data.state, pincode: data.pincode }
    setUser(userData)
    localStorage.setItem('bunkers_user', JSON.stringify(userData))
    return userData
  }

  const login = async ({ identifier, password }) => {
    // identifier can be email or mobile
    const isEmail = identifier.includes('@')

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq(isEmail ? 'email' : 'mobile', isEmail ? identifier.toLowerCase() : identifier)
      .single()

    if (error || !data) throw new Error('No account found with these credentials')

    const valid = await bcrypt.compare(password, data.password_hash)
    if (!valid) throw new Error('Incorrect password')

    const userData = { id: data.id, name: data.name, email: data.email, mobile: data.mobile, address: data.address, city: data.city, state: data.state, pincode: data.pincode }
    setUser(userData)
    localStorage.setItem('bunkers_user', JSON.stringify(userData))
    return userData
  }

  const adminLogin = ({ email, password }) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem('bunkers_admin', 'true')
      return true
    }
    throw new Error('Invalid admin credentials')
  }

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem('bunkers_user')
    localStorage.removeItem('bunkers_admin')
  }

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('bunkers_user', JSON.stringify(updated))
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, register, login, adminLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
