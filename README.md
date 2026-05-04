# Sa3ati — ساعتي | Luxury Watch E-Commerce

A full-stack luxury watch e-commerce platform built with the **MERN stack** (MongoDB, Express, React, Node.js).

![Black & Gold Luxury Theme](https://img.shields.io/badge/theme-black%20%26%20gold-D4AF37?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/stack-MERN-00d8ff?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

## ✨ Features

### Customer
- **Home** with hero, featured products, categories, testimonials
- **Shop** with filters (brand, price, gender, strap, featured), search, sort & pagination
- **Product Detail** with gallery, specifications, related items
- **Cart** with quantity management & persistent storage
- **Checkout** with shipping form & order placement
- **User Auth** (register/login with JWT + refresh tokens)
- **Profile** with order history

### Admin (Hidden Control Panel)
- **Dashboard** with KPIs (revenue, orders, products, avg order)
- **Products CRUD** — add, edit, delete, toggle featured, manage stock
- **Image Upload** via Supabase Storage
- **Orders Management** — view all, filter by status, update status
- **Best Sellers** analytics

### Security
- Role-based access control (RBAC)
- Admin panel on non-obvious route (`/control-panel`)
- JWT access + refresh tokens with httpOnly cookies
- Rate limiting on login & global endpoints
- Input sanitization & Zod validation
- Helmet security headers
- CORS configured

---

## 📁 Project Structure

```
sa3ati/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── lib/            # API client (axios)
│   │   ├── pages/          # Route pages
│   │   │   └── admin/      # Admin panel pages
│   │   └── store/          # Redux Toolkit store
│   │       └── slices/     # Auth, Cart, Product slices
│   └── index.html
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB, Supabase, logger, env
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, validation, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── seed.js         # Database seeder
│   │   └── index.js        # Server entry point
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Supabase** account (for image uploads)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
cp .env.example .env   # Edit .env with your values
npm install

# Install client dependencies
cd ../client
cp .env.example .env
npm install
```

### 2. Configure Environment Variables

**Server `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sa3ati
JWT_ACCESS_SECRET=your_strong_secret_here
JWT_REFRESH_SECRET=another_strong_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=product-images
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@sa3ati.com
ADMIN_PASSWORD=Admin@12345
```

**Client `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates:
- **Admin**: `admin@sa3ati.com` / `Admin@12345`
- **User**: `user@sa3ati.com` / `User@12345`
- **12 demo luxury watch products**

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:5173/control-panel

---

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

---

## 🔐 Creating Admin User Securely

**Option 1: Via seed script** (recommended for dev)
```bash
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then:
npm run seed
```

**Option 2: Via MongoDB shell** (production)
```javascript
// Generate hash first with: node -e "require('bcryptjs').hash('YourPass123',12).then(h=>console.log(h))"
db.users.insertOne({
  name: "Admin",
  email: "admin@yourdomain.com",
  passwordHash: "<paste_hash_here>",
  role: "admin",
  createdAt: new Date()
})
```

---

## 📡 API Documentation

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Public | Clear tokens |
| GET | `/api/auth/me` | Auth | Get current user |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | List products (filterable) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

**Query Params for GET /api/products:**
`page`, `limit`, `brand`, `minPrice`, `maxPrice`, `gender`, `strapMaterial`, `featured`, `sort`, `search`

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Auth | Create order |
| GET | `/api/orders/my` | Auth | Get user's orders |
| GET | `/api/orders` | Admin | Get all orders |
| GET | `/api/orders/stats` | Admin | Sales analytics |
| PUT | `/api/orders/:id/status` | Admin | Update order status |

### Upload
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload` | Admin | Upload images (multipart) |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
// Response 201:
{
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" },
  "accessToken": "eyJhbG..."
}
```

**Create Product (Admin):**
```json
POST /api/products
Authorization: Bearer <admin_token>
{
  "title": "Classic Gold Watch",
  "brand": "Sa3ati Heritage",
  "price": 3500,
  "description": "A stunning gold timepiece...",
  "specifications": { "caseSize": "42mm", "movement": "Automatic", "gender": "men" },
  "images": ["https://your-project.supabase.co/storage/v1/object/public/product-images/..."],
  "stock": 10,
  "featured": true,
  "tags": ["gold", "luxury"]
}
```

**Place Order:**
```json
POST /api/orders
Authorization: Bearer <token>
{
  "items": [{ "productId": "...", "title": "Classic Gold Watch", "price": 3500, "qty": 1, "image": "..." }],
  "subtotal": 3500,
  "shipping": 0,
  "total": 3500,
  "paymentMethod": "cod",
  "shippingAddress": { "fullName": "John", "phone": "+961...", "street": "...", "city": "Beirut", "country": "Lebanon" }
}
```

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Primary Black** | `#0B0B0B` |
| **Dark Background** | `#141414` |
| **Card Background** | `#1A1A1A` |
| **Gold** | `#D4AF37` |
| **Gold Light** | `#E8D48B` |
| **Text** | `#F5F5F5` |
| **Gray** | `#8A8A8A` |
| **Heading Font** | Playfair Display (serif) |
| **Body Font** | Inter (sans-serif) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Redux Toolkit, React Router, React Hook Form, Zod, Framer Motion |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, Zod, Helmet, CORS, Morgan |
| Database | MongoDB |
| Storage | Supabase Storage |
| State | Redux Toolkit (auth, cart, products) |

---

## 📄 License

MIT — built with ❤️ for the Sa3ati brand.
