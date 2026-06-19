# ESHOP — Streetwear e-commerce (locale)

Next.js 16 + Prisma + PostgreSQL. Storefront, checkout, area cliente e pannello admin.

## Requisiti

- Node.js 20+
- Docker (per Postgres e MailHog)

## Setup rapido

```bash
# 1. Avvia servizi locali
docker compose up -d

# 2. Configura ambiente
cp .env.example .env
# Modifica AUTH_SECRET: openssl rand -base64 32

# 3. Installa e inizializza DB
npm install
npm run setup

# 4. Avvia dev server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Credenziali demo

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | `admin@eshop.local` | `admin123` |
| Cliente | `cliente@eshop.local` | `cliente123` |

## Servizi locali

| Servizio | URL |
|----------|-----|
| App | http://localhost:3000 |
| Prisma Studio | `npm run db:studio` |
| MailHog UI | http://localhost:8025 |
| Postgres | `localhost:5432` (user/pass/db: `eshop`) |

## Pagamenti

Default: **mock** (`PAYMENT_MODE=mock`) — ordine confermato senza Stripe.

Per Stripe test:
```env
PAYMENT_MODE=stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Webhook locale: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Script utili

```bash
npm run dev          # Dev server
npm run build        # Build produzione
npm run db:seed      # Re-seed catalogo
npm run db:migrate   # Nuove migration
npm run db:studio    # GUI database
npm run test         # Test unitari
npm run typecheck    # TypeScript check
```

## Struttura

```
src/app/(store)/   # Storefront (header/footer)
src/app/admin/     # Pannello admin
src/app/api/       # API routes
prisma/            # Schema e seed
public/uploads/    # Upload prodotti (locale)
```

## Deploy (Vercel + Supabase)

### 1. GitHub
Repo: https://github.com/niccolopiccioli/eshop-streetwear

### 2. Vercel
Progetto: **eshop-streetwear** (collegato al repo GitHub)

Dopo aver collegato Supabase dalla dashboard Vercel, imposta queste variabili d'ambiente:

| Variabile | Valore |
|-----------|--------|
| `DATABASE_URL` | Connection string Supabase (pooler, porta 6543, `?pgbouncer=true`) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `PAYMENT_MODE` | `mock` |
| `NEXT_PUBLIC_APP_URL` | URL produzione Vercel |

Poi dalla **Shell Vercel** o in locale con `DATABASE_URL` di produzione:
```bash
npx prisma migrate deploy
npm run db:seed
```

Credenziali demo: `admin@eshop.local` / `admin123`

### Alternativa: Render
Vedi `render.yaml` per deploy con Postgres incluso.
