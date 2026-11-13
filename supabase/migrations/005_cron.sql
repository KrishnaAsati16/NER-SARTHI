-- ==============================================================================
-- 005_cron.sql
-- Periodic Route Risk Recalculation via pg_cron and pg_net
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- CONFIGURATION INSTRUCTIONS:
-- Run the following commands separately in your Supabase SQL editor with your
-- actual project reference URL and generated secret:
--
-- ALTER DATABASE postgres SET app.settings.edge_function_url = 'https://<project-ref>.supabase.co/functions/v1/risk-recalculate';
-- ALTER DATABASE postgres SET app.settings.cron_secret = '<your-generated-cron-secret>';
-- ------------------------------------------------------------------------------

-- 1. Ensure required background job and networking extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Safely remove any existing scheduled job with the same identifier
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'ner-sarthi-risk-recalculate'
  ) THEN
    PERFORM cron.unschedule('ner-sarthi-risk-recalculate');
  END IF;
END $$;

-- 3. Schedule automated route risk recalculation every 15 minutes
-- Reads URL and Secret dynamically from Postgres database settings
SELECT cron.schedule(
  'ner-sarthi-risk-recalculate',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_function_url', true),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
