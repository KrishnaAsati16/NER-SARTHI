# NER-Sarthi: North East Railway & Corridor Intelligence

**NER-Sarthi** is an AI-powered logistics, accessibility, and corridor resilience intelligence dashboard built for the North Eastern Region of India (DoNER / Ministry of Railways). It provides real-time landslide risk calculations, dynamic weather intelligence, automated corridor rerouting, and officer dispatching.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   React 18 + Vite (Frontend)                   │
│   Tailwind CSS • Leaflet Maps • Lucide Icons • Context State   │
└───────────────▲───────────────────────────────▲────────────────┘
                │ REST / Supabase Client        │ WebSockets (Realtime)
┌───────────────▼───────────────────────────────▼────────────────┐
│                      Supabase Backend                          │
│                                                                │
│  • Auth: Email & Password Authentication                      │
│  • Database: PostgreSQL 15+ with 14 Public Tables              │
│  • RLS: Granular Row Level Security via public.get_user_role() │
│  • Realtime: Live publications for routes, vehicles, alerts    │
│  • Edge Functions (Deno): Serverless cron & report ingestion   │
│  • Extensions: pg_cron & pg_net for scheduled tasks           │
└────────────────────────────────────────────────────────────────┘
```

- **Frontend**: Single-Page Application (SPA) built with React 18, TypeScript, Vite, and Tailwind CSS. State is managed via `AuthContext` and `AppContext`. Realtime state synchronization is driven by `useRealtime`.
- **Database (PostgreSQL)**: 14 relational tables in the `public` schema storing GIS corridors, fleet telemetry, officer rosters, weather sensor feeds, and disruption alerts.
- **Row Level Security (RLS)**: Enforced on all tables. Authorization rules gate access across 3 operational roles: `commander`, `officer`, and `driver`.
- **Realtime Replication**: Supabase Realtime broadcast channels stream row modifications (`INSERT`, `UPDATE`, `DELETE`) directly into connected client dashboards without requiring manual page refreshes.
- **Edge Functions (Deno runtime)**:
  - `risk-recalculate`: Recomputes route risk scores based on weather and field incident reports on a 15-minute schedule.
  - `submit-driver-report`: Authenticates driver submissions under RLS identity.

---

## 2. Database Schema (14 Tables)

| # | Table Name | Purpose | Primary Key | Key Relationships / Fields |
|---|------------|---------|-------------|----------------------------|
| 1 | `profiles` | User profiles linked to Supabase Auth | `id` (UUID references `auth.users`) | `role` (`commander`, `officer`, `driver`), `full_name`, `designation` |
| 2 | `officers` | Field officer directory & control rooms | `id` (TEXT, e.g. `'OFF-001'`) | References `profiles(id)` |
| 3 | `routes` | Monitored road/rail corridors with GIS points | `id` (TEXT, e.g. `'R-001'`) | `coordinates` (JSONB), `risk`, `status`, `assigned_officer_id` |
| 4 | `vehicles` | Transport fleet and telemetry | `id` (TEXT, e.g. `'V-001'`) | `cargo`, `lat`, `lng`, `speed`, `status`, `route_id` |
| 5 | `weather_readings` | Regional weather sensor telemetry | `id` (UUID) | `district`, `state`, `rainfall`, `rain_probability`, `visibility` |
| 6 | `disruption_alerts`| Active hazard and incident alerts | `id` (TEXT, e.g. `'ALERT-001'`) | `route_id`, `severity`, `type`, `description` |
| 7 | `driver_reports` | Ground observations submitted by drivers | `id` (TEXT, e.g. `'DR-001'`) | `driver_id`, `route_id`, `severity`, `observation` |
| 8 | `social_reports` | Curated social media feeds and alerts | `id` (TEXT, e.g. `'SOC-001'`) | `route_id`, `handle`, `severity`, `content` |
| 9 | `historical_disruptions` | Archive of past landslide/flood events | `id` (TEXT) | `district`, `cause`, `clearance_hours` |
| 10| `rss_items` | Official DoNER / NHIDCL press releases | `id` (TEXT) | `title`, `source`, `category`, `published_at` |
| 11| `notifications` | System notifications & broadcasts | `id` (TEXT, e.g. `'NOTIF-001'`) | `alert_key`, `severity`, `region`, `route_id` |
| 12| `notification_reads` | Read receipts per user | `id` (UUID) | `notification_id`, `user_id` |
| 13| `destinations` | Tourism and logistics landmark directory | `id` (TEXT) | `name`, `state`, `category`, `highlights` |
| 14| `festivals` | Regional festival calendar | `id` (TEXT) | `name`, `state`, `month`, `highlights` |

---

## 3. Database Migrations (Run in Order)

Execute the SQL migration files inside the Supabase SQL Editor in the following order:

1. **`supabase/migrations/001_schema.sql`**:
   - Creates all 14 database tables with appropriate foreign keys, checks, indexes, and automated `updated_at` triggers.
   - Sets up the `on_auth_user_created` trigger that automatically provisions a `'driver'` profile on user registration.
2. **`supabase/migrations/002_rls.sql`**:
   - Enables Row Level Security (RLS) on all 14 tables.
   - Installs the security definer function `public.get_user_role()`.
   - Defines granular SELECT, INSERT, UPDATE, and DELETE policies per role and restricts column mutations on `profiles` and `vehicles`.
3. **`supabase/migrations/003_functions.sql`**:
   - Implements server-side simulation stored procedures (`simulate_landslide`, `simulate_heavy_rain`, `simulate_vehicle_delay`, `clear_route`) restricted strictly to commanders.
4. **`supabase/migrations/004_realtime.sql`**:
   - Safely adds `routes`, `vehicles`, `disruption_alerts`, `notifications`, and `driver_reports` to the `supabase_realtime` publication.
5. **`supabase/migrations/005_cron.sql`**:
   - Enables `pg_cron` and `pg_net` extensions.
   - Schedules the 15-minute background HTTP POST trigger for automated corridor risk recalculation.

---

## 4. Initial Seed Data (Optional)

To populate the database tables with baseline JSON records from `src/data/`:
1. Create `.env.seed` in the project root:
   ```env
   SUPABASE_URL=https://<your-project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```
2. Run the seed script:
   ```bash
   npx tsx scripts/seed.ts
   ```

---

## 5. User Creation & Role Promotion

### Step A: Sign Up
Users can register directly on the **Portal Login** tab (`/login`).
By default, the database trigger assigns every new user the `'driver'` role with restricted permissions.

### Step B: Role Promotion
To promote a user to `commander` or `officer`, execute the following query in your Supabase SQL Editor:

```sql
-- Promote to Commander
UPDATE public.profiles
SET role = 'commander', designation = 'Chief Operations Commander'
WHERE id = '<USER_UUID_OR_AUTH_UID>';

-- Or Promote to Officer
UPDATE public.profiles
SET role = 'officer', designation = 'Field Operations Officer'
WHERE id = '<USER_UUID_OR_AUTH_UID>';
```

*(You can look up the user's UUID in the Supabase Dashboard under **Authentication > Users** or directly in `public.profiles`)*.

---

## 6. Deploying Supabase Edge Functions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```
2. **Log In & Link Project**:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. **Set Secrets**:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" CRON_SECRET="<random-high-entropy-string>"
   ```
4. **Deploy Edge Functions**:
   ```bash
   # Deploy risk recalculation (invoked via pg_cron with x-cron-secret)
   supabase functions deploy risk-recalculate --no-verify-jwt

   # Deploy driver report submission (validates caller's JWT)
   supabase functions deploy submit-driver-report
   ```

---

## 7. Environment Variables

Only two frontend variables are required:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous client API key | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |

Create a `.env.local` file for local development:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
> [!IMPORTANT]
> Never put the `SUPABASE_SERVICE_ROLE_KEY` in frontend `.env` files. Service role keys must only be used in server-side Edge Functions or offline seeding scripts.
