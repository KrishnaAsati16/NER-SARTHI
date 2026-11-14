# NER-Sarthi
### AI-Powered Logistics & Road-Accessibility Intelligence for North East India

NER-Sarthi gives control-room commanders, field officers, and drivers a shared, real-time view of road corridors, convoys, and disruptions (landslides, heavy rainfall, road damage) across North East India — backed by a secure Supabase database with role-based access control.

## Features
- Live Command Dashboard with KPIs, risk charts, and a map
- Per-corridor Route Intelligence (landslide/weather/risk forecasts)
- AI Logistics Planner for route and vehicle what-if analysis
- Role-based access: Commander, Officer, Driver, and public visitors
- Real-time sync — disruption simulations and reports appear instantly for every logged-in user
- Driver Road Observation Reports from the field
- AI chatbot ("Sarthi AI") answering from live operational data
- Public Explore Northeast section (tourism destinations & cultural festivals)
- Scheduled server-side risk recalculation (Supabase Edge Function + cron)

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system design and [docs/SECURITY.md](docs/SECURITY.md) for a plain-English list of every access-control policy.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Leaflet, Recharts |
| Backend | Supabase (PostgreSQL, Auth, Row Level Security, Realtime, Edge Functions) |
| Scheduling | pg_cron + pg_net |
| Tooling | Supabase CLI, ESLint, tsx |

## Project Structure

```
src/
├── components/          # UI components
├── context/             # AppContext (app state), AuthContext (session/profile)
├── hooks/               # useRealtime.ts
├── lib/                 # Supabase client
├── pages/               # Route-level pages
├── services/            # Supabase queries, mapped to TS types
├── data/                # Bundled JSON (offline fallback / seed source)
├── types/               # Shared TypeScript interfaces
└── utils/               # riskEngine.ts and other helpers
supabase/
├── migrations/          # 001_schema, 002_rls, 003_functions, 004_realtime, 005_cron
└── functions/           # risk-recalculate, submit-driver-report (Edge Functions)
scripts/seed.ts          # Loads src/data/*.json into Supabase (local use only)
docs/SECURITY.md         # RLS policy reference
```

## Deploying Edge Functions (optional)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<key>" CRON_SECRET="<random-string>"
supabase functions deploy risk-recalculate --no-verify-jwt
supabase functions deploy submit-driver-report
```

## Deploying the Frontend

Deploy to Vercel/Netlify with these two environment variables only:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-publishable-anon-key>
```

In Supabase Authentication → URL Configuration, add your production domain to the Site URL and Redirect URLs.

## Roles at a Glance

| Role | Access |
|---|---|
| Commander | Full control: manage routes/officers/vehicles, run disruption simulations |
| Officer | View everything, update only their assigned route |
| Driver | View everything, update only their own vehicle, submit road reports |
| Visitor (logged out) | Public tourism/culture pages and general advisories only |

## License

This project is for educational/demo purposes.
