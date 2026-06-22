# RewindDrop — E-commerce Streetwear

Sito dimostrativo full-stack per streetwear e accessori. Storefront animata, checkout, area cliente, pannello admin e catalogo multi-colore con integrazione immagini StockX/Unsplash.

**Produzione:** [https://rewinddrop.vercel.app](https://rewinddrop.vercel.app)  
**Repository:** [github.com/niccolopiccioli/eshop-streetwear](https://github.com/niccolopiccioli/eshop-streetwear)

> Progetto portfolio/demo: nessuna vendita reale. Vedi disclaimer in footer e `/privacy`.

---

## Indice

1. [Stack tecnologico](#stack-tecnologico)
2. [Architettura](#architettura)
3. [Funzionalità](#funzionalità)
4. [Setup locale](#setup-locale)
5. [Variabili d'ambiente](#variabili-dambiente)
6. [Database (Prisma)](#database-prisma)
7. [API REST](#api-rest)
8. [Autenticazione](#autenticazione)
9. [Pagamenti](#pagamenti)
10. [Upload immagini](#upload-immagini)
11. [Script CLI](#script-cli)
12. [Deploy (Vercel + Supabase)](#deploy-vercel--supabase)
13. [Testing e qualità](#testing-e-qualità)
14. [Struttura del progetto](#struttura-del-progetto)

---

## Stack tecnologico

| Layer | Tecnologia | Versione |
|-------|------------|----------|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.2.x |
| Runtime UI | [React](https://react.dev) | 19.2.x |
| Linguaggio | [TypeScript](https://www.typescriptlang.org) | 5.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| ORM | [Prisma](https://www.prisma.io) + driver adapter `pg` | 7.8.x |
| Database | PostgreSQL 16 | — |
| Auth | [NextAuth.js](https://authjs.dev) v5 (JWT) | beta |
| State client | [Zustand](https://zustand.docs.pmnd.rs) | 5.x |
| Form / validazione | React Hook Form + [Zod](https://zod.dev) | 4.x |
| Pagamenti | Stripe (opzionale) + mock locale | 22.x |
| Email | Nodemailer (SMTP / MailHog) | 7.x |
| Storage file | Filesystem locale / [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | — |
| Test | [Vitest](https://vitest.dev) | 3.x |
| Deploy | Vercel | — |
| DB cloud | Supabase (PostgreSQL) | — |

**Font:** Space Grotesk (display) + Inter (body), caricati via `next/font` con subset limitati.

**Immagini remote:** Unsplash, StockX CDN — ottimizzate in AVIF/WebP tramite `next/image` e helper `optimizeImageUrl()`.

---

## Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (browser)                      │
│  React 19 · Zustand (carrello) · dynamic import sezioni home │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js 16 App Router (Vercel)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ (store)/    │  │ admin/       │  │ api/ (Route Handlers)│ │
│  │ SSR + ISR   │  │ Server Comp. │  │ REST JSON            │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  middleware.ts → NextAuth (JWT) + guard admin/account          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma Client 7 (@prisma/adapter-pg)
┌──────────────────────────▼──────────────────────────────────┐
│                   PostgreSQL (Supabase / Docker)             │
└─────────────────────────────────────────────────────────────┘
```

### Pattern principali

- **Server Components** per pagine catalogo, homepage, admin (fetch dati lato server).
- **Client Components** per carrello, checkout, form admin interattivi, animazioni scroll.
- **ISR** sulla homepage (`revalidate = 120`).
- **Dynamic import** per marquee prodotti e newsletter (riduce JS iniziale).
- **Query condivise** in `src/lib/*-query.ts` (prodotti, categorie, banner).
- **Validazione** centralizzata in `src/lib/validations/` (Zod).
- **Serializzazione** Prisma → JSON in `src/lib/serialize.ts` (Decimal → number).

---

## Funzionalità

### Storefront (`src/app/(store)/`)

| Area | Dettaglio |
|------|-----------|
| Homepage | Hero animato, ticker, featured drop, category rail, marquee prodotti, mosaic editoriale, manifesto, newsletter |
| Catalogo | Filtri per categoria, genere, taglia, sale, ordinamento, ricerca |
| Scheda prodotto | Galleria multi-colore, varianti taglia/colore, recensioni, wishlist |
| Carrello | Persistenza guest (sessionId) + utente loggato, sync disponibilità |
| Checkout | Indirizzo spedizione, metodi pagamento mock/Stripe, conferma ordine |
| Account | Profilo, indirizzi, ordini, wishlist |
| Pagine statiche | Spedizioni, resi, privacy (con sezione demo) |

### Admin (`src/app/admin/`)

| Area | Dettaglio |
|------|-----------|
| Dashboard | KPI vendite, grafici revenue, top prodotti, performance categorie |
| Prodotti | CRUD, varianti, immagini multi-colore, duplicazione, bulk delete/visibility, check SKU |
| Categorie | CRUD con immagine, alt text, object-fit, sottotitolo banner |
| Homepage | Editor banner categorie + spot editoriali (`HomeSpot`) |
| Ordini | Lista, dettaglio, aggiornamento stato |
| Inventario | Soglia stock basso configurabile |
| Recensioni | Moderazione approve/reject |

### Catalogo demo

Il seed popola:

- **7 categorie:** t-shirts, felpe, pantaloni, cappelli, borse, giacche, sneakers
- **~30 prodotti mock** (Unsplash) + **21 sneakers StockX** (immagini CDN multi-angolo)
- Utenti demo admin e cliente
- Banner homepage e spot editoriali preconfigurati

---

## Setup locale

### Requisiti

- **Node.js** 20+ (consigliato 24.x, come su Vercel)
- **Docker** (Postgres + MailHog)
- **npm**

### Avvio rapido

```bash
# 1. Servizi locali (Postgres + MailHog)
docker compose up -d

# 2. Variabili d'ambiente
cp .env.example .env
# Imposta AUTH_SECRET: openssl rand -base64 32
# DATABASE_URL locale (se non già in .env):
# DATABASE_URL="postgresql://eshop:eshop@localhost:5432/eshop?schema=public"

# 3. Dipendenze + DB + seed
npm install
npm run setup

# 4. Dev server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### Credenziali demo

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | `admin@eshop.local` | `admin123` |
| Cliente | `cliente@eshop.local` | `cliente123` |

### Servizi locali

| Servizio | URL / comando |
|----------|----------------|
| App | http://localhost:3000 |
| Prisma Studio | `npm run db:studio` |
| MailHog UI | http://localhost:8025 |
| Postgres | `localhost:5432` — user/pass/db: `eshop` |

---

## Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|:------------:|-------------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL. In produzione preferire `POSTGRES_PRISMA_URL` da integrazione Vercel+Supabase |
| `POSTGRES_PRISMA_URL` | ⚙️ | URL pooler Supabase (porta 6543). Usata da `prisma.config.ts` con priorità |
| `POSTGRES_URL_NON_POOLING` | ⚙️ | URL diretto (porta 5432) per `npm run db:migrate:deploy` |
| `AUTH_SECRET` | ✅ | Secret NextAuth (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | ✅ prod | `true` su Vercel per trust proxy |
| `NEXT_PUBLIC_APP_URL` | ✅ prod | URL pubblico, es. `https://rewinddrop.vercel.app` |
| `PAYMENT_MODE` | — | `mock` (default) o `stripe` |
| `STRIPE_SECRET_KEY` | Stripe | Chiave segreta Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Chiave pubblica Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Secret webhook `/api/webhooks/stripe` |
| `BLOB_READ_WRITE_TOKEN` | prod upload | Token Vercel Blob; senza, upload su `public/uploads/` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_FROM` | — | Email transazionali; default log in console |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | OAuth Google (opzionale) |
| `LOW_STOCK_THRESHOLD` | — | Soglia inventario basso admin (default 5) |

> **Nota:** nel `.env` locale, lasciare vuote le variabili `POSTGRES_*` se non usate — stringhe vuote `""` vengono ignorate da `getDatabaseUrl()` in favore di `DATABASE_URL`.

---

## Database (Prisma)

### Configurazione

- **Schema:** `prisma/schema.prisma`
- **Config:** `prisma.config.ts` (Prisma 7 — URL da env, non più nel schema)
- **Client generato:** `src/generated/prisma/` (gitignored, rigenerato in `postinstall`)
- **Driver:** `@prisma/adapter-pg` con pool SSL custom per Supabase (`sslmode=no-verify`)

### Modelli principali

| Modello | Scopo |
|---------|-------|
| `User`, `Account`, `Session` | Auth NextAuth + ruoli `CUSTOMER` / `ADMIN` |
| `Category` | Categorie gerarchiche con banner homepage |
| `Product`, `Variant`, `Image` | Catalogo multi-variante e multi-immagine per colore |
| `Cart`, `CartItem` | Carrello guest (`sessionId`) o utente |
| `Order`, `OrderItem` | Ordini; `productId`/`variantId` nullable per storico post-delete |
| `Address` | Indirizzi utente |
| `Review` | Recensioni con moderazione |
| `Wishlist` | Lista desideri |
| `NewsletterSubscriber` | Iscrizioni newsletter |
| `HomeSpot` | Spot editoriali homepage (lookbook, dettagli) |

### Migrazioni

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
npm run db:migrate        # Sviluppo: crea + applica migration
npm run db:migrate:deploy # Produzione: solo apply (usa URL diretto)
npm run db:push           # Sync schema senza migration (dev rapido)
npm run db:generate       # Rigenera Prisma Client
npm run db:seed           # Popola catalogo demo
```

---

## API REST

Tutte le route sono in `src/app/api/` (Next.js Route Handlers).

### Pubbliche

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/products` | Lista prodotti (filtri, paginazione) |
| `GET` | `/api/products/[slug]` | Dettaglio prodotto |
| `GET` | `/api/products/[slug]/reviews` | Recensioni prodotto |
| `GET` | `/api/categories` | Lista categorie |
| `GET` | `/api/cart` | Carrello corrente |
| `POST` | `/api/cart` | Aggiungi/aggiorna item |
| `DELETE` | `/api/cart` | Svuota carrello |
| `POST` | `/api/cart/validate` | Valida disponibilità stock |
| `POST` | `/api/checkout` | Crea ordine |
| `POST` | `/api/checkout/confirm` | Conferma pagamento |
| `POST` | `/api/checkout/complete` | Completa ordine offline |
| `POST` | `/api/checkout/simulate-card` | Simula carta (solo dev) |
| `GET` | `/api/payment-mode` | Modalità pagamento attiva |
| `GET` | `/api/orders/[number]` | Dettaglio ordine (guest con token) |
| `POST` | `/api/newsletter` | Iscrizione newsletter |
| `POST` | `/api/auth/register` | Registrazione utente |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers |
| `POST` | `/api/webhooks/stripe` | Webhook Stripe |

### Account (autenticato)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET/PATCH` | `/api/account/profile` | Profilo utente |
| `GET/POST` | `/api/account/addresses` | Indirizzi |
| `PATCH/DELETE` | `/api/account/addresses/[id]` | Singolo indirizzo |
| `GET` | `/api/account/orders` | Storico ordini |
| `GET` | `/api/account/orders/[id]` | Dettaglio ordine |
| `GET/POST/DELETE` | `/api/wishlist` | Wishlist |

### Admin (ruolo `ADMIN`)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/products` | Lista / crea prodotto |
| `GET/PATCH/DELETE` | `/api/admin/products/[id]` | CRUD prodotto |
| `POST` | `/api/admin/products/[id]/duplicate` | Duplica prodotto |
| `POST` | `/api/admin/products/bulk-delete` | Elimina multipli |
| `POST` | `/api/admin/products/bulk-visibility` | Mostra/nascondi multipli |
| `GET` | `/api/admin/products/ids` | Lista ID (selezione bulk) |
| `GET` | `/api/admin/products/check-sku` | Verifica univocità SKU |
| `*` | `/api/admin/products/[id]/images/*` | Upload, delete, reorder immagini |
| `PATCH` | `/api/admin/products/[id]/variants/[variantId]/stock` | Aggiorna stock |
| `GET/POST` | `/api/admin/categories` | Categorie |
| `PATCH/DELETE` | `/api/admin/categories/[id]` | Singola categoria |
| `GET/PATCH` | `/api/admin/orders` | Ordini |
| `PATCH` | `/api/admin/orders/[id]` | Aggiorna stato ordine |
| `GET/PATCH` | `/api/admin/reviews` | Moderazione recensioni |
| `GET` | `/api/admin/inventory` | Report inventario |
| `GET/PATCH` | `/api/admin/homepage-banners` | Banner homepage |
| `PATCH` | `/api/admin/homepage-banners/category/[slug]` | Banner categoria |
| `PATCH` | `/api/admin/homepage-banners/spot/[key]` | Spot editoriale |
| `POST` | `/api/admin/upload` | Upload file generico |

---

## Autenticazione

- **Provider:** Credentials (email/password bcrypt) + Google OAuth (opzionale)
- **Sessione:** JWT (strategy `jwt` in NextAuth v5)
- **Ruoli:** `CUSTOMER` | `ADMIN` — propagati in token e session
- **Middleware** (`src/middleware.ts`):
  - `/account/*` e `/api/account/*` → login obbligatorio
  - `/admin/*` e `/api/admin/*` → login + ruolo `ADMIN`
- **Registrazione:** `POST /api/auth/register` con hash bcrypt

---

## Pagamenti

| Modalità | Env | Comportamento |
|----------|-----|---------------|
| **Mock** | `PAYMENT_MODE=mock` | Ordine confermato senza addebito reale |
| **Stripe** | `PAYMENT_MODE=stripe` + chiavi API | PaymentIntent, webhook, metodi card/Klarna |
| **Simulazione dev** | Nessuna chiave Stripe in dev | Form carta simulata in checkout |

Metodi offline supportati: contrassegno, bonifico (vedi `src/lib/payments/methods.ts`).

Webhook locale Stripe:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Upload immagini

| Ambiente | Storage | Path / servizio |
|----------|---------|-----------------|
| Locale | Filesystem | `public/uploads/` |
| Produzione | Vercel Blob | CDN pubblico via `BLOB_READ_WRITE_TOKEN` |

- Formati: JPEG, PNG, WebP — max **5 MB**
- Admin: upload su prodotti, categorie, banner homepage
- Catalogo demo: immagini Unsplash e StockX CDN (nessun upload richiesto)

---

## Script CLI

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Dev server Next.js (Turbopack) |
| `npm run build` | Build produzione (`next build`) |
| `npm run start` | Server produzione locale |
| `npm run typecheck` | Controllo TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit) |
| `npm run setup` | `prisma generate` + `migrate deploy` + seed |
| `npm run db:seed` | Re-seed catalogo completo |
| `npm run db:seed-admin` | Crea/aggiorna solo utente admin |
| `npm run db:migrate` | Migration in sviluppo |
| `npm run db:migrate:deploy` | Migration in produzione (URL diretto) |
| `npm run db:import-stockx` | Importa 21 sneakers StockX nel DB |
| `npm run db:refresh-images` | Aggiorna URL immagini prodotti |
| `npm run db:studio` | GUI database Prisma Studio |

Script aggiuntivi in `scripts/`:

| File | Scopo |
|------|-------|
| `migrate-deploy.mjs` | Wrapper migrate con `POSTGRES_URL_NON_POOLING` |
| `import-stockx-products.ts` | Import catalogo StockX |
| `backfill-color-images.ts` | Associa immagini a colori varianti |
| `update-homepage-banners.ts` | Aggiorna banner editoriali |
| `export-seed-sql.ts` | Esporta seed come SQL |
| `clear-images.ts` | Pulisce immagini orfane |
| `seed-admin.ts` | Seed utente admin |

---

## Deploy (Vercel + Supabase)

### Infrastruttura

| Servizio | Dettaglio |
|----------|-----------|
| **Hosting** | Vercel — progetto `eshop-streetwear` |
| **Dominio** | `rewinddrop.vercel.app` |
| **Database** | Supabase PostgreSQL (`eshop-streetwear`, regione `eu-west-1`) |
| **Integrazione** | Vercel ↔ Supabase (env `POSTGRES_*` auto-iniettate) |
| **Build** | `npx prisma generate && npm run build` (`vercel.json`) |
| **Migrazioni** | **Non** nel build — eseguire `npm run db:migrate:deploy` separatamente |

### Variabili Vercel (produzione)

```
AUTH_SECRET=<random>
AUTH_TRUST_HOST=true
PAYMENT_MODE=mock
NEXT_PUBLIC_APP_URL=https://rewinddrop.vercel.app
POSTGRES_PRISMA_URL=<da integrazione Supabase>
POSTGRES_URL_NON_POOLING=<da integrazione Supabase>
```

Opzionali: `BLOB_READ_WRITE_TOKEN`, chiavi Stripe, SMTP, Google OAuth.

### Workflow deploy

```bash
# 1. Push su main → deploy automatico Vercel
git push origin main

# 2. Migrazioni su Supabase (dopo nuove migration in repo)
npm run db:migrate:deploy   # con .env produzione o Supabase MCP

# 3. Seed (solo prima installazione o reset)
npm run db:seed
```

### Note produzione

- Il filesystem Vercel è **effimero** — usare Vercel Blob per upload persistenti.
- Connessione Supabase: SSL con `rejectUnauthorized: false` gestito in `src/lib/prisma.ts`.
- Il build **non** esegue `prisma migrate deploy` per evitare hang sul connection pooler.
- Homepage con **ISR 120s** — aggiornamenti catalogo visibili entro 2 minuti senza rebuild.

---

## Testing e qualità

```bash
npm run typecheck    # TypeScript strict
npm run lint         # ESLint (eslint-config-next)
npm run test         # Vitest — validations, SKU helpers
```

Test attuali:
- `src/lib/validations/checkout.test.ts`
- `src/lib/sku.test.ts`

---

## Struttura del progetto

```
eshop/
├── prisma/
│   ├── schema.prisma          # Modelli dati
│   ├── seed.ts                # Seed catalogo demo
│   └── migrations/            # Migration SQL versionate
├── scripts/                   # CLI utility (import StockX, migrate, ecc.)
├── public/
│   └── uploads/               # Upload locali (gitignored tranne .gitkeep)
├── src/
│   ├── app/
│   │   ├── (store)/           # Storefront (layout con header/footer)
│   │   ├── admin/             # Pannello amministrazione
│   │   ├── api/               # Route Handlers REST
│   │   ├── login/             # Pagina login/registrazione
│   │   ├── layout.tsx         # Root layout + metadata
│   │   └── globals.css        # Tailwind + animazioni homepage
│   ├── components/
│   │   ├── admin/             # UI admin (form, tabelle, dashboard)
│   │   ├── home/              # Sezioni homepage
│   │   ├── layout/            # Header, footer, providers
│   │   ├── product/           # Card, galleria colori
│   │   └── ui/                # Primitivi UI riutilizzabili
│   ├── generated/prisma/      # Prisma Client (generato)
│   ├── hooks/                 # React hooks custom
│   ├── lib/                   # Business logic, query, validazioni
│   │   ├── validations/       # Schemi Zod
│   │   ├── payments/          # Stripe + mock
│   │   ├── stockx-products.ts # Catalogo sneakers StockX
│   │   └── homepage-banners.ts
│   ├── stores/
│   │   └── cart.ts            # Zustand store carrello
│   └── middleware.ts          # Auth guard
├── docker-compose.yml         # Postgres + MailHog
├── prisma.config.ts           # Config Prisma 7
├── next.config.ts             # Image domains, optimizePackageImports
├── vercel.json                # Build command Vercel
└── vitest.config.ts
```

---

## Licenza

Progetto dimostrativo — uso portfolio/educativo. Immagini e marchi nei prodotti demo sono a scopo illustrativo e non implicano affiliazione con i brand raffigurati.
