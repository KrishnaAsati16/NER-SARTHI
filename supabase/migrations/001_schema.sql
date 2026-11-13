-- ==============================================================================
-- NER-Sarthi Database Schema
-- Migration: 001_schema.sql
-- Description: Core tables, foreign keys, indexes, and triggers for public schema
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT,
    designation TEXT,
    role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('officer', 'commander', 'driver')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. OFFICERS TABLE
CREATE TABLE IF NOT EXISTS public.officers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    rank TEXT,
    control_room TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Break', 'In Transit')),
    location TEXT,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    last_update TIMESTAMPTZ,
    last_report TEXT,
    sector TEXT,
    profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- Array of [lat, lng] coordinates
    status TEXT NOT NULL DEFAULT 'clear' CHECK (status IN ('clear', 'at-risk', 'blocked')),
    risk INT NOT NULL DEFAULT 0 CHECK (risk >= 0 AND risk <= 100),
    rain_risk INT NOT NULL DEFAULT 0 CHECK (rain_risk >= 0 AND rain_risk <= 100),
    landslide_risk TEXT NOT NULL DEFAULT 'CLEAR' CHECK (landslide_risk IN ('CLEAR', 'MONITOR', 'BLOCKED')),
    landslide_probability INT NOT NULL DEFAULT 0 CHECK (landslide_probability >= 0 AND landslide_probability <= 100),
    visibility NUMERIC,
    source TEXT,
    confidence INT,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_update_minutes INT NOT NULL DEFAULT 180,
    assigned_officer_id TEXT REFERENCES public.officers(id) ON DELETE SET NULL,
    sector TEXT,
    length_km NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    cargo TEXT NOT NULL CHECK (cargo IN ('Medicine', 'Food', 'Construction Material', 'Agri-Produce')),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    eta TEXT,
    eta_minutes INT,
    status TEXT NOT NULL DEFAULT 'On Route' CHECK (status IN ('On Route', 'Delayed', 'Stationary', 'Arrived')),
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    speed NUMERIC NOT NULL DEFAULT 0,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    risk INT NOT NULL DEFAULT 0 CHECK (risk >= 0 AND risk <= 100),
    driver_name TEXT,
    driver_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WEATHER READINGS TABLE
CREATE TABLE IF NOT EXISTS public.weather_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    temperature NUMERIC,
    rainfall NUMERIC,
    rain_probability INT CHECK (rain_probability >= 0 AND rain_probability <= 100),
    visibility NUMERIC,
    wind NUMERIC,
    landslide_risk TEXT CHECK (landslide_risk IN ('CLEAR', 'MONITOR', 'BLOCKED')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DISRUPTION ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.disruption_alerts (
    id TEXT PRIMARY KEY,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route_name TEXT,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    type TEXT NOT NULL CHECK (type IN ('Landslide', 'Heavy Rainfall', 'Vehicle Delay', 'Road Damage', 'Cleared')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DRIVER REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.driver_reports (
    id TEXT PRIMARY KEY,
    driver_id TEXT,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route_name TEXT,
    observation TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SOCIAL REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.social_reports (
    id TEXT PRIMARY KEY,
    handle TEXT NOT NULL,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route_name TEXT,
    content TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. HISTORICAL DISRUPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.historical_disruptions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    district TEXT NOT NULL,
    cause TEXT NOT NULL CHECK (cause IN ('Landslide', 'Flood', 'Accident', 'Road Damage', 'Other')),
    severity TEXT,
    clearance_hours NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. RSS ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.rss_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT,
    category TEXT,
    summary TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE & NOTIFICATION_READS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    alert_key TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title_key TEXT,
    message_key TEXT,
    custom_title TEXT,
    custom_message TEXT,
    region TEXT,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_reads (
    notification_id TEXT NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (notification_id, user_id)
);

-- 12. DESTINATIONS TABLE (TourismDestination)
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    highlights TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. FESTIVALS TABLE (CulturalFestival)
CREATE TABLE IF NOT EXISTS public.festivals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    month TEXT NOT NULL,
    description TEXT,
    image TEXT,
    highlights TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES (Foreign Keys & created_at / timestamp columns)
-- ==============================================================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_officers_profile_id ON public.officers(profile_id);
CREATE INDEX IF NOT EXISTS idx_routes_assigned_officer_id ON public.routes(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_route_id ON public.vehicles(route_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_disruption_alerts_route_id ON public.disruption_alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_driver_reports_route_id ON public.driver_reports(route_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_route_id ON public.social_reports(route_id);
CREATE INDEX IF NOT EXISTS idx_notifications_route_id ON public.notifications(route_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON public.notification_reads(user_id);

-- Timestamp / created_at indexes
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_officers_created_at ON public.officers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_officers_last_update ON public.officers(last_update DESC);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON public.routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routes_last_updated ON public.routes(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_readings_recorded_at ON public.weather_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_readings_created_at ON public.weather_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disruption_alerts_created_at ON public.disruption_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_reports_created_at ON public.driver_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_reports_created_at ON public.social_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historical_disruptions_date ON public.historical_disruptions(date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_disruptions_created_at ON public.historical_disruptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rss_items_published_at ON public.rss_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_rss_items_created_at ON public.rss_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_reads_read_at ON public.notification_reads(read_at DESC);
CREATE INDEX IF NOT EXISTS idx_destinations_created_at ON public.destinations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_festivals_created_at ON public.festivals(created_at DESC);

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================

-- Trigger function: Update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to routes and vehicles
DROP TRIGGER IF EXISTS trigger_routes_updated_at ON public.routes;
CREATE TRIGGER trigger_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trigger_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger function: Automatically create profiles row upon auth.users insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        username,
        designation,
        role,
        created_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(COALESCE(NEW.email, ''), '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'designation', ''),
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data->>'role' IN ('officer', 'commander', 'driver') 
                THEN NEW.raw_user_meta_data->>'role'
                ELSE NULL
            END,
            'driver'
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Listen on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
