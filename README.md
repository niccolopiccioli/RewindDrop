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

## Deploy (Render)

L'app è full-stack Next.js (frontend + API nello stesso servizio). Il file `render.yaml` configura web service + Postgres.

```bash
# 1. Push su GitHub
git add .
git commit -m "Add e-shop with mock images and Render config"
git push origin main

# 2. Dashboard Render → New → Blueprint → collega il repo
# 3. Dopo il primo deploy, esegui il seed dal Render Shell:
npm run db:seed
```

Credenziali demo dopo il seed: `admin@eshop.local` / `admin123`

Per upload immagini persistenti in produzione, imposta `BLOB_READ_WRITE_TOKEN` (Vercel Blob).
