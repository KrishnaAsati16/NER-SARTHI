import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// --- Risk Engine Formulas (Ported from src/utils/riskEngine.ts) ---

function calculateRainRisk(rainfallMm: number, probabilityPercent: number): number {
  const intensityFactor = Math.min(100, (rainfallMm / 100) * 100);
  return Math.round((intensityFactor * 0.6) + (probabilityPercent * 0.4));
}

function getVisibilityRiskScore(visibilityKm: number): number {
  if (visibilityKm >= 8) return 10;
  if (visibilityKm >= 5) return 30;
  if (visibilityKm >= 2) return 65;
  return 92;
}

function calculateLandslideState(rainRisk: number, landslideProb: number): 'CLEAR' | 'MONITOR' | 'BLOCKED' {
  if (landslideProb >= 80 || rainRisk >= 85) return 'BLOCKED';
  if (landslideProb >= 35 || rainRisk >= 45) return 'MONITOR';
  return 'CLEAR';
}

function findMatchingWeather(route: any, weatherReadings: any[]): any[] {
  if (!weatherReadings || weatherReadings.length === 0) return [];

  // Match by sector, origin, destination or name keywords
  const searchTerms = [
    route.origin,
    route.destination,
    route.name,
    route.sector,
  ]
    .filter(Boolean)
    .flatMap((s: string) => s.split(/[–—\-\/,]/).map((w: string) => w.trim().toLowerCase()))
    .filter((w: string) => w.length > 2);

  const matched = weatherReadings.filter((w: any) => {
    const district = (w.district || '').toLowerCase();
    const state = (w.state || '').toLowerCase();
    return searchTerms.some((term: string) => district.includes(term) || state.includes(term) || term.includes(district));
  });

  return matched.length > 0 ? matched : weatherReadings;
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Protect with x-cron-secret header
  const configuredCronSecret = Deno.env.get('CRON_SECRET');
  const incomingCronSecret = req.headers.get('x-cron-secret');

  if (!configuredCronSecret || incomingCronSecret !== configuredCronSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid or missing x-cron-secret header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 3. Initialize Supabase service-role client
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 4. Fetch routes, weather readings, driver reports, and social reports
    const [
      { data: routes, error: routesErr },
      { data: weatherReadings, error: weatherErr },
      { data: driverReports, error: driverErr },
      { data: socialReports, error: socialErr }
    ] = await Promise.all([
      supabase.from('routes').select('*'),
      supabase.from('weather_readings').select('*').order('recorded_at', { ascending: false }),
      supabase.from('driver_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('social_reports').select('*').order('created_at', { ascending: false })
    ]);

    if (routesErr) throw new Error(`Failed to load routes: ${routesErr.message}`);
    if (weatherErr) throw new Error(`Failed to load weather: ${weatherErr.message}`);
    if (driverErr) throw new Error(`Failed to load driver reports: ${driverErr.message}`);
    if (socialErr) throw new Error(`Failed to load social reports: ${socialErr.message}`);

    const severityWeights: Record<string, number> = {
      critical: 95,
      high: 75,
      medium: 50,
      low: 25,
    };

    const updatedRoutes: any[] = [];
    const triggeredAlerts: any[] = [];

    for (const route of (routes || [])) {
      // 5. Aggregate Weather for corridor area
      const matchedWeather = findMatchingWeather(route, weatherReadings || []);
      const count = Math.max(1, matchedWeather.length);

      const avgRainfall = matchedWeather.reduce((sum: number, w: any) => sum + Number(w.rainfall ?? 15), 0) / count;
      const avgRainProb = matchedWeather.reduce((sum: number, w: any) => sum + Number(w.rain_probability ?? 30), 0) / count;
      const avgVisibility = matchedWeather.reduce((sum: number, w: any) => sum + Number(w.visibility ?? 8.5), 0) / count;

      // 6. Aggregate recent reports for this route
      const routeDriverReports = (driverReports || []).filter((r: any) => r.route_id === route.id);
      const routeSocialReports = (socialReports || []).filter((r: any) => r.route_id === route.id);
      const combinedReports = [...routeDriverReports, ...routeSocialReports];

      let liveReportImpact = 10;
      if (combinedReports.length > 0) {
        const scores = combinedReports.map((r: any) => severityWeights[(r.severity || '').toLowerCase()] ?? 25);
        const maxScore = Math.max(...scores);
        const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        liveReportImpact = Math.round((maxScore * 0.7) + (avgScore * 0.3));
      }

      // 7. Calculate risk metrics
      const rainRisk = calculateRainRisk(avgRainfall, avgRainProb);
      const landslideProb = Math.min(100, Math.max(5, Math.round((rainRisk * 0.5) + (liveReportImpact * 0.5))));
      const roadConditionRisk = Math.min(100, Math.max(10, Math.round(15 + (rainRisk * 0.45) + (liveReportImpact * 0.4))));
      const visibilityRisk = getVisibilityRiskScore(avgVisibility);

      const rawRisk =
        (rainRisk * 0.25) +
        (landslideProb * 0.30) +
        (roadConditionRisk * 0.20) +
        (visibilityRisk * 0.10) +
        (20 * 0.10) + // baseline historical frequency
        (liveReportImpact * 0.05);

      const compositeRisk = Math.min(99, Math.max(5, Math.round(rawRisk)));
      const landslideRisk = calculateLandslideState(rainRisk, landslideProb);

      // 8. Determine status transitions:
      // Keep status unchanged unless risk crosses 80 (set to 'blocked')
      // or drops below 20 while currently 'blocked' or 'at-risk' (set to 'clear')
      let newStatus = route.status;
      if (compositeRisk > 80) {
        newStatus = 'blocked';
      } else if (compositeRisk < 20 && (route.status === 'blocked' || route.status === 'at-risk')) {
        newStatus = 'clear';
      }

      const becameBlocked = route.status !== 'blocked' && newStatus === 'blocked';

      // 9. Update route record in database
      const { error: updateErr } = await supabase
        .from('routes')
        .update({
          risk: compositeRisk,
          rain_risk: rainRisk,
          landslide_risk: landslideRisk,
          landslide_probability: landslideProb,
          visibility: Number(avgVisibility.toFixed(1)),
          status: newStatus,
          last_updated: new Date().toISOString(),
        })
        .eq('id', route.id);

      if (updateErr) {
        throw new Error(`Failed to update route ${route.id}: ${updateErr.message}`);
      }

      // 10. If status escalated to 'blocked', insert Disruption Alert and Notification
      if (becameBlocked) {
        const timestamp = Date.now();
        const randHex = Math.random().toString(16).slice(2, 6);
        const alertId = `ALERT-${timestamp}-${randHex}`;
        const notifId = `NOTIF-${timestamp}-${randHex}`;

        const alertPayload = {
          id: alertId,
          route_id: route.id,
          route_name: route.name,
          title: `CRITICAL HAZARD: Route Blocked on ${route.name}`,
          severity: 'critical',
          type: 'Landslide',
          description: `Automated assessment flagged severe disruption (Risk: ${compositeRisk}%, Landslide Probability: ${landslideProb}%). Corridor blocked in ${route.sector || 'North East Corridor'}. Immediate rerouting required.`,
          created_at: new Date().toISOString(),
        };

        const notifPayload = {
          id: notifId,
          alert_key: 'landslide_critical',
          severity: 'CRITICAL',
          title_key: 'landslide_critical',
          message_key: 'landslide_critical',
          custom_title: `CRITICAL: Landslide on ${route.name}`,
          custom_message: `Automated risk recalculation determined high disruption hazard (Risk: ${compositeRisk}%). Corridor blocked in ${route.sector || 'North East Corridor'}.`,
          region: route.sector || 'North East Corridor',
          route_id: route.id,
          route_name: route.name,
          created_at: new Date().toISOString(),
        };

        await Promise.all([
          supabase.from('disruption_alerts').insert(alertPayload),
          supabase.from('notifications').insert(notifPayload),
        ]);

        triggeredAlerts.push({ routeId: route.id, alertId, notifId });
      }

      updatedRoutes.push({
        id: route.id,
        name: route.name,
        previousRisk: route.risk,
        newRisk: compositeRisk,
        previousStatus: route.status,
        newStatus,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        recalculatedAt: new Date().toISOString(),
        routesEvaluated: updatedRoutes.length,
        triggeredAlerts,
        updatedRoutes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error occurred during risk recalculation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
