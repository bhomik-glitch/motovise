# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Motovise** — a full-stack automotive e-commerce platform with a Next.js 14 frontend and NestJS backend, deployed on Railway with PostgreSQL.

---

## Commands

### Frontend (root directory)

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Build for production (runs prisma generate first)
npm run lint         # Run ESLint
npm run db:push      # Sync Prisma schema to DB (no migration file)
npm run db:migrate   # Create and apply a migration
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Run seed script (creates default users, products)
```

### Backend (`backend/` directory)

```bash
npm run start:dev    # Start with hot reload (watch mode)
npm run build        # Compile TypeScript → dist/ (runs prisma generate first)
npm start            # Start with prisma migrate deploy (production-like)
npm run lint         # ESLint with --fix
npm test             # Run Jest unit tests
npm run test:watch   # Jest in watch mode
npm run test:cov     # Generate coverage report
npm run test:e2e     # End-to-end tests
npm run seed:products  # Seed product data only
```

### Running a single test (backend)

```bash
cd backend
npx jest src/path/to/file.spec.ts
npx jest --testNamePattern="test name pattern"
```

---

## Architecture

### Monorepo Layout

```
/                       # Next.js 14 frontend (App Router)
├── src/
│   ├── app/            # Route definitions (App Router)
│   ├── modules/        # Feature modules (domain logic + components + hooks)
│   ├── components/     # Shared/reusable UI components
│   ├── services/       # API service layer (admin services)
│   ├── lib/            # Utilities: api-client.ts, auth.ts, prisma.ts, queryKeys.ts
│   ├── types/          # Global TypeScript types
│   ├── providers/      # React context providers
│   └── middleware.ts   # Next.js auth routing middleware
├── prisma/             # Frontend Prisma schema + seed (for NextAuth adapter)
└── backend/            # NestJS API
    ├── src/
    │   ├── main.ts     # Bootstrap + security validation
    │   ├── app.module.ts  # Root module
    │   └── [module]/   # One folder per domain (auth, orders, products, ...)
    └── prisma/         # Backend Prisma schema (separate client)
```

### Frontend Architecture

- **Next.js 14 App Router** with route groups: `(hero)` (landing page), `(store)` (shop), `/admin`, `/checkout`
- **API communication**: Axios instance at `src/lib/api-client.ts` → NestJS backend at `NEXT_PUBLIC_API_URL` (default: Railway URL). In dev, `/nest/*` rewrites to backend via `next.config.mjs` proxy.
- **Server state**: TanStack Query v5 with query keys in `src/lib/queryKeys.ts`
- **Auth**: NextAuth v4 (`src/app/api/auth/[...nextauth]/route.ts`) using JWT + Prisma adapter. Token includes `backendToken` for API calls.
- **Feature modules** under `src/modules/` each contain: `components/`, `hooks/`, `services/`, and `.types.ts` — avoid mixing concerns between modules.
- **Admin RBAC UI**: `src/components/auth/PermissionGate.tsx` and `ProtectedRoute.tsx` gate admin views.

### Backend Architecture

- **NestJS modular pattern**: each domain is a self-contained module with controller, service, module file, and `dto/` folder.
- **Global prefix**: `/v1` — all endpoints are under `/v1/...`
- **Swagger docs**: available at `/api/docs` in development.
- **Auth flow**: JWT access token (15m) + HTTP-only refresh token cookie (7d). Both secrets must be 64+ chars or the app refuses to start.
- **RBAC**: `@RequirePermissions()` decorator + `PermissionsGuard` checks per-endpoint. Roles/permissions seeded by `src/rbac/seed/rbac.seed.ts`.
- **Redis**: Used for distributed locks (`distributed-lock.service.ts`) and metrics caching. Optional — app runs without Redis but concurrent operations may have race conditions.
- **Cron jobs**: `risk.cron.ts` (fraud/RTO evaluation), `alerts.cron.ts` (threshold checks), `metrics-snapshot.cron.ts` (daily aggregation).
- **File uploads**: Cloudinary provider in `src/upload/`.
- **Payment**: Mock gateway (`mock-gateway.service.ts`) for dev; Razorpay for production. Set `PAYMENT_GATEWAY=mock` or `razorpay` via env.

### Database

Two separate Prisma setups:
- `/prisma/schema.prisma` — used by the **frontend** for NextAuth session management.
- `/backend/prisma/` (implied by backend's `DATABASE_URL`) — used by the **backend** for all application data.

Key schema notes:
- `Order` has extensive fraud detection fields (`rule_score`, `is_manual_review`, `is_rto`, `review_status`).
- `idempotencyKey` on `Order` prevents duplicate charges.
- `PincodeRisk` stores geographic RTO risk — updated by cron job.
- `SystemConfig` stores global fraud thresholds (`fraudRiskThreshold`, `maxLoginAttempts`).
- Categories are self-referential (parentId) for hierarchy.

### Environment Variables

**Frontend** (`.env.local`): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, Razorpay keys, optional OAuth (Google/GitHub), SMTP.

**Backend** (`backend/.env`): `DATABASE_URL`, `JWT_SECRET` (64+ chars, required), `REFRESH_TOKEN_SECRET` (64+ chars, required), `PORT=4000`, `FRONTEND_URL`, `PAYMENT_GATEWAY`, Razorpay keys, Cloudinary keys, optional Redis/SendGrid.

### CORS & Deployment

- Backend allows: `http://localhost:3000`, `https://motovise-pied.vercel.app`, `*.vercel.app`
- Railway deployment: builds backend only (`railway.json`) — frontend deploys to Vercel separately.
- Production DB migrations run automatically on start: `prisma migrate deploy`.

### Seed Data (development)

```
admin@ecommerce.com    / Test@1234  → ADMIN role
manager1@gmail.com     / Test@1234  → MANAGER role
customer1@gmail.com    / Test@1234  → CUSTOMER role
```

### Tailwind Theme

Custom Motovise color palette in `tailwind.config.ts`:
- `motovise.primary`: `#7C9CF5` (pastel blue)
- `motovise.highlight`: `#FDBA74` (pastel orange)
- `motovise.bg`: `#F8FAFC`, `motovise.section`: `#EEF2FF`
- Fonts: Syne (display headings), DM Sans (body)
