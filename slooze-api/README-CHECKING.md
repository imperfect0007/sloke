# CHECKING INSTRUCTIONS

Use this file to quickly verify the deployed API works as expected.

## Base URLs

- Production API: `https://slooze-api.vercel.app`
- GraphQL endpoint: `https://slooze-api.vercel.app/graphql`
- Health endpoint: `https://slooze-api.vercel.app/health`

## 1) Basic health check

Request:

```bash
curl https://slooze-api.vercel.app/health
```

Expected response:

```json
{"status":"ok"}
```

## 2) Login check (public)

Use seeded member credentials:
- Email: `member.india@slooze.test`
- Password: `password123`

Request:

```bash
curl -X POST https://slooze-api.vercel.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: { email: \"member.india@slooze.test\", password: \"password123\" }) { accessToken userId role country } }"}'
```

Expected:
- `data.login.accessToken` present
- `role` is `MEMBER`
- `country` is `INDIA`

## 3) Authenticated query check (`me`)

1. Copy token from login response
2. Call `me`:

```bash
curl -X POST https://slooze-api.vercel.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"query { me { id email role country } }"}'
```

Expected:
- correct user profile returned

## 4) Country-scoped data check (`restaurants`)

With India member token:

```bash
curl -X POST https://slooze-api.vercel.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"query { restaurants { id name country menuItems { id name priceCents } } }"}'
```

Expected:
- all `country` values are `INDIA`
- no US restaurants

## 5) RBAC check (member cannot checkout)

With member token:

```bash
curl -X POST https://slooze-api.vercel.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"query":"mutation { checkout { id status totalCents } }"}'
```

Expected:
- forbidden/unauthorized style GraphQL error

## 6) Admin-only payment methods check

### 6a) As member (should fail)

```bash
curl -X POST https://slooze-api.vercel.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MEMBER_TOKEN>" \
  -d '{"query":"query { myPaymentMethods { id label last4 isDefault } }"}'
```

Expected:
- forbidden/unauthorized style GraphQL error

### 6b) As admin (should pass)

Login with `admin.india@slooze.test / password123`, then:

```bash
curl -X POST https://slooze-api.vercel.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"query":"query { myPaymentMethods { id label last4 isDefault } }"}'
```

Expected:
- payment methods list returned

## 7) Common troubleshooting

- `Cannot GET /`:
  - expected (no root route), use `/health` or `/graphql`
- CSRF error on GraphQL:
  - ensure `POST` + `Content-Type: application/json`
- DB connection errors (`HOST:5432`):
  - `DATABASE_URL` in Vercel is wrong/placeholder
- Missing JWT errors:
  - `JWT_SECRET` not set in Vercel env vars

## Seeded test users

All seeded users use password `password123`:
- `admin.india@slooze.test`
- `admin.us@slooze.test`
- `manager.india@slooze.test`
- `manager.us@slooze.test`
- `member.india@slooze.test`
- `member.us@slooze.test`
