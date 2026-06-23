# RewindDrop — Streetwear E-Commerce

Full-stack demo storefront for streetwear and accessories. Animated product showcase, checkout flow, customer area, admin panel, and multi-color catalog with StockX/Unsplash image integration.

**Production:** [https://rewinddrop.vercel.app](https://rewinddrop.vercel.app)  
**Repository:** [github.com/niccolopiccioli/eshop-streetwear](https://github.com/niccolopiccioli/eshop-streetwear)

> Portfolio/demo project — no real transactions. See disclaimer in footer and `/privacy`.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Database (Prisma)](#database-prisma)
7. [REST API](#rest-api)
8. [Authentication](#authentication)
9. [Payments](#payments)
10. [Image Upload](#image-upload)
11. [CLI Scripts](#cli-scripts)
12. [Deploy (Vercel + Supabase)](#deploy-vercel--supabase)
13. [Testing & Quality](#testing--quality)
14. [Project Structure](#project-structure)

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.2.x |
| UI Runtime | [React](https://react.dev) | 19.2.x |
| Language | [TypeScript](https://www.typescriptlang.org) | 5.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| ORM | [Prisma](https://www.prisma.io) + `pg` driver adapter | 7.8.x |
| Database | PostgreSQL 16 | — |
| Auth | [NextAuth.js](https://authjs.dev) v5 (JWT) | beta |
| Client State | [Zustand](https://zustand.docs.pmnd.rs) | 5.x |
| Forms / Validation | React Hook Form + [Zod](https://zod.dev) | 4.x |
| Payments | Stripe (optional) + local mock | 22.x |
| Email | Nodemailer (SMTP / MailHog) | 7.x |
| File Storage | Local filesystem / [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | — |
| Tests | [Vitest](https://vitest.dev) | 3.x |
| Deploy | Vercel | — |
| DB Cloud | Supabase (PostgreSQL) | — |

**Fonts:** Space Grotesk (display) + Inter (body), loaded via `next/font` with limited subsets.

**Remote Images:** Unsplash, StockX CDN — optimized to AVIF/WebP via `next/image` and `optimizeImageUrl()`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (browser)                      │
│  React 19 · Zustand (cart) · dynamic import home sections    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js 16 App Router (Vercel)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ (store)/    │  │ admin/       │  │ api/ (Route Handlers)│ │
│  │ SSR + ISR   │  │ Server Comp. │  │ REST JSON            │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  middleware.ts → NextAuth (JWT) + admin/account guard          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma Client 7 (@prisma/adapter-pg)
┌──────────────────────────▼──────────────────────────────────┐
│                   PostgreSQL (Supabase / Docker)             │
└─────────────────────────────────────────────────────────────┘
```

### Key patterns

- **Server Components** for catalog pages, homepage, admin (server-side data fetching).
- **Client Components** for cart, checkout, interactive admin forms, scroll animations.
- **ISR** on homepage (`revalidate = 120`).
- **Dynamic import** for product marquee and newsletter (reduces initial JS).
- **Shared queries** in `src/lib/*-query.ts` (products, categories, banners).
- **Centralized validation** in `src/lib/validations/` (Zod).
- **Prisma serialization** in `src/lib/serialize.ts` (Decimal → number).

---

## Features

### Storefront (`src/app/(store)/`)

| Area | Details |
|------|---------|
| Homepage | Animated hero, ticker, featured drop, category rail, product marquee, editorial mosaic, manifesto, newsletter |
| Catalog | Filters by category, gender, size, sale; sorting, search |
| Product detail | Multi-color gallery, size/color variants, reviews, wishlist |
| Cart | Guest persistence (sessionId) + logged-in user, stock sync |
| Checkout | Shipping address, mock/Stripe payment methods, order confirmation |
| Account | Profile, addresses, orders, wishlist |
| Static pages | Shipping, returns, privacy (with demo section) |

### Admin (`src/app/admin/`)

| Area | Details |
|------|---------|
| Dashboard | Sales KPIs, revenue charts, top products, category performance |
| Products | CRUD, variants, multi-color images, duplication, bulk delete/visibility, SKU check |
| Categories | CRUD with image, alt text, object-fit, banner subtitle |
| Homepage | Category banner + editorial spot editor |
| Orders | List, detail, status updates |
| Inventory | Configurable low-stock threshold |
| Reviews | Approve/reject moderation |

### Demo catalog

The seed populates:

- **7 categories:** t-shirts, hoodies, pants, hats, bags, jackets, sneakers
- **~30 mock products** (Unsplash) + **21 StockX sneakers** (multi-angle CDN images)
- Demo admin and customer users
- Preconfigured homepage banners and editorial spots

---

## Local Setup

### Requirements

- **Node.js** 20+ (24.x recommended, matching Vercel)
- **Docker** (Postgres + MailHog)
- **npm**

### Quick start

```bash
# 1. Local services (Postgres + MailHog)
docker compose up -d

# 2. Environment variables
cp .env.example .env
# Set AUTH_SECRET: openssl rand -base64 32

# 3. Dependencies + DB + seed
npm install
npm run setup

# 4. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eshop.local` | `admin123` |
| Customer | `cliente@eshop.local` | `cliente123` |

### Local services

| Service | URL / command |
|---------|---------------|
| App | http://localhost:3000 |
| Prisma Studio | `npm run db:studio` |
| MailHog UI | http://localhost:8025 |
| Postgres | `localhost:5432` — user/pass/db: `eshop` |

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string. In production prefer `POSTGRES_PRISMA_URL` from Vercel+Supabase integration |
| `POSTGRES_PRISMA_URL` | ⚙️ | Supabase pooler URL (port 6543). Used by `prisma.config.ts` with priority |
| `POSTGRES_URL_NON_POOLING` | ⚙️ | Direct URL (port 5432) for `npm run db:migrate:deploy` |
| `AUTH_SECRET` | ✅ | NextAuth secret (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | ✅ prod | `true` on Vercel for proxy trust |
| `NEXT_PUBLIC_APP_URL` | ✅ prod | Public URL, e.g. `https://rewinddrop.vercel.app` |
| `PAYMENT_MODE` | — | `mock` (default) or `stripe` |
| `STRIPE_SECRET_KEY` | Stripe | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook secret for `/api/webhooks/stripe` |
| `BLOB_READ_WRITE_TOKEN` | prod upload | Vercel Blob token; without it, uploads go to `public/uploads/` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_FROM` | — | Transactional emails; defaults to console log |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Google OAuth (optional) |
| `LOW_STOCK_THRESHOLD` | — | Admin low-stock threshold (default 5) |

> **Note:** In local `.env`, leave `POSTGRES_*` variables empty — empty strings `""` are ignored by `getDatabaseUrl()` in favor of `DATABASE_URL`.

---

## Database (Prisma)

### Configuration

- **Schema:** `prisma/schema.prisma`
- **Config:** `prisma.config.ts` (Prisma 7 — URL from env, no longer in schema)
- **Generated Client:** `src/generated/prisma/` (gitignored, regenerated in `postinstall`)
- **Driver:** `@prisma/adapter-pg` with custom SSL pool for Supabase (`sslmode=no-verify`)

### Core models

| Model | Purpose |
|-------|---------|
| `User`, `Account`, `Session` | NextAuth auth + `CUSTOMER` / `ADMIN` roles |
| `Category` | Hierarchical categories with homepage banners |
| `Product`, `Variant`, `Image` | Multi-variant, multi-color catalog |
| `Cart`, `CartItem` | Guest (`sessionId`) or user cart |
| `Order`, `OrderItem` | Orders; nullable `productId`/`variantId` for post-delete history |
| `Address` | User addresses |
| `Review` | Moderated reviews |
| `Wishlist` | User wishlist |
| `NewsletterSubscriber` | Newsletter subscriptions |
| `HomeSpot` | Homepage editorial spots (lookbook, details) |

### Migrations

```
prisma/migrations/
├── 20260610081134_init/
├── 20260610120000_newsletter/
├── 20260619120000_category_image_alt/
├── 20260619140000_homepage_banners/
├── 20260619160000_image_object_fit/
├── 20260620120000_order_item_nullable_product/
└── 20260621120000_image_color_hex/
```

```bash
npm run db:migrate        # Dev: create + apply migration
npm run db:migrate:deploy # Production: apply only (uses direct URL)
npm run db:push           # Sync schema without migration (fast dev)
npm run db:generate       # Regenerate Prisma Client
npm run db:seed           # Populate demo catalog
```

---

## REST API

All routes in `src/app/api/` (Next.js Route Handlers).

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Product list (filters, pagination) |
| `GET` | `/api/products/[slug]` | Product detail |
| `GET` | `/api/products/[slug]/reviews` | Product reviews |
| `GET` | `/api/categories` | Category list |
| `GET` | `/api/cart` | Current cart |
| `POST` | `/api/cart` | Add / update item |
| `DELETE` | `/api/cart` | Clear cart |
| `POST` | `/api/cart/validate` | Validate stock availability |
| `POST` | `/api/checkout` | Create order |
| `POST` | `/api/checkout/confirm` | Confirm payment |
| `POST` | `/api/checkout/complete` | Complete offline order |
| `POST` | `/api/checkout/simulate-card` | Simulate card (dev only) |
| `GET` | `/api/payment-mode` | Active payment mode |
| `GET` | `/api/orders/[number]` | Order detail (guest with token) |
| `POST` | `/api/newsletter` | Newsletter signup |
| `POST` | `/api/auth/register` | User registration |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers |
| `POST` | `/api/webhooks/stripe` | Stripe webhook |

### Account (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/PATCH` | `/api/account/profile` | User profile |
| `GET/POST` | `/api/account/addresses` | Addresses |
| `PATCH/DELETE` | `/api/account/addresses/[id]` | Single address |
| `GET` | `/api/account/orders` | Order history |
| `GET` | `/api/account/orders/[id]` | Order detail |
| `GET/POST/DELETE` | `/api/wishlist` | Wishlist |

### Admin (`ADMIN` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/products` | List / create product |
| `GET/PATCH/DELETE` | `/api/admin/products/[id]` | Product CRUD |
| `POST` | `/api/admin/products/[id]/duplicate` | Duplicate product |
| `POST` | `/api/admin/products/bulk-delete` | Bulk delete |
| `POST` | `/api/admin/products/bulk-visibility` | Bulk show/hide |
| `GET` | `/api/admin/products/ids` | Product ID list (bulk selection) |
| `GET` | `/api/admin/products/check-sku` | SKU uniqueness check |
| `*` | `/api/admin/products/[id]/images/*` | Upload, delete, reorder images |
| `PATCH` | `/api/admin/products/[id]/variants/[variantId]/stock` | Update stock |
| `GET/POST` | `/api/admin/categories` | Categories |
| `PATCH/DELETE` | `/api/admin/categories/[id]` | Single category |
| `GET/PATCH` | `/api/admin/orders` | Orders |
| `PATCH` | `/api/admin/orders/[id]` | Update order status |
| `GET/PATCH` | `/api/admin/reviews` | Review moderation |
| `GET` | `/api/admin/inventory` | Inventory report |
| `GET/PATCH` | `/api/admin/homepage-banners` | Homepage banners |
| `PATCH` | `/api/admin/homepage-banners/category/[slug]` | Category banner |
| `PATCH` | `/api/admin/homepage-banners/spot/[key]` | Editorial spot |
| `POST` | `/api/admin/upload` | Generic file upload |

---

## Authentication

- **Provider:** Credentials (email/password bcrypt) + Google OAuth (optional)
- **Session:** JWT (strategy `jwt` in NextAuth v5)
- **Roles:** `CUSTOMER` | `ADMIN` — propagated in token and session
- **Middleware** (`src/middleware.ts`):
  - `/account/*` and `/api/account/*` → login required
  - `/admin/*` and `/api/admin/*` → login + `ADMIN` role
- **Registration:** `POST /api/auth/register` with bcrypt hash

---

## Payments

| Mode | Env | Behavior |
|------|-----|----------|
| **Mock** | `PAYMENT_MODE=mock` | Order confirmed without real charge |
| **Stripe** | `PAYMENT_MODE=stripe` + API keys | PaymentIntent, webhook, card/Klarna methods |
| **Dev simulation** | No Stripe keys in dev | Simulated card form in checkout |

Offline methods supported: cash on delivery, bank transfer (see `src/lib/payments/methods.ts`).

Local Stripe webhook:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Image Upload

| Environment | Storage | Path / Service |
|-------------|---------|----------------|
| Local | Filesystem | `public/uploads/` |
| Production | Vercel Blob | Public CDN via `BLOB_READ_WRITE_TOKEN` |

- Formats: JPEG, PNG, WebP — max **5 MB**
- Admin: upload on products, categories, homepage banners
- Demo catalog: Unsplash and StockX CDN images (no upload required)

---

## CLI Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Local production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit) |
| `npm run setup` | `prisma generate` + `migrate deploy` + seed |
| `npm run db:seed` | Re-seed full catalog |
| `npm run db:seed-admin` | Create/update admin user only |
| `npm run db:migrate` | Dev migration |
| `npm run db:migrate:deploy` | Production migration (direct URL) |
| `npm run db:import-stockx` | Import 21 StockX sneakers |
| `npm run db:refresh-images` | Refresh product image URLs |
| `npm run db:studio` | Prisma Studio GUI |

Additional scripts in `scripts/`:

| File | Purpose |
|------|---------|
| `migrate-deploy.mjs` | Migration wrapper with `POSTGRES_URL_NON_POOLING` |
| `import-stockx-products.ts` | StockX catalog import |
| `backfill-color-images.ts` | Associate images with variant colors |
| `update-homepage-banners.ts` | Update editorial banners |
| `export-seed-sql.ts` | Export seed as SQL |
| `clear-images.ts` | Clean orphan images |
| `seed-admin.ts` | Admin user seed |

---

## Deploy (Vercel + Supabase)

### Infrastructure

| Service | Detail |
|---------|--------|
| **Hosting** | Vercel — project `eshop-streetwear` |
| **Domain** | `rewinddrop.vercel.app` |
| **Database** | Supabase PostgreSQL (`eshop-streetwear`, region `eu-west-1`) |
| **Integration** | Vercel ↔ Supabase (env `POSTGRES_*` auto-injected) |
| **Build** | `npx prisma generate && npm run build` (`vercel.json`) |
| **Migrations** | **Not** in build — run `npm run db:migrate:deploy` separately |

### Vercel environment (production)

```
AUTH_SECRET=<random>
AUTH_TRUST_HOST=true
PAYMENT_MODE=mock
NEXT_PUBLIC_APP_URL=https://rewinddrop.vercel.app
POSTGRES_PRISMA_URL=<from Supabase integration>
POSTGRES_URL_NON_POOLING=<from Supabase integration>
```

Optional: `BLOB_READ_WRITE_TOKEN`, Stripe keys, SMTP, Google OAuth.

### Deployment workflow

```bash
# 1. Push to main → automatic Vercel deploy
git push origin main

# 2. Migrations on Supabase (after new migrations in repo)
npm run db:migrate:deploy   # with production .env or Supabase MCP

# 3. Seed (first install or reset only)
npm run db:seed
```

### Production notes

- Vercel filesystem is **ephemeral** — use Vercel Blob for persistent uploads.
- Supabase connection: SSL with `rejectUnauthorized: false` handled in `src/lib/prisma.ts`.
- Build does **not** run `prisma migrate deploy` to avoid pooler connection hangs.
- Homepage uses **ISR 120s** — catalog updates visible within 2 minutes without rebuild.

---

## Testing & Quality

```bash
npm run typecheck    # TypeScript strict
npm run lint         # ESLint (eslint-config-next)
npm run test         # Vitest — validations, SKU helpers
```

Current tests:
- `src/lib/validations/checkout.test.ts`
- `src/lib/sku.test.ts`

---

## Project Structure

```
eshop/
├── prisma/
│   ├── schema.prisma          # Data models
│   ├── seed.ts                # Demo catalog seed
│   └── migrations/            # Versioned SQL migrations
├── scripts/                   # CLI utilities (StockX import, migrate, etc.)
├── public/
│   └── uploads/               # Local uploads (gitignored except .gitkeep)
├── src/
│   ├── app/
│   │   ├── (store)/           # Storefront (layout with header/footer)
│   │   ├── admin/             # Admin panel
│   │   ├── api/               # REST Route Handlers
│   │   ├── login/             # Login/registration page
│   │   ├── layout.tsx         # Root layout + metadata
│   │   └── globals.css        # Tailwind + homepage animations
│   ├── components/
│   │   ├── admin/             # Admin UI (forms, tables, dashboard)
│   │   ├── home/              # Homepage sections
│   │   ├── layout/            # Header, footer, providers
│   │   ├── product/           # Card, color gallery
│   │   └── ui/                # Reusable UI primitives
│   ├── generated/prisma/      # Prisma Client (generated)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Business logic, queries, validations
│   │   ├── validations/       # Zod schemas
│   │   ├── payments/          # Stripe + mock
│   │   ├── stockx-products.ts # StockX sneaker catalog
│   │   └── homepage-banners.ts
│   ├── stores/
│   │   └── cart.ts            # Zustand cart store
│   └── middleware.ts          # Auth guard
├── docker-compose.yml         # Postgres + MailHog
├── prisma.config.ts           # Prisma 7 configuration
├── next.config.ts             # Image domains, optimizePackageImports
├── vercel.json                # Vercel build command
└── vitest.config.ts
```

---

## License

Demo project — portfolio/educational use. Images and trademarks in demo products are for illustrative purposes and do not imply affiliation with the depicted brands.
