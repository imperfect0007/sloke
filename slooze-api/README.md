# Slooze take-home — food ordering API

NestJS + GraphQL (Apollo) + Prisma (SQLite) backend with **RBAC** and a **country-scoped Re-BAC** layer (users only touch restaurants, carts, and orders in their assigned country).

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cd slooze-api
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

GraphQL endpoint: `http://localhost:3000/graphql` (Apollo Sandbox).

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
| `npm run build` | Compile |
| `npm run test:e2e` | Smoke test (GraphQL login) |
| `npx prisma studio` | Browse SQLite data |
| `npm run prisma:migrate` | Create / apply migrations |
| `npm run prisma:seed` | Reseed demo data |

## Notes

- `JWT_SECRET` must be set in `.env` (see `.env.example`).
- Checkout is a mocked payment: creates a `PAID` order and clears the cart.
- `register` accepts any `role` for local demos; in production you would restrict elevated roles.
