-- ==============================================================================
-- 004_realtime.sql
-- Enables Supabase Realtime publication for NER-Sarthi operational tables
-- Idempotent check ensures no error if tables are already in the publication
-- ==============================================================================

DO $$
BEGIN
  -- 1. Routes table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'routes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.routes;
  END IF;

  -- 2. Vehicles table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'vehicles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
  END IF;

  -- 3. Disruption alerts table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'disruption_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.disruption_alerts;
  END IF;

  -- 4. Notifications table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  -- 5. Driver reports table (for future live operational report tracking)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'driver_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_reports;
  END IF;
END $$;
