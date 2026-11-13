# Security & Row Level Security (RLS) Reference

This document summarizes the access control policies configured across the 14 public database tables in **NER-Sarthi** (`supabase/migrations/002_rls.sql`). Row Level Security is active on every table. User role evaluation is securely executed using `public.get_user_role()`.

---

## 1. Public Reference Tables (Read-Only)
- **`destinations` (SELECT)**: Anyone (anonymous visitors and authenticated users) can view tourism destinations.
- **`festivals` (SELECT)**: Anyone (anonymous visitors and authenticated users) can view cultural festival calendars.
- **`historical_disruptions` (SELECT)**: Anyone (anonymous visitors and authenticated users) can read historical disruption archives.
- **`rss_items` (SELECT)**: Anyone (anonymous visitors and authenticated users) can read public RSS advisories and news feeds.
- **`weather_readings` (SELECT)**: Anyone (anonymous visitors and authenticated users) can read regional weather sensor readings.

---

## 2. Operational Tables

### A. Officers (`officers`)
- **SELECT**: All authenticated users can view the officer roster.
- **INSERT**: Only commanders can register new field officers.
- **UPDATE**: Only commanders can update officer records and assignments.
- **DELETE**: Only commanders can remove officer records.

### B. Route Intelligence (`routes`)
- **SELECT**: All authenticated users can view route segments, risk ratings, and telemetry.
- **INSERT**: Only commanders can create new route corridors.
- **UPDATE**: Commanders can update any route, while officers can update only the route assigned to them.
- **DELETE**: Only commanders can delete route corridors.

### C. Fleet Logistics (`vehicles`)
- **SELECT**: All authenticated users can view fleet tracking data.
- **INSERT**: Only commanders can register new vehicles.
- **UPDATE**: Commanders can update any vehicle, while drivers can update only their assigned vehicle (restricted by trigger to telemetry: `lat`, `lng`, `speed`, `status`).
- **DELETE**: Only commanders can decommission/delete vehicles.

### D. Disruption Alerts (`disruption_alerts`)
- **SELECT**: All authenticated users can read active disruption alerts.
- **INSERT**: Only commanders can publish disruption alerts.
- **UPDATE**: Only commanders can modify disruption alerts.
- **DELETE**: Only commanders can delete or clear disruption alerts.

### E. Driver Reports (`driver_reports`)
- **SELECT**: Commanders and officers can see all driver reports; drivers can view only their own submitted reports.
- **INSERT**: Only drivers can submit reports, and the report must be tied to their own authenticated driver ID.

### F. Social Reports (`social_reports`)
- **SELECT**: All authenticated users can read ingested social media reports.
- **INSERT**: Only commanders can ingest or add social reports.
- **UPDATE**: Only commanders can modify social reports.
- **DELETE**: Only commanders can delete social reports.

### G. User Profiles (`profiles`)
- **SELECT**: Users can read their own profile; commanders can read all user profiles.
- **UPDATE**: Users can update their own profile details only (column grants restrict changes to `full_name`, `username`, and `designation`; `role` is immutable via client).

### H. Broadcast Notifications (`notifications`)
- **SELECT**: All authenticated users can view broadcast system notifications.
- **INSERT**: Only commanders can dispatch system notifications.

### I. Notification Read Receipts (`notification_reads`)
- **SELECT**: Authenticated users can view only their own read markers.
- **INSERT**: Authenticated users can mark notifications as read only for themselves.
- **DELETE**: Authenticated users can clear or delete only their own read markers.
