# 🍪 Chip Happens — Artisan Cookie Bakery Web Application

A modern, responsive e-commerce web application for **Chip Happens** (Cookie Haven), migrated from Ionic Capacitor SQLite to **React 18 + Vite + Tailwind CSS + Lucide React + Supabase PostgreSQL**.

---

## 🌟 Overview & Brand Identity

**Chip Happens** is a whimsical, handcrafted artisan cookie bakery web application featuring:
- **Handcrafted Sketch & Bakery Aesthetic:** Warm chocolate and caramel color palette (`#3d2817`, `#d2691e`, `#8b4513`, `#fff9f0`), playful dashed doodle borders, corner tabs, and expressive hand-drawn typography (`Patrick Hand`, `Permanent Marker`, `Comic Neue`).
- **Interactive Animations:** Lively floating cookies with rotation effects, top marquee announcement ticker, and responsive micro-interactions.
- **Full E-Commerce Workflow:** 24 handcrafted cookie catalog, dynamic box size pricing (Small, Regular, Large), cart management with promo codes (`COOKIE20`), checkout with address validation, order receipts with print support, and order history tracking.
- **Authenticated Cloud Data:** Uses **Supabase Auth**, PostgreSQL, and Row Level Security for customer profiles, carts, and favorites. Guest cart and wishlist writes are intentionally blocked.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite 5 |
| **Routing** | React Router v6 (`react-router-dom`) |
| **Styling** | Tailwind CSS v3 + Custom Sketch Utilities |
| **Icons** | Lucide React |
| **Backend & Database** | Supabase (PostgreSQL, Supabase Auth, Row Level Security) |
| **Payments** | Stripe Integration (with Cash on Delivery fallback) |
| **Typography** | Google Fonts (*Permanent Marker*, *Patrick Hand*, *Comic Neue*, *Inter*) |

---

## 🚀 Quick Start & How To Run

### 1. Prerequisites
- **Node.js** v18 or higher (v20+ recommended)
- **npm** v9 or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The production bundle will be created in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🔐 Environment Variables Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Stripe Payment Backend (Optional)
VITE_STRIPE_SERVER_URL=https://server-2wvvle27c-qpgdbraganza-4961s-projects.vercel.app/
```

> **Required:** Replace both Supabase placeholders before running the app. There is no guest/local fallback for authentication, carts, or favorites.

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

### Migration File Location:
The full SQL migration script is located at:
```
supabase/migrations/20240101000000_initial_schema.sql
```

### How to Apply Migrations in Supabase:
1. Log in to your [Supabase Dashboard](https://app.supabase.com) and create or open your project.
2. In the left navigation, click on **SQL Editor**.
3. Click **New Query**.
4. Copy and paste the entire contents of `supabase/migrations/20240101000000_initial_schema.sql` and run it.
5. Then run `supabase/migrations/20261011000000_require_authentication.sql` to enforce authenticated-only customer data access.

### What this migration sets up:
- **`public.profiles`**: Synchronized with `auth.users` via database trigger `handle_new_user()`.
- **`public.products`**: Pre-seeded with all 24 signature handcrafted cookies, prices, allergens, and nutrition facts.
- **`public.cart_items`**: User-specific shopping cart rows with box size options (`small`, `regular`, `large`).
- **`public.favorites`**: User-specific bookmark / wishlist storage.
- **`public.orders` & `public.order_items`**: Full order history, status tracking (`pending`, `processing`, `shipped`, `delivered`, `cancelled`), and line-item breakdown.
- **Row Level Security (RLS)**: Enforces strict data access rules:
  - Users can only read and modify their own carts, wishlists, profiles, and orders.
  - Cookie catalog is publicly readable by all visitors.

---

## 📁 Project Structure

```
chip-happens/
├── public/
│   ├── favicon.png
│   ├── manifest.json
│   └── images/
│       ├── cookies/          # 24 signature cookie SVG illustrations
│       ├── developers/       # Developer team photos
│       └── logo/             # Brand logos
├── src/
│   ├── components/
│   │   ├── CookieCard.tsx    # Reusable card with corner marks & interactions
│   │   ├── Footer.tsx        # Brand footer with quick links & social icons
│   │   ├── Navbar.tsx        # Responsive navigation with marquee banner & badges
│   │   └── NotificationToast.tsx # Action feedback toasts
│   ├── context/
│   │   ├── AuthContext.tsx   # Supabase Auth session & profile management
│   │   └── CartContext.tsx   # Shopping cart & wishlist sync
│   ├── data/
│   │   └── products.ts       # Cookie definitions, box pricing, nutrition facts
│   ├── lib/
│   │   └── supabase.ts       # Official Supabase JS client configuration
│   ├── pages/
│   │   ├── Home.tsx          # Hero banner, floating cookies, specials, reviews
│   │   ├── Products.tsx      # Filterable & searchable cookie catalog
│   │   ├── ProductDetails.tsx# Box size selector, ingredients, allergens, nutrition
│   │   ├── Cart.tsx          # Basket list, promo code COOKIE20, shipping tracker
│   │   ├── Checkout.tsx      # Address form validation & payment selection
│   │   ├── Payment.tsx       # Direct payment card simulation gateway
│   │   ├── OrderConfirmation.tsx # Success celebration & printable receipt invoice
│   │   ├── Orders.tsx        # Customer order tracking & receipt viewer
│   │   ├── Favorites.tsx     # Wishlist grid with instant Add-to-Cart
│   │   ├── Login.tsx         # User authentication with show/hide password
│   │   ├── Signup.tsx        # New account registration
│   │   ├── Profile.tsx       # Customer details editor & metrics
│   │   ├── OurStory.tsx      # Brand narrative & craftsmanship values
│   │   └── Developers.tsx    # Meet the development team cards & socials
│   ├── services/
│   │   └── supabaseService.ts# Supabase database operations (CRUD)
│   ├── App.tsx               # Main routing & scroll behavior
│   ├── index.css             # Tailwind directives & sketch style design tokens
│   └── main.tsx              # Application entrypoint
├── supabase/
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🎯 Key Application Features & Workflows

1. **Top Announcement Marquee:** Continuous banner advertising promotions and free shipping perks.
2. **24 Handcrafted Cookie Flavors:**
   - Classic (`Chocolate Chip`, `Sugar Cookie`, `Snickerdoodle`, `Butter Cookie`, etc.)
   - Chocolate Lovers (`Double Chocolate`, `Triple Chocolate`, `Brookies`, etc.)
   - Nutty Delights (`Peanut Butter`, `Macadamia`, `Almond`, `Pecan`, etc.)
   - Specialty (`Red Velvet`, `Lemon Glaze`, `Salted Caramel`, etc.)
3. **Dynamic Box Sizing:** Select between Small Box (3 pcs), Regular Box (6 pcs), or Large Box (12 pcs) with real-time price updates.
4. **Promo Discounts:** Apply promo code `COOKIE20` in the cart for an immediate 20% order discount.
5. **Free Delivery Threshold:** Orders over ₱500 automatically receive free nationwide delivery.
6. **Printable Invoice Receipts:** Order confirmation includes a clean `window.print()` formatted sales receipt.
7. **Developer Credits:** Meet the creators (Justine, Paul, Cipriano, Arfred, Denzel) on the `/developers` page.

---

## 🚢 Deployment

### Deploy to Vercel:
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Framework Preset to **Vite**.
4. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Click **Deploy**.

---

## 📄 License
This project was developed for the Chip Happens artisan cookie bakery. All rights reserved.
#   C y b e r - T h r e a t - W e b s i t e  
 
