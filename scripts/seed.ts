import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 1. Load environment strictly from .env.seed in process.cwd()
const envSeedPath = path.resolve(process.cwd(), '.env.seed');
if (!fs.existsSync(envSeedPath)) {
  console.error('\n❌ ERROR: .env.seed file not found.');
  console.error('Please create .env.seed with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n');
  process.exit(1);
}

dotenv.config({ path: envSeedPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ ERROR: Missing required environment variables in .env.seed.');
  console.error('Required:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

// 2. Initialize Supabase Admin Client using Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Helper: Parse time strings (e.g. "11:24 AM", "2 min ago", ISO) into ISO Timestamptz for today
function parseTimeToTodayIso(timeStr?: string): string {
  if (!timeStr) return new Date().toISOString();

  // Already ISO or date format
  if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.length > 8)) {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Handle "X min ago"
  const minAgoMatch = timeStr.match(/(\d+)\s*min\s*ago/i);
  if (minAgoMatch) {
    const mins = parseInt(minAgoMatch[1], 10);
    const d = new Date(Date.now() - mins * 60 * 1000);
    return d.toISOString();
  }

  // Match standard clock times like "11:24 AM" or "1:30 PM"
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const meridiem = match[4]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const d = new Date();
    d.setHours(hours, minutes, seconds, 0);
    return d.toISOString();
  }

  const parsed = new Date(timeStr);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

// Helper to load JSON files from src/data
function loadJson<T>(filename: string): T {
  const filepath = path.resolve(process.cwd(), 'src', 'data', filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content) as T;
}

// Constant INITIAL_DISRUPTIONS and INITIAL_NOTIFICATIONS from AppContext.tsx
const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    alertKey: 'landslide_critical',
    severity: 'CRITICAL',
    titleKey: 'landslide_critical',
    messageKey: 'landslide_critical',
    region: 'Sikkim / East Sikkim',
    routeId: 'R-008',
    routeName: 'Gangtok – Nathu La Corridor',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'NOTIF-002',
    alertKey: 'landslide_warning',
    severity: 'HIGH',
    titleKey: 'landslide_warning',
    messageKey: 'landslide_warning',
    region: 'Meghalaya / East Khasi Hills',
    routeId: 'R-003',
    routeName: 'Shillong – Silchar Highway',
    timestamp: '8 min ago',
    read: false,
  },
  {
    id: 'NOTIF-003',
    alertKey: 'heavy_rain_warning',
    severity: 'MEDIUM',
    titleKey: 'heavy_rain_warning',
    messageKey: 'heavy_rain_warning',
    region: 'Assam / Sonitpur',
    routeId: 'R-002',
    routeName: 'Guwahati – Tezpur Highway',
    timestamp: '15 min ago',
    read: true,
  },
  {
    id: 'NOTIF-004',
    alertKey: 'weather_changing_low',
    severity: 'LOW',
    titleKey: 'weather_changing_low',
    messageKey: 'weather_changing_low',
    region: 'Mizoram / Aizawl',
    routeId: 'R-009',
    routeName: 'Silchar – Aizawl Highway',
    timestamp: '32 min ago',
    read: true,
  }
];

const INITIAL_DISRUPTIONS = [
  {
    id: 'ALERT-001',
    routeId: 'R-003',
    routeName: 'Shillong – Silchar Highway',
    title: 'Active Landslide & Mudslide Debris',
    severity: 'critical',
    timestamp: '11:28 AM',
    type: 'Landslide',
    description: 'Debris falling at Sonapur tunnel stretch. Route blocked.'
  },
  {
    id: 'ALERT-002',
    routeId: 'R-006',
    routeName: 'Dimapur – Kohima Highway',
    title: 'Road Surface Subsidence',
    severity: 'high',
    timestamp: '11:15 AM',
    type: 'Road Damage',
    description: 'Heavy cargo traffic restricted near Pagla Pahar.'
  },
  {
    id: 'ALERT-003',
    routeId: 'R-001',
    routeName: 'Guwahati – Shillong Corridor',
    title: 'Reduced Fog Visibility & Rain',
    severity: 'medium',
    timestamp: '11:10 AM',
    type: 'Heavy Rainfall',
    description: 'Visibility down to 4.2 km near Nongpoh.'
  },
  {
    id: 'ALERT-004',
    routeId: 'R-009',
    routeName: 'Silchar – Aizawl Highway',
    title: 'Rockfall Clearing Operations',
    severity: 'high',
    timestamp: '10:50 AM',
    type: 'Landslide',
    description: 'Single lane traffic moving under PWD supervision.'
  }
];

async function seed() {
  console.log('🚀 Starting NER-Sarthi Database Seeding...\n');

  // Load JSON datasets
  const officersRaw = loadJson<any[]>('officers.json');
  const routesRaw = loadJson<any[]>('routes.json');
  const vehiclesRaw = loadJson<any[]>('vehicles.json');
  const weatherRaw = loadJson<any[]>('weather.json');
  const driverReportsRaw = loadJson<any[]>('driverReports.json');
  const socialReportsRaw = loadJson<any[]>('socialReports.json');
  const historicalDisruptionsRaw = loadJson<any[]>('historicalDisruptions.json');
  const rssRaw = loadJson<any[]>('rss.json');
  const destinationsRaw = loadJson<any[]>('destinations.json');
  const festivalsRaw = loadJson<any[]>('festivals.json');

  // Route integrity check for INITIAL_DISRUPTIONS and INITIAL_NOTIFICATIONS
  const knownRouteIds = new Set(routesRaw.map((r: any) => r.id));

  for (const d of INITIAL_DISRUPTIONS) {
    if (d.routeId && !knownRouteIds.has(d.routeId)) {
      console.error(`❌ Integrity Check Failed: Disruption ${d.id} references unknown routeId '${d.routeId}'.`);
      process.exit(1);
    }
  }

  for (const n of INITIAL_NOTIFICATIONS) {
    if (n.routeId && !knownRouteIds.has(n.routeId)) {
      console.error(`❌ Integrity Check Failed: Notification ${n.id} references unknown routeId '${n.routeId}'.`);
      process.exit(1);
    }
  }

  console.log('✅ Integrity check passed: All initial disruption & notification route references exist.');

  // ============================================================================
  // Step 1: Officers
  // ============================================================================
  console.log('\n[1/11] Seeding officers...');
  const officersData = officersRaw.map((o: any) => ({
    id: o.id,
    name: o.name,
    department: o.department,
    rank: o.rank,
    control_room: o.controlRoom,
    status: o.status,
    location: o.location,
    lat: o.lat,
    lng: o.lng,
    last_update: parseTimeToTodayIso(o.lastUpdate),
    last_report: o.lastReport,
    sector: o.sector
  }));

  const { error: officersErr } = await supabase
    .from('officers')
    .upsert(officersData, { onConflict: 'id' });
  if (officersErr) throw new Error(`Failed to seed officers: ${officersErr.message}`);

  // ============================================================================
  // Step 2: Routes
  // ============================================================================
  console.log('[2/11] Seeding routes...');
  const routesData = routesRaw.map((r: any) => ({
    id: r.id,
    name: r.name,
    origin: r.origin,
    destination: r.destination,
    coordinates: r.coordinates,
    status: r.status,
    risk: r.risk,
    rain_risk: r.rainRisk,
    landslide_risk: r.landslideRisk,
    landslide_probability: r.landslideProbability,
    visibility: r.visibility,
    source: r.source,
    confidence: r.confidence,
    last_updated: parseTimeToTodayIso(r.lastUpdated),
    next_update_minutes: r.nextUpdateMinutes,
    assigned_officer_id: r.assignedOfficerId,
    sector: r.sector,
    length_km: r.lengthKm
  }));

  const { error: routesErr } = await supabase
    .from('routes')
    .upsert(routesData, { onConflict: 'id' });
  if (routesErr) throw new Error(`Failed to seed routes: ${routesErr.message}`);

  // ============================================================================
  // Step 3: Vehicles
  // ============================================================================
  console.log('[3/11] Seeding vehicles...');
  const vehiclesData = vehiclesRaw.map((v: any) => ({
    id: v.id,
    cargo: v.cargo,
    origin: v.origin,
    destination: v.destination,
    eta: v.eta,
    eta_minutes: v.etaMinutes,
    status: v.status,
    lat: v.lat,
    lng: v.lng,
    speed: v.speed,
    route_id: v.routeId,
    risk: v.risk,
    driver_name: v.driverName
  }));

  const { error: vehiclesErr } = await supabase
    .from('vehicles')
    .upsert(vehiclesData, { onConflict: 'id' });
  if (vehiclesErr) throw new Error(`Failed to seed vehicles: ${vehiclesErr.message}`);

  // ============================================================================
  // Step 4: Weather Readings (Delete all existing rows, then insert fresh)
  // ============================================================================
  console.log('[4/11] Seeding weather_readings (delete existing then insert)...');
  const { error: weatherDelErr } = await supabase
    .from('weather_readings')
    .delete()
    .not('id', 'is', null);
  if (weatherDelErr) throw new Error(`Failed to clear weather_readings: ${weatherDelErr.message}`);

  const weatherData = weatherRaw.map((w: any) => ({
    district: w.district,
    state: w.state,
    temperature: w.temperature,
    rainfall: w.rainfall,
    rain_probability: w.rainProbability,
    visibility: w.visibility,
    wind: w.wind,
    landslide_risk: w.landslideRisk,
    recorded_at: new Date().toISOString()
  }));

  const { error: weatherInsertErr } = await supabase
    .from('weather_readings')
    .insert(weatherData);
  if (weatherInsertErr) throw new Error(`Failed to insert weather_readings: ${weatherInsertErr.message}`);

  // ============================================================================
  // Step 5: Disruption Alerts
  // ============================================================================
  console.log('[5/11] Seeding disruption_alerts...');
  const disruptionsData = INITIAL_DISRUPTIONS.map((d: any) => ({
    id: d.id,
    route_id: d.routeId,
    route_name: d.routeName,
    title: d.title,
    severity: d.severity,
    type: d.type,
    description: d.description,
    created_at: parseTimeToTodayIso(d.timestamp)
  }));

  const { error: disruptionsErr } = await supabase
    .from('disruption_alerts')
    .upsert(disruptionsData, { onConflict: 'id' });
  if (disruptionsErr) throw new Error(`Failed to seed disruption_alerts: ${disruptionsErr.message}`);

  // ============================================================================
  // Step 6: Driver Reports
  // ============================================================================
  console.log('[6/11] Seeding driver_reports...');
  const driverReportsData = driverReportsRaw.map((dr: any) => ({
    id: dr.id,
    driver_id: dr.driverId,
    route_id: dr.routeId,
    route_name: dr.routeName,
    observation: dr.observation,
    severity: dr.severity,
    confidence: dr.confidence,
    created_at: parseTimeToTodayIso(dr.timestamp)
  }));

  const { error: driverReportsErr } = await supabase
    .from('driver_reports')
    .upsert(driverReportsData, { onConflict: 'id' });
  if (driverReportsErr) throw new Error(`Failed to seed driver_reports: ${driverReportsErr.message}`);

  // ============================================================================
  // Step 7: Social Reports
  // ============================================================================
  console.log('[7/11] Seeding social_reports...');
  const socialReportsData = socialReportsRaw.map((sr: any) => ({
    id: sr.id,
    handle: sr.handle,
    route_id: sr.routeId,
    route_name: sr.routeName,
    content: sr.content,
    severity: sr.severity,
    confidence: sr.confidence,
    created_at: parseTimeToTodayIso(sr.timestamp)
  }));

  const { error: socialReportsErr } = await supabase
    .from('social_reports')
    .upsert(socialReportsData, { onConflict: 'id' });
  if (socialReportsErr) throw new Error(`Failed to seed social_reports: ${socialReportsErr.message}`);

  // ============================================================================
  // Step 8: Historical Disruptions
  // ============================================================================
  console.log('[8/11] Seeding historical_disruptions...');
  const historicalDisruptionsData = historicalDisruptionsRaw.map((hd: any) => ({
    id: hd.id,
    date: hd.date,
    district: hd.district,
    cause: hd.cause,
    severity: hd.severity,
    clearance_hours: hd.clearanceHours
  }));

  const { error: historicalDisruptionsErr } = await supabase
    .from('historical_disruptions')
    .upsert(historicalDisruptionsData, { onConflict: 'id' });
  if (historicalDisruptionsErr) throw new Error(`Failed to seed historical_disruptions: ${historicalDisruptionsErr.message}`);

  // ============================================================================
  // Step 9: RSS Items
  // ============================================================================
  console.log('[9/11] Seeding rss_items...');
  const rssData = rssRaw.map((item: any) => ({
    id: item.id,
    title: item.title,
    source: item.source,
    category: item.category,
    summary: item.summary,
    published_at: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString()
  }));

  const { error: rssErr } = await supabase
    .from('rss_items')
    .upsert(rssData, { onConflict: 'id' });
  if (rssErr) throw new Error(`Failed to seed rss_items: ${rssErr.message}`);

  // ============================================================================
  // Step 10: Destinations & Festivals
  // ============================================================================
  console.log('[10/11] Seeding destinations and festivals...');
  const destinationsData = destinationsRaw.map((d: any) => ({
    id: d.id,
    name: d.name,
    state: d.state,
    category: d.category,
    description: d.description,
    image: d.image,
    highlights: d.highlights || []
  }));

  const { error: destinationsErr } = await supabase
    .from('destinations')
    .upsert(destinationsData, { onConflict: 'id' });
  if (destinationsErr) throw new Error(`Failed to seed destinations: ${destinationsErr.message}`);

  const festivalsData = festivalsRaw.map((f: any) => ({
    id: f.id,
    name: f.name,
    state: f.state,
    month: f.month,
    description: f.description,
    image: f.image,
    highlights: f.highlights || []
  }));

  const { error: festivalsErr } = await supabase
    .from('festivals')
    .upsert(festivalsData, { onConflict: 'id' });
  if (festivalsErr) throw new Error(`Failed to seed festivals: ${festivalsErr.message}`);

  // ============================================================================
  // Step 11: Notifications
  // ============================================================================
  console.log('[11/11] Seeding notifications...');
  const notificationsData = INITIAL_NOTIFICATIONS.map((n: any) => ({
    id: n.id,
    alert_key: n.alertKey,
    severity: n.severity,
    title_key: n.titleKey,
    message_key: n.messageKey,
    region: n.region,
    route_id: n.routeId,
    route_name: n.routeName,
    created_at: parseTimeToTodayIso(n.timestamp)
  }));

  const { error: notificationsErr } = await supabase
    .from('notifications')
    .upsert(notificationsData, { onConflict: 'id' });
  if (notificationsErr) throw new Error(`Failed to seed notifications: ${notificationsErr.message}`);

  // ============================================================================
  // Summary & Row Counts
  // ============================================================================
  console.log('\n📊 Fetching final database row counts...\n');

  const tables = [
    'officers',
    'routes',
    'vehicles',
    'weather_readings',
    'disruption_alerts',
    'driver_reports',
    'social_reports',
    'historical_disruptions',
    'rss_items',
    'destinations',
    'festivals',
    'notifications'
  ];

  const counts: Record<string, number> = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    counts[table] = error ? -1 : (count ?? 0);
  }

  console.table(
    Object.entries(counts).map(([table, count]) => ({
      'Table Name': table,
      'Row Count': count >= 0 ? count : 'Error fetching'
    }))
  );

  console.log('🎉 Seeding successfully completed!\n');
}

seed().catch((err) => {
  console.error('\n❌ Uncaught error during seeding:', err);
  process.exit(1);
});
