-- =====================================================
-- BUNKERS FASHION PLATFORM - SUPABASE SQL SCHEMA
-- Run this ENTIRE file in Supabase > SQL Editor
-- =====================================================

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  mobile       TEXT UNIQUE NOT NULL,
  address      TEXT NOT NULL,
  city         TEXT,
  state        TEXT,
  pincode      TEXT,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL,
  original_price   NUMERIC(10,2),
  discount_percent INTEGER DEFAULT 0,
  stock            INTEGER NOT NULL DEFAULT 0,
  category         TEXT NOT NULL,
  subcategory      TEXT,
  brand            TEXT,
  sizes            TEXT[] DEFAULT '{}',
  colors           TEXT[] DEFAULT '{}',
  images           TEXT[] DEFAULT '{}',
  rating           NUMERIC(3,2) DEFAULT 0,
  reviews_count    INTEGER DEFAULT 0,
  is_featured      BOOLEAN DEFAULT FALSE,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_mobile  TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items            JSONB NOT NULL,
  total_amount     NUMERIC(10,2) NOT NULL,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('placed','shipped','delivered','cancelled')),
  payment_method   TEXT DEFAULT 'cod',
  payment_status   TEXT DEFAULT 'pending',
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity       INTEGER NOT NULL DEFAULT 1,
  selected_size  TEXT,
  selected_color TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id, selected_size, selected_color)
);

-- =====================================================
-- FEEDBACK / REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  product_id        UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name     TEXT NOT NULL,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text       TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WISHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- =====================================================
-- DISABLE RLS (for development - enable in production)
-- =====================================================
ALTER TABLE customers   DISABLE ROW LEVEL SECURITY;
ALTER TABLE products    DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders      DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items  DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback    DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist    DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Decrement stock on order
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty),
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA - Sample Products
-- =====================================================
INSERT INTO products (name, description, price, original_price, discount_percent, stock, category, brand, sizes, colors, images, rating, reviews_count, is_featured)
VALUES
(
  'Classic White Oxford Shirt',
  'Premium 100% cotton Oxford shirt with a crisp button-down collar. Perfect for formal meetings and casual Fridays alike. Features a tailored fit that flatters all body types.',
  1299, 1999, 35, 50, 'Men', 'Bunkers Essentials',
  ARRAY['S','M','L','XL','XXL'],
  ARRAY['White','Light Blue','Grey'],
  ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80'],
  4.3, 128, TRUE
),
(
  'Floral Wrap Dress',
  'Elegant floral wrap dress crafted from lightweight chiffon. The adjustable wrap closure ensures a perfect fit while the floral pattern adds a feminine touch.',
  1899, 2799, 32, 30, 'Women', 'Bunkers Studio',
  ARRAY['XS','S','M','L','XL'],
  ARRAY['Blue Floral','Pink Floral','Green Floral'],
  ARRAY['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80'],
  4.5, 89, TRUE
),
(
  'Slim Fit Stretch Chinos',
  'Versatile slim-fit chinos crafted from a cotton-spandex blend for maximum comfort. A wardrobe staple that transitions effortlessly from office to weekend.',
  999, 1499, 33, 75, 'Men', 'Bunkers Essentials',
  ARRAY['28','30','32','34','36'],
  ARRAY['Khaki','Navy','Olive','Black'],
  ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80'],
  4.1, 203, FALSE
),
(
  'Oversized Premium Hoodie',
  'Ultra-soft fleece hoodie with an oversized silhouette. Made from 300GSM brushed fleece for ultimate warmth and coziness. Features a kangaroo pocket and adjustable drawstring hood.',
  1599, 2199, 27, 45, 'Unisex', 'Bunkers Street',
  ARRAY['S','M','L','XL','XXL'],
  ARRAY['Black','Grey Melange','Navy','Cream'],
  ARRAY['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'],
  4.7, 312, TRUE
),
(
  'Hand-Embroidered Kurta Set',
  'Exquisite hand-embroidered kurta with matching palazzo pants. Crafted from breathable cotton with intricate zari embroidery on the yoke and sleeves.',
  2499, 3499, 29, 20, 'Men', 'Bunkers Heritage',
  ARRAY['S','M','L','XL'],
  ARRAY['Off White','Sky Blue','Rose Pink'],
  ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80'],
  4.6, 67, TRUE
),
(
  'High Waist Skinny Jeans',
  'Trendy high-waist skinny jeans in a stretchy denim blend. Flattering fit that elongates the silhouette. Features a classic 5-pocket design with a zip fly closure.',
  1799, 2499, 28, 60, 'Women', 'Bunkers Denim',
  ARRAY['26','28','30','32','34'],
  ARRAY['Dark Blue','Light Blue','Black'],
  ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
  4.4, 156, FALSE
),
(
  'Lightweight Linen Blazer',
  'Sophisticated single-breasted linen blazer perfect for warm weather dressing. Unlined construction ensures breathability. Features notched lapels and two flap pockets.',
  3299, 4499, 27, 25, 'Men', 'Bunkers Formal',
  ARRAY['S','M','L','XL'],
  ARRAY['Beige','Charcoal','Navy'],
  ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'],
  4.2, 44, FALSE
),
(
  'Boho Printed Maxi Skirt',
  'Free-flowing maxi skirt with an allover boho print. Made from flowy georgette fabric that moves beautifully. Features an elastic waistband for easy wear.',
  1399, 1999, 30, 35, 'Women', 'Bunkers Studio',
  ARRAY['XS','S','M','L'],
  ARRAY['Terracotta','Indigo','Sage Green'],
  ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8b?w=600&q=80'],
  4.3, 78, TRUE
);

-- =====================================================
-- VERIFY SETUP
-- =====================================================
SELECT 'Setup complete! Tables created.' AS message;
SELECT COUNT(*) AS product_count FROM products;
