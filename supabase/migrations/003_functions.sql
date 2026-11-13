-- ==============================================================================
-- NER-Sarthi Simulation Functions
-- Migration: 003_functions.sql
-- Description: Server-side simulation RPCs with commander role enforcement
-- ==============================================================================

-- 1. SIMULATE LANDSLIDE
CREATE OR REPLACE FUNCTION public.simulate_landslide(p_route_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_name text;
  v_sector text;
  v_alert_id text;
  v_notif_id text;
BEGIN
  -- Strict role verification
  IF public.get_user_role() != 'commander' THEN
    RAISE EXCEPTION 'Only commanders can run this action';
  END IF;

  -- Verify route exists and retrieve metadata
  SELECT name, sector INTO v_route_name, v_sector 
  FROM public.routes 
  WHERE id = p_route_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Route corridor % not found', p_route_id;
  END IF;

  -- 1. Update route to BLOCKED
  UPDATE public.routes
  SET 
    status = 'blocked',
    risk = 94,
    landslide_probability = 95,
    landslide_risk = 'BLOCKED',
    rain_risk = 88,
    visibility = 1.5,
    last_updated = NOW()
  WHERE id = p_route_id;

  -- 2. Delay active vehicles traveling on this route
  UPDATE public.vehicles
  SET 
    status = 'Delayed',
    risk = 90,
    speed = 5,
    eta = CASE 
      WHEN eta NOT LIKE '%Delayed%' THEN eta || ' (Delayed)' 
      ELSE eta 
    END
  WHERE route_id = p_route_id;

  -- 3. Insert Disruption Alert
  v_alert_id := 'ALERT-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.disruption_alerts (
    id,
    route_id,
    route_name,
    title,
    severity,
    type,
    description,
    created_at
  ) VALUES (
    v_alert_id,
    p_route_id,
    v_route_name,
    'SIMULATION: Major Landslide on ' || v_route_name,
    'critical',
    'Landslide',
    'Massive slope collapse and debris obstruction reported along ' || v_route_name || ' (' || COALESCE(v_sector, 'Corridor') || '). Route blocked, rerouting recommended.',
    NOW()
  );

  -- 4. Insert System Notification
  v_notif_id := 'NOTIF-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.notifications (
    id,
    alert_key,
    severity,
    title_key,
    message_key,
    custom_title,
    custom_message,
    region,
    route_id,
    route_name,
    created_at
  ) VALUES (
    v_notif_id,
    'landslide_critical',
    'CRITICAL',
    'landslide_critical',
    'landslide_critical',
    'CRITICAL: Landslide on ' || v_route_name,
    'Severe slope collapse blocking corridor in ' || COALESCE(v_sector, 'North East Corridor') || '.',
    COALESCE(v_sector, 'North East Corridor'),
    p_route_id,
    v_route_name,
    NOW()
  );
END;
$$;

-- 2. SIMULATE HEAVY RAIN
CREATE OR REPLACE FUNCTION public.simulate_heavy_rain(p_route_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_name text;
  v_sector text;
  v_alert_id text;
  v_notif_id text;
BEGIN
  -- Strict role verification
  IF public.get_user_role() != 'commander' THEN
    RAISE EXCEPTION 'Only commanders can run this action';
  END IF;

  -- Verify route exists and retrieve metadata
  SELECT name, sector INTO v_route_name, v_sector 
  FROM public.routes 
  WHERE id = p_route_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Route corridor % not found', p_route_id;
  END IF;

  -- 1. Update route to AT-RISK
  UPDATE public.routes
  SET 
    status = CASE WHEN status = 'clear' THEN 'at-risk' ELSE status END,
    risk = LEAST(100, risk + 35),
    rain_risk = 85,
    landslide_risk = CASE WHEN landslide_risk = 'CLEAR' THEN 'MONITOR' ELSE landslide_risk END,
    visibility = 2.0,
    last_updated = NOW()
  WHERE id = p_route_id;

  -- 2. Insert Disruption Alert
  v_alert_id := 'ALERT-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.disruption_alerts (
    id,
    route_id,
    route_name,
    title,
    severity,
    type,
    description,
    created_at
  ) VALUES (
    v_alert_id,
    p_route_id,
    v_route_name,
    'SIMULATION: Heavy Monsoon Downpour on ' || v_route_name,
    'medium',
    'Heavy Rainfall',
    'Torrential rainfall outburst detected along ' || v_route_name || '. Visibility reduced to 2.0km with waterlogging risk.',
    NOW()
  );

  -- 3. Insert System Notification
  v_notif_id := 'NOTIF-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.notifications (
    id,
    alert_key,
    severity,
    title_key,
    message_key,
    custom_title,
    custom_message,
    region,
    route_id,
    route_name,
    created_at
  ) VALUES (
    v_notif_id,
    'heavy_rain_warning',
    'MEDIUM',
    'heavy_rain_warning',
    'heavy_rain_warning',
    'Heavy Rainfall Alert: ' || v_route_name,
    'Severe rainfall and reduced visibility along ' || COALESCE(v_sector, 'North East Corridor') || '.',
    COALESCE(v_sector, 'North East Corridor'),
    p_route_id,
    v_route_name,
    NOW()
  );
END;
$$;

-- 3. SIMULATE VEHICLE DELAY
CREATE OR REPLACE FUNCTION public.simulate_vehicle_delay(p_vehicle_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_id text;
  v_route_name text;
  v_sector text;
  v_alert_id text;
  v_notif_id text;
BEGIN
  -- Strict role verification
  IF public.get_user_role() != 'commander' THEN
    RAISE EXCEPTION 'Only commanders can run this action';
  END IF;

  -- Verify vehicle exists and retrieve route reference
  SELECT route_id INTO v_route_id
  FROM public.vehicles
  WHERE id = p_vehicle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle % not found', p_vehicle_id;
  END IF;

  -- Retrieve route name and sector if assigned
  IF v_route_id IS NOT NULL THEN
    SELECT name, sector INTO v_route_name, v_sector 
    FROM public.routes 
    WHERE id = v_route_id;
  END IF;

  -- 1. Update vehicle status to Delayed
  UPDATE public.vehicles
  SET 
    status = 'Delayed',
    risk = 90,
    speed = 5,
    eta = CASE 
      WHEN eta NOT LIKE '%Delayed%' THEN eta || ' (Delayed)' 
      ELSE eta 
    END
  WHERE id = p_vehicle_id;

  -- 2. Insert Disruption Alert
  v_alert_id := 'ALERT-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.disruption_alerts (
    id,
    route_id,
    route_name,
    title,
    severity,
    type,
    description,
    created_at
  ) VALUES (
    v_alert_id,
    v_route_id,
    COALESCE(v_route_name, 'NER Fleet Network'),
    'SIMULATION: Delivery Bottleneck for Vehicle ' || p_vehicle_id,
    'medium',
    'Vehicle Delay',
    'Vehicle ' || p_vehicle_id || ' encountered severe gradient bottleneck and mountain road slowdown. Arrival ETA pushed back.',
    NOW()
  );

  -- 3. Insert System Notification
  v_notif_id := 'NOTIF-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.notifications (
    id,
    alert_key,
    severity,
    title_key,
    message_key,
    custom_title,
    custom_message,
    region,
    route_id,
    route_name,
    created_at
  ) VALUES (
    v_notif_id,
    'vehicle_delay_notice',
    'MEDIUM',
    'vehicle_delay_notice',
    'vehicle_delay_notice',
    'Convoy Delay Notice: ' || p_vehicle_id,
    'Vehicle ' || p_vehicle_id || ' marked delayed along ' || COALESCE(v_route_name, 'operational corridor') || '.',
    COALESCE(v_sector, 'Assam / Meghalaya'),
    v_route_id,
    v_route_name,
    NOW()
  );
END;
$$;

-- 4. CLEAR ROUTE
CREATE OR REPLACE FUNCTION public.clear_route(p_route_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_name text;
  v_sector text;
  v_alert_id text;
  v_notif_id text;
BEGIN
  -- Strict role verification
  IF public.get_user_role() != 'commander' THEN
    RAISE EXCEPTION 'Only commanders can run this action';
  END IF;

  -- Verify route exists and retrieve metadata
  SELECT name, sector INTO v_route_name, v_sector 
  FROM public.routes 
  WHERE id = p_route_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Route corridor % not found', p_route_id;
  END IF;

  -- 1. Restore route to CLEAR
  UPDATE public.routes
  SET 
    status = 'clear',
    risk = 10,
    landslide_risk = 'CLEAR',
    landslide_probability = 5,
    rain_risk = 10,
    visibility = 10.0,
    last_updated = NOW()
  WHERE id = p_route_id;

  -- 2. Restore vehicles on this route
  UPDATE public.vehicles
  SET 
    status = 'On Route',
    risk = 20,
    speed = 45,
    eta = 'On Schedule'
  WHERE route_id = p_route_id;

  -- 3. Insert Disruption Alert (Cleared)
  v_alert_id := 'ALERT-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.disruption_alerts (
    id,
    route_id,
    route_name,
    title,
    severity,
    type,
    description,
    created_at
  ) VALUES (
    v_alert_id,
    p_route_id,
    v_route_name,
    'SIMULATION: Corridor Cleared - ' || v_route_name,
    'low',
    'Cleared',
    'BRO and PWD clearance operations completed. Route restored to normal clear status.',
    NOW()
  );

  -- 4. Insert System Notification
  v_notif_id := 'NOTIF-' || EXTRACT(epoch FROM NOW())::bigint || '-' || substr(md5(random()::text), 1, 4);
  INSERT INTO public.notifications (
    id,
    alert_key,
    severity,
    title_key,
    message_key,
    custom_title,
    custom_message,
    region,
    route_id,
    route_name,
    created_at
  ) VALUES (
    v_notif_id,
    'corridor_cleared_low',
    'LOW',
    'corridor_cleared_low',
    'corridor_cleared_low',
    'Corridor Cleared: ' || v_route_name,
    'Clearance operations concluded. Corridor traffic restored.',
    COALESCE(v_sector, 'North East Corridor'),
    p_route_id,
    v_route_name,
    NOW()
  );
END;
$$;

-- ==============================================================================
-- GRANTS: Authenticated users can invoke RPCs; role logic inside validates commander
-- ==============================================================================
GRANT EXECUTE ON FUNCTION public.simulate_landslide(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simulate_heavy_rain(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.simulate_vehicle_delay(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_route(text) TO authenticated;
