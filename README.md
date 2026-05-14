# AIAG Farming — Unified Farm & Livestock Management SaaS

Next.js 14 · TypeScript · Tailwind CSS · Multi-tenant SaaS

## Getting Started

```bash
npm install
cp .env.example .env.local
```

1. Create a **Neon** PostgreSQL database and run the SQL in [`db/schema.sql`](db/schema.sql) (SQL Editor or pgAdmin).
2. Set `DATABASE_URL` in `.env.local` to your Neon connection string.
3. In Google Cloud Console, create an **OAuth Client** (Web) and enable the **Maps JavaScript API**. Set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
4. Generate a random secret (32+ chars) for `AUTH_SECRET` and `NEXTAUTH_SECRET` (use the same value for both locally).

```bash
npm run dev
```

Open http://localhost:3000

## Key Routes

- `/home` — Marketing landing page
- `/sign-in` — Sign in
- `/sign-up` — 3-step registration
- `/overview` — Unified farm dashboard
- `/crops/fields` — Field management
- `/crops/seasons` — Season planner
- `/crops/sprays` — Spray records
- `/livestock/animals` — Animal registry
- `/livestock/mobs` — Mob & paddock management
- `/livestock/health` — Health events
- `/livestock/breeding` — Breeding records
- `/finance` — P&L & financial management
- `/compliance` — Compliance & chemical register
- `/ai-advisor` — AI farm advisor
- `/settings` — Organisation settings

## Tech Stack
Next.js 14, TypeScript, Tailwind CSS, Recharts, shadcn/ui patterns
Designed for: Auth.js (Google) + Neon PostgreSQL, Stripe, Google Maps, OpenAI

© 2026 AIAG Farming. Confidential.
"# aiagfarming" 
