# 🛍️ BUNKERS — Fashion & Clothing Platform

A full-featured Amazon-like e-commerce platform for clothing built with React + Vite + Supabase.

---

## ⚡ Quick Start (5 Steps)

### Step 1 — Install Dependencies
```bash
cd bunkers
npm install
```

### Step 2 — Setup Supabase Database
1. Go to **https://supabase.com** → Open your project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase_schema.sql`
5. Paste into the editor and click **Run**
6. You should see "Setup complete! Tables created."

### Step 3 — Get Your Supabase Anon Key
1. In Supabase → **Project Settings** → **API**
2. Copy the **`anon` / `public`** key (starts with `eyJ...`)
3. Open `src/lib/supabase.js`
4. Replace `'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder'` with your actual anon key

### Step 4 — Start the Dev Server
```bash
npm run dev
```

### Step 5 — Open in Browser
```
http://localhost:5173
```

---

## 🔐 Login Credentials

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@bunkers.com  | Admin*123  |

- **Admin Panel:** http://localhost:5173/admin
- Users can register at http://localhost:5173/register

---

## 📁 Project Structure

```
bunkers/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation with search, cart, profile
│   │   ├── CartSidebar.jsx     # Slide-in cart drawer
│   │   ├── ProductCard.jsx     # Product listing card
│   │   ├── Footer.jsx          # Site footer
│   │   └── AdminSidebar.jsx    # Admin navigation panel
│   │
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with product grid
│   │   ├── Login.jsx           # User login (email or mobile)
│   │   ├── Register.jsx        # User registration
│   │   ├── ProductDetail.jsx   # Single product view + reviews
│   │   ├── Profile.jsx         # User profile, orders, cart, wishlist
│   │   ├── Checkout.jsx        # Checkout + order placement
│   │   └── admin/
│   │       ├── AdminLogin.jsx      # Admin auth
│   │       ├── AdminDashboard.jsx  # Stats overview
│   │       ├── ManageProducts.jsx  # CRUD products
│   │       └── ManageOrders.jsx    # View/update orders
│   │
│   ├── context/
│   │   ├── AuthContext.jsx     # User & admin authentication
│   │   └── CartContext.jsx     # Shopping cart state
│   │
│   ├── lib/
│   │   └── supabase.js         # Supabase client + SQL schema comments
│   │
│   ├── App.jsx                 # Routes and providers
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
│
├── supabase_schema.sql         # ← RUN THIS IN SUPABASE FIRST
├── package.json
├── vite.config.js
└── index.html
```

---

## 🗄️ Database Schema

| Table        | Description                          |
|--------------|--------------------------------------|
| `customers`  | Registered users with hashed passwords |
| `products`   | Product catalog with images, sizes, colors |
| `orders`     | Customer orders with full item details |
| `cart_items` | Shopping cart per user |
| `feedback`   | Product reviews and ratings |
| `wishlist`   | Saved products per user |

---

## ✨ Features

### Customer Side
- 🏠 **Home Page** — Hero banner + featured products + full catalog
- 🔍 **Search** — Real-time search by name, brand, category
- 📂 **Category Filter** — Men, Women, Kids, Ethnic, etc.
- 📦 **Product Detail** — Image gallery, size/color selector, reviews
- 🛒 **Cart** — Slide-in drawer, quantity controls
- ❤️ **Wishlist** — Save products for later
- 👤 **Profile** — Orders, cart, wishlist, edit profile
- 📋 **Checkout** — Address form, payment method, order confirmation
- 📱 **Login** — By email **or** mobile number

### Admin Side
- 📊 **Dashboard** — Sales stats, order counts, revenue
- ➕ **Add Products** — Name, description, price, stock, images (URLs), sizes, colors
- ✏️ **Edit Products** — Update any field including images
- 🗑️ **Delete Products** — With confirmation dialog
- 📦 **Orders Panel** — See customer name, mobile, address, products, quantity
- 🔄 **Update Order Status** — pending → confirmed → shipped → delivered

### Security
- Passwords hashed with **bcrypt** (cost factor 12)
- Admin credentials never stored in database
- Protected routes redirect unauthenticated users
- Stock cannot go below zero

---

## 🔧 Customization

### Change Admin Password
Edit `src/context/AuthContext.jsx`:
```js
const ADMIN_EMAIL = 'admin@bunkers.com'
const ADMIN_PASSWORD = 'Admin*123'  // ← Change this
```

### Add Product Images
In Admin → Manage Products → Add/Edit Product, paste image URLs (one per line).
Use any CDN — Unsplash, Cloudinary, ImgBB, etc.

### Build for Production
```bash
npm run build
```
Then deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

---

## ⚠️ Important Notes

1. **Run `supabase_schema.sql` first** — The app won't work without the database tables
2. **Update the anon key** in `src/lib/supabase.js` before running
3. For production, enable **Row Level Security (RLS)** in Supabase
4. The `decrement_stock` function must be created (it's in the SQL file)
5. Online payments (UPI/Card) are UI-only; integrate a payment gateway for production

---

Built with ❤️ using React, Vite, Supabase, and react-hot-toast
