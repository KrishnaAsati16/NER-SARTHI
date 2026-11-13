-- ==============================================================================
-- NER-Sarthi Row Level Security (RLS) & Column-Level Access Control
-- Migration: 002_rls.sql
-- Description: Enables RLS on all 14 tables, creates get_user_role() helper,
--              defines policies, column privileges, and validation triggers.
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL 14 PUBLIC TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disruption_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_disruptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. HELPER FUNCTION: public.get_user_role()
-- ==============================================================================
-- Returns the role of the currently authenticated user from public.profiles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Revoke execute from public/anon; allow only authenticated sessions
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- ==============================================================================
-- 3. POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. Read-only Public Reference Tables (destinations, festivals, historical_disruptions, rss_items, weather_readings)
-- ------------------------------------------------------------------------------

-- destinations: allow anon and authenticated users to read tourism destination records
CREATE POLICY "Allow public read access for destinations"
ON public.destinations FOR SELECT
TO anon, authenticated
USING (true);

-- festivals: allow anon and authenticated users to read cultural festival records
CREATE POLICY "Allow public read access for festivals"
ON public.festivals FOR SELECT
TO anon, authenticated
USING (true);

-- historical_disruptions: allow anon and authenticated users to read historical disruption records
CREATE POLICY "Allow public read access for historical disruptions"
ON public.historical_disruptions FOR SELECT
TO anon, authenticated
USING (true);

-- rss_items: allow anon and authenticated users to read public RSS and advisory feeds
CREATE POLICY "Allow public read access for rss items"
ON public.rss_items FOR SELECT
TO anon, authenticated
USING (true);

-- weather_readings: allow anon and authenticated users to read live and recorded weather data
CREATE POLICY "Allow public read access for weather readings"
ON public.weather_readings FOR SELECT
TO anon, authenticated
USING (true);

-- ------------------------------------------------------------------------------
-- B. Officers Table
-- ------------------------------------------------------------------------------

-- officers: allow all authenticated staff to view the field officers directory
CREATE POLICY "Allow authenticated users to read officers"
ON public.officers FOR SELECT
TO authenticated
USING (true);

-- officers: allow only commanders to register new field officers
CREATE POLICY "Allow commanders to insert officers"
ON public.officers FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'commander');

-- officers: allow only commanders to update officer records and deployments
CREATE POLICY "Allow commanders to update officers"
ON public.officers FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'commander')
WITH CHECK (public.get_user_role() = 'commander');

-- officers: allow only commanders to remove officer records
CREATE POLICY "Allow commanders to delete officers"
ON public.officers FOR DELETE
TO authenticated
USING (public.get_user_role() = 'commander');

-- ------------------------------------------------------------------------------
-- C. Routes Table
-- ------------------------------------------------------------------------------

-- routes: allow all authenticated users to read corridor and route intelligence
CREATE POLICY "Allow authenticated users to read routes"
ON public.routes FOR SELECT
TO authenticated
USING (true);

-- routes: allow only commanders to create new route corridors
CREATE POLICY "Allow commanders to insert routes"
ON public.routes FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'commander');

-- routes: allow commanders full update, or assigned officers to update only their assigned route
CREATE POLICY "Allow commanders or assigned officers to update routes"
ON public.routes FOR UPDATE
TO authenticated
USING (
  (public.get_user_role() = 'commander') OR (
    public.get_user_role() = 'officer' AND
    EXISTS (
      SELECT 1 FROM public.officers o
      WHERE o.id = routes.assigned_officer_id
        AND o.profile_id = auth.uid()
    )
  )
)
WITH CHECK (
  (public.get_user_role() = 'commander') OR (
    public.get_user_role() = 'officer' AND
    EXISTS (
      SELECT 1 FROM public.officers o
      WHERE o.id = routes.assigned_officer_id
        AND o.profile_id = auth.uid()
    )
  )
);

-- routes: allow only commanders to delete route corridors
CREATE POLICY "Allow commanders to delete routes"
ON public.routes FOR DELETE
TO authenticated
USING (public.get_user_role() = 'commander');

-- ------------------------------------------------------------------------------
-- D. Vehicles Table
-- ------------------------------------------------------------------------------

-- vehicles: allow all authenticated personnel to track vehicle positions and statuses
CREATE POLICY "Allow authenticated users to read vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

-- vehicles: allow only commanders to register new vehicles to the fleet
CREATE POLICY "Allow commanders to insert vehicles"
ON public.vehicles FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'commander');

-- vehicles: allow commanders to update any vehicle, or drivers to update only their assigned vehicle
CREATE POLICY "Allow commanders or assigned drivers to update vehicles"
ON public.vehicles FOR UPDATE
TO authenticated
USING (
  (public.get_user_role() = 'commander') OR
  (public.get_user_role() = 'driver' AND driver_id = auth.uid())
)
WITH CHECK (
  (public.get_user_role() = 'commander') OR
  (public.get_user_role() = 'driver' AND driver_id = auth.uid())
);

-- vehicles: allow only commanders to decommission/delete vehicles from the fleet
CREATE POLICY "Allow commanders to delete vehicles"
ON public.vehicles FOR DELETE
TO authenticated
USING (public.get_user_role() = 'commander');

-- ------------------------------------------------------------------------------
-- E. Disruption Alerts Table
-- ------------------------------------------------------------------------------

-- disruption_alerts: allow all authenticated staff to monitor live disruption alerts
CREATE POLICY "Allow authenticated users to read disruption alerts"
ON public.disruption_alerts FOR SELECT
TO authenticated
USING (true);

-- disruption_alerts: allow only commanders to publish new disruption alerts
CREATE POLICY "Allow commanders to insert disruption alerts"
ON public.disruption_alerts FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'commander');

-- disruption_alerts: allow only commanders to modify disruption alerts
CREATE POLICY "Allow commanders to update disruption alerts"
ON public.disruption_alerts FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'commander')
WITH CHECK (public.get_user_role() = 'commander');

-- disruption_alerts: allow only commanders to delete or clear disruption alerts
CREATE POLICY "Allow commanders to delete disruption alerts"
ON public.disruption_alerts FOR DELETE
TO authenticated
USING (public.get_user_role() = 'commander');

-- ------------------------------------------------------------------------------
-- F. Driver Reports Table
-- ------------------------------------------------------------------------------

-- driver_reports: allow commanders and officers to see all reports, but drivers to see only their own
CREATE POLICY "Allow privileged staff to see all driver reports, drivers see own"
ON public.driver_reports FOR SELECT
TO authenticated
USING (
  (public.get_user_role() IN ('commander', 'officer')) OR
  (public.get_user_role() = 'driver' AND driver_id = auth.uid()::text)
);

-- driver_reports: allow drivers to submit observations only under their own authenticated driver ID
CREATE POLICY "Allow drivers to submit reports under their own id"
ON public.driver_reports FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role() = 'driver' AND
  driver_id = auth.uid()::text
);

-- ------------------------------------------------------------------------------
-- G. Social Reports Table
-- ------------------------------------------------------------------------------

-- social_reports: allow all authenticated staff to read curated social media feeds
CREATE POLICY "Allow authenticated users to read social reports"
ON public.social_reports FOR SELECT
TO authenticated
USING (true);

-- social_reports: allow commanders to ingest social media reports
CREATE POLICY "Allow commanders to insert social reports"
ON public.social_reports FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'commander');

-- social_reports: allow commanders to update social reports
CREATE POLICY "Allow commanders to update social reports"
ON public.social_reports FOR UPDATE
TO authenticated
USING (public.get_user_role() = 'commander')
WITH CHECK (public.get_user_role() = 'commander');

-- social_reports: allow commanders to remove social reports
CREATE POLICY "Allow commanders to delete social reports"
ON public.social_reports FOR DELETE
TO authenticated
USING (public.get_user_role() = 'commander');

-- ------------------------------------------------------------------------------
-- H. Profiles Table
-- ------------------------------------------------------------------------------

-- profiles: allow users to read their own profile, and commanders to read all profiles
CREATE POLICY "Allow users to read own profile, commanders read all"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (id = auth.uid()) OR
  (public.get_user_role() = 'commander')
);

-- profiles: allow users to update their own profile details only
CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- I. Notifications Table
-- ------------------------------------------------------------------------------

-- notifications: allow all authenticated users to read broadcast notifications
CREATE POLICY "Allow authenticated users to read notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (true);

-- notifications: allow only commanders to dispatch system notifications
CREATE POLICY "Allow commanders to insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role() = 'commander');

-- ------------------------------------------------------------------------------
-- J. Notification Reads Table
-- ------------------------------------------------------------------------------

-- notification_reads: allow users to query only their own read markers
CREATE POLICY "Allow users to view own notification read state"
ON public.notification_reads FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- notification_reads: allow users to mark notifications as read for themselves
CREATE POLICY "Allow users to mark notifications as read"
ON public.notification_reads FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- notification_reads: allow users to clear or reset their own read markers
CREATE POLICY "Allow users to delete own notification read state"
ON public.notification_reads FOR DELETE
TO authenticated
USING (user_id = auth.uid());


-- ==============================================================================
-- 4. COLUMN LIMITS AND MUTATION INTEGRITY TRIGGERS
-- ==============================================================================

-- A. Profiles Column Limits:
-- Restrict column-level UPDATE permissions on public.profiles so users cannot alter their role or id
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, username, designation) ON public.profiles TO authenticated;

-- B. Vehicles Column Limits Trigger:
-- Drivers may only update lat, lng, speed, status, and updated_at
CREATE OR REPLACE FUNCTION public.check_vehicle_driver_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Bypass check if executing in SQL editor / service role where auth.uid() is null
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.get_user_role() = 'driver' THEN
    IF (OLD.id IS DISTINCT FROM NEW.id) OR
       (OLD.cargo IS DISTINCT FROM NEW.cargo) OR
       (OLD.origin IS DISTINCT FROM NEW.origin) OR
       (OLD.destination IS DISTINCT FROM NEW.destination) OR
       (OLD.eta IS DISTINCT FROM NEW.eta) OR
       (OLD.eta_minutes IS DISTINCT FROM NEW.eta_minutes) OR
       (OLD.route_id IS DISTINCT FROM NEW.route_id) OR
       (OLD.risk IS DISTINCT FROM NEW.risk) OR
       (OLD.driver_name IS DISTINCT FROM NEW.driver_name) OR
       (OLD.driver_id IS DISTINCT FROM NEW.driver_id) OR
       (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
      RAISE EXCEPTION 'Drivers are only permitted to update status, speed, lat, and lng.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_vehicle_driver_columns ON public.vehicles;
CREATE TRIGGER trigger_enforce_vehicle_driver_columns
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.check_vehicle_driver_update();

-- C. Routes Column Limits Trigger:
-- Officers may not alter id, name, origin, destination, coordinates, assigned_officer_id, or sector
CREATE OR REPLACE FUNCTION public.check_route_officer_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Bypass check if executing in SQL editor / service role where auth.uid() is null
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.get_user_role() = 'officer' THEN
    IF (OLD.id IS DISTINCT FROM NEW.id) OR
       (OLD.name IS DISTINCT FROM NEW.name) OR
       (OLD.origin IS DISTINCT FROM NEW.origin) OR
       (OLD.destination IS DISTINCT FROM NEW.destination) OR
       (OLD.coordinates IS DISTINCT FROM NEW.coordinates) OR
       (OLD.assigned_officer_id IS DISTINCT FROM NEW.assigned_officer_id) OR
       (OLD.sector IS DISTINCT FROM NEW.sector) THEN
      RAISE EXCEPTION 'Officers are not permitted to modify core route parameters (id, name, origin, destination, coordinates, assigned officer, or sector).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_route_officer_columns ON public.routes;
CREATE TRIGGER trigger_enforce_route_officer_columns
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.check_route_officer_update();


-- ==============================================================================
-- 6. AUDIT: LIST PUBLIC TABLES WITH RLS BUT ZERO POLICIES
-- ==============================================================================
/*
SELECT
    t.schemaname,
    t.tablename,
    c.rowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.schemaname, t.tablename, c.rowsecurity
HAVING c.rowsecurity = true AND COUNT(p.policyname) = 0;

MENTAL AUDIT OF CLIENT-PROTECTED WRITE OPERATIONS:
--------------------------------------------------------------------------------
Every single one of the 14 public tables has at least one active policy.
No table has 0 policies.
The following tables are INTENTIONALLY write-locked for clients (SELECT-only):
1. destinations (client writes locked; managed via admin/migrations)
2. festivals (client writes locked; managed via admin/migrations)
3. historical_disruptions (client writes locked; historical dataset)
4. rss_items (client writes locked; automated crawler/service role feeds only)
5. weather_readings (client writes locked; sensor ingest/service role only)

The following tables are INTENTIONALLY locked for specific client actions:
6. profiles: INSERT locked (handled via handle_new_user auth trigger); DELETE locked
7. notifications: UPDATE and DELETE locked (append-only dispatch)
8. driver_reports: UPDATE and DELETE locked (immutable observation audit trail)
9. notification_reads: UPDATE locked (reads are binary marked or deleted)
*/


-- ==============================================================================
-- 7. TEST CHECKLIST & SEEDING INSTRUCTIONS
-- ==============================================================================
/*
--------------------------------------------------------------------------------
A. HOW TO CREATE 3 TEST USERS AND PROMOTE THEM WITH SQL:
--------------------------------------------------------------------------------
1. In the Supabase Dashboard -> Authentication -> Users, create 3 users with email/password:
   - commander@doner.gov.in (Commander)
   - arjun.mehta@rdrf.gov.in (Field Officer)
   - convoy.driver@driver.ner.in (Fleet Driver)

2. Note their UUIDs from auth.users and run the promotion query in the SQL Editor:

   -- Promote commander:
   UPDATE public.profiles
   SET role = 'commander', full_name = 'Commander Sharma', designation = 'Central Control Room Lead'
   WHERE id = '<COMMANDER_UUID>';

   -- Promote officer and link to officer record:
   UPDATE public.profiles
   SET role = 'officer', full_name = 'Inspector Arjun Mehta', designation = 'Field Operations Lead (RDRF)'
   WHERE id = '<OFFICER_UUID>';

   UPDATE public.officers
   SET profile_id = '<OFFICER_UUID>'
   WHERE id = 'OFF-001';

   -- Ensure driver has driver role and link to vehicle:
   UPDATE public.profiles
   SET role = 'driver', full_name = 'Ramesh Kumar', designation = 'Logistics Convoy Driver'
   WHERE id = '<DRIVER_UUID>';

   UPDATE public.vehicles
   SET driver_id = '<DRIVER_UUID>'
   WHERE id = 'V-001';

--------------------------------------------------------------------------------
B. SQL TEST SUITE CHECKLIST (Simulating Roles in SQL Editor):
--------------------------------------------------------------------------------

-- TEST 1: Anon can read routes? (SHOULD FAIL / RETURN 0 ROWS)
BEGIN;
  SET LOCAL ROLE anon;
  SET LOCAL request.jwt.claims = '{"role":"anon"}';
  SELECT count(*) FROM public.routes; -- Expect: 0 rows returned
ROLLBACK;

-- TEST 2: Anon can read destinations? (SHOULD SUCCEED)
BEGIN;
  SET LOCAL ROLE anon;
  SET LOCAL request.jwt.claims = '{"role":"anon"}';
  SELECT count(*) FROM public.destinations; -- Expect: returns count > 0
ROLLBACK;

-- TEST 3: Driver updating vehicle.risk? (SHOULD FAIL via trigger)
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub":"<DRIVER_UUID>","role":"authenticated"}';
  UPDATE public.vehicles SET risk = 95 WHERE id = 'V-001'; -- Expect: EXCEPTION 'Drivers are only permitted to update status, speed, lat, and lng.'
ROLLBACK;

-- TEST 4: Driver updating own vehicle.speed? (SHOULD SUCCEED)
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub":"<DRIVER_UUID>","role":"authenticated"}';
  UPDATE public.vehicles SET speed = 55 WHERE id = 'V-001'; -- Expect: 1 row updated
ROLLBACK;

-- TEST 5: User updating own profiles.role? (SHOULD FAIL via column grant)
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub":"<DRIVER_UUID>","role":"authenticated"}';
  UPDATE public.profiles SET role = 'commander' WHERE id = '<DRIVER_UUID>'; -- Expect: ERROR: permission denied for column "role"
ROLLBACK;

-- TEST 6: Commander inserting a route? (SHOULD SUCCEED)
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub":"<COMMANDER_UUID>","role":"authenticated"}';
  INSERT INTO public.routes (id, name, origin, destination, coordinates, status, risk, rain_risk, landslide_risk, landslide_probability, length_km)
  VALUES ('R-TEST-99', 'Test Highway', 'Guwahati', 'Nongpoh', '[[26.1, 91.7], [25.9, 91.8]]'::jsonb, 'clear', 10, 15, 'CLEAR', 5, 50); -- Expect: 1 row inserted
ROLLBACK;

-- TEST 7: Officer updating an unassigned route? (SHOULD FAIL / 0 ROWS UPDATED)
-- Route R-002 is assigned to OFF-002, so OFF-001 (Arjun Mehta) cannot update it
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub":"<OFFICER_UUID>","role":"authenticated"}';
  UPDATE public.routes SET risk = 80 WHERE id = 'R-002'; -- Expect: 0 rows updated due to RLS filter
ROLLBACK;

-- TEST 8: Driver inserting a driver_report with another driver's ID? (SHOULD FAIL)
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claims = '{"sub":"<DRIVER_UUID>","role":"authenticated"}';
  INSERT INTO public.driver_reports (id, driver_id, route_id, route_name, observation, severity, confidence)
  VALUES ('DR-TEST-99', 'SOME-OTHER-DRIVER-ID', 'R-001', 'Guwahati – Shillong Corridor', 'Testing spoof', 'low', 50); -- Expect: new row violates row-level security policy for table "driver_reports"
ROLLBACK;
*/
