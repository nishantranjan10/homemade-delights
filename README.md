# 🍛 Rupali's Homemade Delights

A full-stack web app for a home food business in Singapore — fresh home-cooked
Indian meals with daily menus, special pre-orders, online ordering, WhatsApp
checkout, and a JWT-protected admin panel.

**Tagline:** Home-cooked | Fresh ingredients | Made with love

---

## 🧱 Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS      |
| Backend  | Node.js + Express                   |
| Database | MongoDB + Mongoose                  |
| Auth     | JWT (admin only)                    |

Warm Indian theme: **saffron orange · deep forest green · cream/ivory**, with a
serif display font (Playfair Display) for headings and Poppins for body text.

---

## 📂 Project Structure

```
homemade-delights/
├── package.json          # root scripts (concurrently runs both apps)
├── server/               # Express + Mongoose API
│   ├── src/
│   │   ├── index.js      # app entry
│   │   ├── seed.js       # seeds weekly menu, specials, admin
│   │   ├── config/       # db connection + business constants
│   │   ├── models/       # Admin, WeeklyMenu, DailyMenu, SpecialItem, Order
│   │   ├── middleware/   # JWT auth guard
│   │   ├── routes/       # auth, menu, specials, orders, config
│   │   └── utils/        # date (SG timezone) + pricing (combo logic)
│   └── .env.example
└── client/               # React + Vite frontend
    └── src/
        ├── pages/        # Home, Menu, Specials, Order, OrderConfirm
        │   └── admin/    # Login, Dashboard, ManageMenu, ManageOrders
        ├── components/   # Navbar, Footer, MealCard, WhatsAppButton, ...
        ├── context/      # ConfigContext, AuthContext
        └── api.js        # fetch wrapper with JWT
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) — or a MongoDB
  Atlas connection string.

### 1. Install dependencies
```bash
npm run install:all
```
(installs root, server, and client packages)

### 2. Configure the backend
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and set at minimum a strong `JWT_SECRET` and your `MONGO_URI`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rupalis_delights
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Seed the database
Loads the full weekly menu (Mon–Sun, lunch + dinner), the special items, and
creates the admin account.
```bash
npm run seed
```

### 4. Run in development
```bash
npm run dev          # runs API (:5000) and client (:5173) together
```
Or run them separately:
```bash
npm run server       # API only
npm run client       # frontend only
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the
Express server, so no CORS config is needed in development.

---

## 🔐 Admin Panel

Visit **/admin** and log in with the credentials from your `.env`
(default `admin` / `admin123` — **change these in production**).

| Page                | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `/admin/dashboard`  | Today's order count, revenue summary, status breakdown |
| `/admin/menu`       | Weekly recurring menu, daily overrides, specials CRUD  |
| `/admin/orders`     | Filter orders (date/meal/status) & update status       |

Order status flow: **Pending → Confirmed → Delivered** (or Cancelled).

---

## 🍽️ Menu Model

- **WeeklyMenu** — recurring default for each `day` + `mealType` (Lunch/Dinner).
- **DailyMenu** — an override for a specific calendar date; when present it
  takes precedence over the weekly default for that date.
- Today's menu (`/` and `/api/menu/today`) resolves overrides first, then falls
  back to the weekly default. Dates are handled in **Asia/Singapore** time.

---

## 💰 Pricing

| Item                          | Price |
| ----------------------------- | ----- |
| Regular Meal (Lunch/Dinner)   | $12   |
| Special Order (pre-order)     | $15   |
| Combo: any 2 specials         | $25   |

Combo pricing is applied automatically server-side: every 2 special units are
billed at $25, any remainder at $15 each (verified by tests).

---

## 📡 API Reference

### Public
| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| GET    | `/api/config`                  | Business details, pricing, timings|
| GET    | `/api/menu/today`              | Today's lunch + dinner            |
| GET    | `/api/menu/date?date=YYYY-MM-DD` | Resolved menu for a date        |
| GET    | `/api/menu/weekly`             | Full weekly menu (7 days)         |
| GET    | `/api/specials`                | Available special items           |
| POST   | `/api/orders`                  | Place an order                    |
| POST   | `/api/auth/login`              | Admin login → JWT                 |

### Admin (require `Authorization: Bearer <token>`)
| Method | Endpoint                       | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| GET    | `/api/orders`                  | List orders (filters: date, mealType, status) |
| GET    | `/api/orders/summary`          | Dashboard stats                   |
| PATCH  | `/api/orders/:id/status`       | Update order status               |
| PUT    | `/api/menu/weekly`             | Upsert a weekly menu entry        |
| PUT    | `/api/menu/daily`              | Post/override a date's menu        |
| DELETE | `/api/menu/daily`              | Remove a daily override           |
| POST   | `/api/specials`                | Add a special item                |
| PUT    | `/api/specials/:id`            | Edit / toggle availability        |
| DELETE | `/api/specials/:id`            | Delete a special item             |

---

## 💬 WhatsApp Ordering

Order and confirmation pages generate a `wa.me` deep link to **+65 8313 6991**
pre-filled with the customer's full order (items, date, fulfilment, payment,
contact). Online orders are saved as **Pending** and finalized over WhatsApp.

---

## 🏗️ Production Build

```bash
npm run build --prefix client   # outputs client/dist
npm start --prefix server       # serves the API
```
Serve `client/dist` from any static host (Netlify, Vercel, Nginx) and point it
at the API base URL, or have Express serve the static build.

---

## 📍 Business Details

- **Address:** 83 Pasir Ris Grove, NV Residences #13-06, 518211
- **WhatsApp:** +65 8313 6991
- **Payment:** PayNow / PayLah / Cash
- **Fulfilment:** Delivery (charges apply) or Self-Pickup

**Order timings**
- Lunch — pickup/delivery 1:00–2:00 PM · confirm by previous night or before 9 AM
- Dinner — pickup/delivery 6:30–7:30 PM · confirm by 4:00 PM same day
