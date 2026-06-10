# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Full-stack web app for "Rupali's Homemade Delights", a home food business in Singapore: daily menus, special pre-orders, online ordering with WhatsApp checkout, and a JWT-protected admin panel. React 18 + Vite + Tailwind client; Express + Mongoose API; MongoDB.

## Commands

Run from the repo root unless noted. The root `package.json` orchestrates both apps via `concurrently`.

```bash
npm run install:all   # install root + server + client deps
npm run dev           # run API and client together (the usual dev command)
npm run server        # API only  (node --watch, hot-reloads on save)
npm run client        # Vite client only
npm run seed          # seed weekly menu, specials, and the admin account
npm run dev:memdb --prefix server   # run the API against a throwaway in-memory MongoDB (no local mongod needed; reseeds + resets every boot)
```

Production build: `npm run build --prefix client` (→ `client/dist`), then `npm start --prefix server`.

- **There is no test suite or linter configured** — do not invent `npm test`/`npm run lint`. (The README mentions tests; they don't exist.) Verify changes by running the app.
- The server is ESM (`"type": "module"`) — use `import`, and include the `.js` extension in relative imports.

## Ports (note the discrepancy)

The API listens on **`PORT` from `server/.env`, which is `5050`**, and the Vite dev server (`:5173`) proxies `/api/*` to `localhost:5050` (see `client/vite.config.js`). The README's mention of port 5000 is stale — trust the `.env`/proxy. If you change the API port, update the Vite proxy target to match.

## Repository Structure

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

## Architecture

**Config is single-sourced and duplicated on the client — keep them in sync.** `server/src/config/business.js` is the authoritative source for business details, `PRICING`, and `TIMINGS`. It's served at `GET /api/config` and consumed by `client/src/context/ConfigContext.jsx` via `useConfig()`. That context also hard-codes a `FALLBACK` copy of the same values (so the UI renders before the API responds) — **when you change `business.js`, update the `FALLBACK` to match** or the offline/initial render will drift.

**Menu resolution: daily override beats weekly default.** Two models back the menu — `WeeklyMenu` (recurring per `day` + `mealType`) and `DailyMenu` (an override for a specific `YYYY-MM-DD` + `mealType`). `resolveMenuForDate()` in `server/src/routes/menu.js` picks the daily override if present, else the weekly entry, for both Lunch and Dinner. All "today"/date logic uses **Asia/Singapore** time via `server/src/utils/date.js` (`sgToday`, `sgDayName`) — never use raw `new Date()` for menu/order dates.

**Pricing is computed server-side and is authoritative.** `computeTotal()` in `server/src/utils/pricing.js` applies the combo deal for `mealType === 'Special Order'`: every `comboSize` (2) special units bill at `comboPrice` ($25), the remainder at `specialItem` ($15) each; regular meals are flat `unitPrice * quantity`. `POST /api/orders` recomputes `total` from items server-side — do not trust a client-sent total.

**Auth: JWT, admin-only.** `POST /api/auth/login` returns a JWT. `requireAuth` (`server/src/middleware/auth.js`) guards all admin routes (`PUT/DELETE` menu, specials writes, order list/summary/status). On the client, `api.js` stores the token in `localStorage` under `rupali_admin_token` and attaches `Authorization: Bearer` only when a call passes `auth = true` — pass `true` for any admin endpoint.

**Order lifecycle.** Public `POST /api/orders` saves an order as `Pending`; the Order/OrderConfirm pages build a `wa.me` deep link (number from config) prefilled with the order so it's finalized over WhatsApp. Admins move status `Pending → Confirmed → Delivered` (or `Cancelled`) via `PATCH /api/orders/:id/status`. Cancelled orders are excluded from revenue in `/api/orders/summary`.

**Client data layer.** All HTTP goes through the thin `api` wrapper in `client/src/api.js` (`get/post/put/patch/del`, each taking an `auth` flag). The Vite proxy means requests use relative `/api/...` paths and need no CORS config in dev.

## Conventions

- Express routes return JSON errors via the centralized error handler in `server/src/index.js`; route handlers can throw and it responds 500 JSON. Validation failures return explicit 4xx with a `{ message }` body.
- Meal types are the literals `'Lunch'`, `'Dinner'`, `'Special Order'`; order statuses are `'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled'` — these strings are validated in routes, so reuse them exactly.
