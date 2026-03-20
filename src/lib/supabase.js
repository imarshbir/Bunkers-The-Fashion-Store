import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// SQL SCHEMA — Run this in Supabase SQL Editor FIRST
// ============================================================
/*

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  pincode TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  discount_percent INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_size TEXT,
  selected_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id, selected_size, selected_color)
);

-- FEEDBACK / REVIEWS TABLE
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WISHLIST TABLE
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- RLS (Row Level Security) - disable for simplicity, enable per-table in production
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;

-- SAMPLE PRODUCTS (optional seed data)
INSERT INTO products (name, description, price, original_price, discount_percent, stock, category, brand, sizes, colors, images, rating, reviews_count, is_featured) VALUES
('Classic White Oxford Shirt', 'Premium cotton Oxford shirt with a crisp collar and button-down details. Perfect for formal and casual occasions.', 1299, 1999, 35, 50, 'Men', 'Bunkers Essentials', ARRAY['S','M','L','XL','XXL'], ARRAY['White','Light Blue','Grey'], ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'], 4.3, 128, TRUE),
('Floral Wrap Dress', 'Elegant floral wrap dress with a flattering silhouette. Made from lightweight chiffon fabric.', 1899, 2799, 32, 30, 'Women', 'Bunkers Studio', ARRAY['XS','S','M','L','XL'], ARRAY['Blue Floral','Pink Floral','Green Floral'], ARRAY['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'], 4.5, 89, TRUE),
('Slim Fit Chinos', 'Versatile slim-fit chinos crafted from stretch cotton. Comfortable for all-day wear.', 999, 1499, 33, 75, 'Men', 'Bunkers Essentials', ARRAY['28','30','32','34','36'], ARRAY['Khaki','Navy','Olive','Black'], ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600'], 4.1, 203, FALSE),
('Oversized Hoodie', 'Ultra-soft oversized hoodie in premium fleece. The perfect cozy essential.', 1599, 2199, 27, 45, 'Unisex', 'Bunkers Street', ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Grey Melange','Navy','Cream'], ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600'], 4.7, 312, TRUE),
('Ethnic Kurta Set', 'Hand-embroidered cotton kurta with matching pants. Traditional craftsmanship meets modern design.', 2499, 3499, 29, 20, 'Men', 'Bunkers Heritage', ARRAY['S','M','L','XL'], ARRAY['Off White','Sky Blue','Rose Pink'], ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600'], 4.6, 67, TRUE),
('High Waist Jeans', 'Trendy high-waist jeans with a stretchy fabric blend. Flattering fit for every body type.', 1799, 2499, 28, 60, 'Women', 'Bunkers Denim', ARRAY['26','28','30','32','34'], ARRAY['Dark Blue','Light Blue','Black'], ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'], 4.4, 156, FALSE),
('Linen Blazer', 'Sophisticated linen blazer for warm weather. Pairs perfectly with trousers or denim.', 3299, 4499, 27, 25, 'Men', 'Bunkers Formal', ARRAY['S','M','L','XL'], ARRAY['Beige','Charcoal','Navy'], ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'], 4.2, 44, FALSE),
('Boho Maxi Skirt', 'Free-flowing boho maxi skirt with intricate print. Perfect for festivals and beach outings.', 1399, 1999, 30, 35, 'Women', 'Bunkers Studio', ARRAY['XS','S','M','L'], ARRAY['Terracotta','Indigo','Sage'], ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8b?w=600'], 4.3, 78, TRUE);

*/
