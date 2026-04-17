# Slooze take-home — food ordering API

NestJS + GraphQL (Apollo) + Prisma (**PostgreSQL**) with **RBAC** and a **country-scoped Re-BAC** layer (users only touch restaurants, carts, and orders in their assigned country).

## Prerequisites

- Node.js 20+
- npm
- A **PostgreSQL** database (local Docker, [Neon](https://neon.tech) free tier, Supabase, Vercel Postgres, etc.)

## Setup

```bash
cd slooze-api
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

GraphQL endpoint: `http://localhost:3000/graphql` (Apollo Sandbox).

## Deploy on Vercel

1. Push this repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Set **Root Directory** to `slooze-api` (if the repo root contains other folders).
3. In **Project → Settings → Environment Variables**, add (for **Production** and **Preview** as needed):
   - `DATABASE_URL` — PostgreSQL connection string (required at **runtime** for Prisma).
   - `JWT_SECRET` — long random string (required; the app uses `ConfigService.getOrThrow('JWT_SECRET')` and will **500** on `/graphql` if it is missing).

   Redeploy after saving variables (**Deployments → … → Redeploy** or run `vercel deploy --prod` again).

   **If you still see 500 after saving variables:** you must **Redeploy** (old bundles do not always pick up new env). In Vercel: **Deployments** → open the latest deployment → **⋯** → **Redeploy**. Also confirm each variable has **Production** and/or **Preview** enabled (not only “Development”) for the URL you are testing.
4. Before or after the first deploy, apply the schema to your database (from your machine with the same `DATABASE_URL`):

   ```bash
   npm run prisma:deploy
   npm run prisma:seed
   ```

5. Deploy from the Vercel dashboard or run `vercel deploy` / `vercel deploy --prod` in `slooze-api`. The build runs `prisma generate` and `nest build` only (migrations are applied in step 4 from your machine).
6. Call the API at **`https://<your-project>.vercel.app/graphql`**.

**Notes**

- SQLite is not used: Vercel serverless has no durable local file DB.
- First serverless request can be slow while Nest boots; cold starts are normal on the hobby tier.

## Seeded users (password `password123`)

| Email | Role | Country |
| --- | --- | --- |
| `admin.india@slooze.test` | ADMIN | INDIA |
| `admin.us@slooze.test` | ADMIN | AMERICA |
| `manager.india@slooze.test` | MANAGER | INDIA |
| `manager.us@slooze.test` | MANAGER | AMERICA |
| `member.india@slooze.test` | MEMBER | INDIA |
| `member.us@slooze.test` | MEMBER | AMERICA |

Mock restaurants and menus exist per country (India vs America).

## Role matrix (enforced)

| Capability | Admin | Manager | Member |
| --- | --- | --- | --- |
| View restaurants & menus (in own country) | yes | yes | yes |
| Cart: add / update / remove items | yes | yes | yes |
| Checkout (cart → paid order) | yes | yes | **no** |
| Cancel paid order (same country; privileged roles may cancel any order in country) | yes | yes | **no** |
| Payment methods (own profile) | yes | **no** | **no** |

## Auth

1. `login` or `register` (public) → `accessToken`
2. Send header: `Authorization: Bearer <token>`
3. `me` returns the current user (role + country)

## Re-BAC (relationship + geography)

`AccessPolicyService` enforces that resources tied to a **country** (restaurants, orders, checkout cart lines) align with the subject’s `user.country`. Cart lines reject cross-country menu items; checkout recomputes totals only after that check.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Dev server with watch |
| `npm run build` | `prisma generate` + compile |
| `npm run test:e2e` | Smoke test (needs `DATABASE_URL` pointing at Postgres) |
| `npx prisma studio` | Browse data |
| `npm run prisma:migrate` | Create / apply migrations in dev |
| `npm run prisma:seed` | Reseed demo data |

## Notes

- `JWT_SECRET` must be set in `.env` (see `.env.example`).
- Checkout is a mocked payment: creates a `PAID` order and clears the cart.
- `register` accepts any `role` for local demos; in production you would restrict elevated roles.
