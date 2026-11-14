# NER-Sarthi — System Architecture

## 1. Introduction

NER-Sarthi is an AI-powered logistics and road-disruption intelligence platform for North East India. It tracks road corridors, vehicles, and field officers across the region, surfaces landslide and weather risk in real time, and gives commanders, field officers, and drivers a shared operational picture during disruptions such as landslides, heavy rainfall, and road damage.

The project started as a frontend-only demo (React + static JSON data) and was rebuilt with a full Supabase backend: a relational database, authentication, row-level security, realtime sync, and serverless functions — while keeping the original UI and user experience intact.

## 2. Project Objectives

- Give control-room commanders a live, map-based view of road corridors, vehicle convoys, and field officers across North East India.
- Detect and broadcast road disruptions (landslides, heavy rain, vehicle delays, road damage) as they happen.
- Let field officers and drivers contribute ground-truth reports that feed back into the system.
- Enforce who can see and change what, at the database level, not just in the UI.
- Keep the system usable offline/degraded (falls back to bundled demo data if the backend is unreachable).
- Provide a public-facing tourism/culture section (Explore Northeast) independent of the operational login.

## 3. Users and Features

The system has three authenticated roles, plus anonymous public access.

| Role | Can do |
|---|---|
| **Commander** | Full access: create/update/delete routes, officers, and vehicles; run disruption simulations (landslide, heavy rain, vehicle delay, clear route); view all reports and notifications; see the full map and analytics. |
| **Officer** | View all operational data; update only the route(s) assigned to them; cannot run simulations or manage officers/vehicles. |
| **Driver** | View operational data; update only their own assigned vehicle's live position/status/speed; submit Road Observation Reports from the field. |
| **Anonymous / Public** | Browse the Explore Northeast section (tourism destinations, cultural festivals) and general advisory feeds (weather, historical disruptions, RSS). No access to live operational data (routes, vehicles, officers, alerts). |

Core features:
- Live Command Dashboard with KPIs, risk charts, and a map.
- Route Intelligence (per-corridor landslide/weather/risk forecasts).
- AI Logistics Planner for route/vehicle what-if analysis.
- Analytics & Reports.
- Driver Road Observation Report submission.
- Officer and vehicle directories.
- AI chatbot ("Sarthi AI") that answers questions from live operational data.
- Disruption alerts and a notification center, pushed in real time.
- Explore Northeast (public tourism/culture pages).

## 4. Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool/dev server)
- Tailwind CSS
- React Router DOM
- Leaflet / React-Leaflet (maps)
- Recharts (charts)
- Lucide React (icons)

**Backend — Supabase**
- PostgreSQL (relational database, 14 tables)
- Supabase Auth (email/password, JWT sessions)
- Row Level Security (RLS) — all access control enforced in the database
- Supabase Realtime (Postgres change feeds over WebSockets)
- Supabase Edge Functions (Deno) — scheduled risk recalculation and validated report submission
- pg_cron + pg_net — scheduled server-side jobs

**Tooling**
- Supabase CLI (migrations, secrets, function deployment)
- ESLint + TypeScript compiler
- tsx (running TypeScript seed scripts locally)

## 5. Basic System Architecture

```
┌──────────────────────────┐
│   React + Vite Frontend  │
│  (Dashboard, Map, Chat)  │
└───────────┬───────────────┘
            │  @supabase/supabase-js
            │  (REST + Realtime WebSocket)
            ▼
┌──────────────────────────────────────────┐
│              Supabase Platform             │
│  ┌────────────┐  ┌───────────────────┐    │
│  │   Auth      │  │   PostgreSQL DB    │    │
│  │ (JWT, roles)│  │  (14 tables + RLS) │    │
│  └────────────┘  └─────────┬──────────┘    │
│                             │ triggers/RPC  │
│  ┌────────────┐  ┌─────────▼──────────┐    │
│  │  Realtime   │  │  RPC functions      │    │
│  │  (pub/sub)  │  │ (simulate_*, etc.)  │    │
│  └────────────┘  └────────────────────┘    │
│  ┌──────────────────────────────────────┐  │
│  │   Edge Functions (Deno)               │  │
│  │  risk-recalculate, submit-driver-report│ │
│  └───────────────┬──────────────────────┘  │
└──────────────────┼──────────────────────────┘
                    │ pg_cron + pg_net (every 15 min)
                    ▼
            Scheduled risk recalculation
```

The frontend never talks to the database directly with elevated privileges. It uses the public anon key, and every read/write is filtered by RLS policies based on the logged-in user's role. Privileged operations (simulations, bulk recalculation) run as Postgres functions or Edge Functions that re-check the caller's role server-side.

If the Supabase API is unreachable, or a query returns no rows (e.g., an anonymous visitor hitting a protected table), the frontend falls back to bundled local JSON demo data so the UI still renders.

## 6. Main Website Pages

| Page | Access | Purpose |
|---|---|---|
| Command Dashboard | All authenticated roles | KPIs, live map, risk charts, disruption feed, driver report form (drivers) |
| Route Intelligence | All authenticated roles | Per-route landslide/weather/risk breakdown |
| AI Logistics Planner | All authenticated roles | Route and vehicle what-if planning |
| Analytics & Reports | All authenticated roles | Aggregated statistics and historical trends |
| Officers | All authenticated roles | Field officer directory and status |
| Explore Northeast | Public | Tourism destinations and cultural festivals |
| Login / Portal | Public | Sign in / sign up (Supabase Auth) |
| Subscribe | Public | Notification/alert subscription |

## 7. Database Design

14 tables in the `public` schema:

- **profiles** — one row per Supabase Auth user; `role` (`commander` / `officer` / `driver`), name, designation. Created automatically by a trigger on `auth.users` insert; role always defaults to `driver` and is promoted manually via SQL.
- **officers** — field officer directory; optionally linked to a `profiles` row via `profile_id`.
- **routes** — road corridors: origin/destination, coordinates (JSONB), status (`clear`/`at-risk`/`blocked`), risk scores, assigned officer.
- **vehicles** — convoy/cargo vehicles: position, speed, status, cargo type, linked route and driver profile.
- **weather_readings** — district-level weather snapshots (rainfall, visibility, wind, landslide risk).
- **disruption_alerts** — logged disruption events per route (severity, type, description).
- **driver_reports** — ground reports submitted by drivers.
- **social_reports** — curated social-media observations.
- **historical_disruptions** — past disruption records, used for risk scoring.
- **rss_items** — advisory/news feed items.
- **notifications** / **notification_reads** — broadcast notifications and per-user read state.
- **destinations**, **festivals** — public tourism/culture content.

Key design choices:
- Human-readable text primary keys (`R-001`, `V-001`, `OFF-001`) are kept from the original dataset.
- Foreign keys enforce referential integrity between routes, vehicles, and officers.
- `updated_at` triggers on `routes` and `vehicles`.
- A `get_user_role()` SQL function (security definer) centralizes role lookups for RLS policies.
- Column-level write restrictions (e.g., a driver can only change `lat`, `lng`, `speed`, `status` on their vehicle) are enforced with `REVOKE`/`GRANT` and `BEFORE UPDATE` triggers, since RLS alone cannot restrict individual columns.

## 8. API Routes

The frontend does not use custom REST endpoints for CRUD — it uses the Supabase auto-generated PostgREST API (`/rest/v1/<table>`) through the `supabase-js` client, filtered by RLS. The following are the custom server-side entry points:

**Postgres RPC functions** (called via `supabase.rpc(...)`, commander-only, enforced inside the function):
- `simulate_landslide(p_route_id)`
- `simulate_heavy_rain(p_route_id)`
- `simulate_vehicle_delay(p_vehicle_id)`
- `clear_route(p_route_id)`
- `get_user_role()` — internal helper used by RLS policies

**Edge Functions** (Deno, deployed via Supabase CLI):
- `POST /functions/v1/risk-recalculate` — recomputes route risk from weather and reports; protected by an `x-cron-secret` header; invoked every 15 minutes by `pg_cron` + `pg_net`.
- `POST /functions/v1/submit-driver-report` — validates and inserts a driver report; authenticated via the caller's JWT, RLS applies as that user.

**Realtime channels** (WebSocket, via `supabase-js`):
- `postgres_changes` subscriptions on `routes`, `vehicles`, `disruption_alerts`, `notifications`, `driver_reports`.

## 9. Project Folder Structure

```
NER 2/
├── src/
│   ├── components/        # UI components (dashboard, map, chat, layout, alerts)
│   ├── context/           # AppContext (app state), AuthContext (session/profile)
│   ├── hooks/              # useRealtime.ts
│   ├── lib/                # supabase.ts (Supabase client)
│   ├── pages/              # Route-level pages (Dashboard, Explore, Login, etc.)
│   ├── services/           # One file per resource; maps DB rows -> TS types
│   ├── data/                # Bundled JSON used as offline fallback / seed source
│   ├── types/               # Shared TypeScript interfaces
│   └── utils/                # riskEngine.ts and other helpers
├── supabase/
│   ├── migrations/          # 001_schema, 002_rls, 003_functions, 004_realtime, 005_cron
│   └── functions/           # risk-recalculate, submit-driver-report (Edge Functions)
├── scripts/
│   └── seed.ts               # Loads src/data/*.json into Supabase (local, service-role key)
├── docs/
│   └── SECURITY.md            # Plain-English list of every RLS policy
├── .env.example, .env.seed.example
├── README.md
└── package.json
```

## 10. Basic Security

- **Row Level Security (RLS)** is enabled on all 14 tables; every query is filtered by the caller's role and identity, not just hidden in the UI.
- **Role assignment is server-controlled.** New sign-ups are always created as `driver` by a database trigger; the client can never set its own role. Commander/officer promotion is done manually via SQL by an administrator.
- **Column-level restrictions** prevent a driver from changing anything on their vehicle besides position/speed/status, and prevent any user from changing their own `role` column, enforced via `REVOKE`/`GRANT` and triggers (RLS alone only restricts rows, not columns).
- **Privileged actions run server-side.** Disruption simulations are Postgres functions that re-verify `get_user_role() = 'commander'` before doing anything, so even a crafted API call from a non-commander is rejected by the database.
- **Secrets never reach the frontend.** Only `VITE_SUPABASE_URL` and the public anon/publishable key are present client-side. The `service_role` key is used only in the local seed script and Edge Functions (server-side), and is excluded from git via `.gitignore`.
- **Edge Functions** are protected by a shared `x-cron-secret` (for the scheduled job) or the caller's JWT (for user-submitted reports).
- **Public data** (tourism destinations, festivals, general advisories) is deliberately open to anonymous reads; operational data (routes, vehicles, officers, alerts) is restricted to authenticated users only.

## 11. Future Improvements

- LLM-powered chatbot responses (via an Edge Function) instead of rule-based answers, with rate limiting.
- Push notifications (mobile/browser) for critical disruptions, not just in-app.
- Audit logging of all commander write actions.
- Admin UI for promoting users to officer/commander instead of manual SQL.
- Automated tests for RLS policies (CI-run SQL test suite) and for the frontend.
- Offline-first support with local caching for drivers in low-connectivity areas.
- Multi-language content stored per-locale in the database instead of only in static translation files.

## 12. Conclusion

NER-Sarthi demonstrates a full migration from a static, frontend-only demo to a production-style application backed by PostgreSQL, enforced authorization, real-time collaboration, and serverless scheduled logic — all built on Supabase. The architecture keeps a clear separation of concerns: the frontend renders and reacts to state, while every authorization decision is made and enforced in the database itself, so the system remains secure even if the client were compromised or bypassed entirely.