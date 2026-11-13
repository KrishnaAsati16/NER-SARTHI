import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Read caller's JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Missing or malformed Authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: missing SUPABASE_URL or SUPABASE_ANON_KEY' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 3. Create Supabase client with the caller's JWT so RLS policies apply under their identity
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  // Verify the JWT is valid and retrieve user information
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid, expired, or rejected JWT token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 4. Parse and validate request payload
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Validation failed: Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { route_id, severity, observation, confidence } = payload || {};

  // Validate route_id presence and existence
  if (!route_id || typeof route_id !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Validation failed: route_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('id, name')
    .eq('id', route_id.trim())
    .single();

  if (routeError || !route) {
    return new Response(
      JSON.stringify({ error: `Validation failed: route_id "${route_id}" does not exist` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate severity
  const normalizedSeverity = typeof severity === 'string' ? severity.trim().toLowerCase() : '';
  if (!VALID_SEVERITIES.includes(normalizedSeverity)) {
    return new Response(
      JSON.stringify({ error: 'Validation failed: severity must be one of "low", "medium", "high", or "critical"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate observation
  if (typeof observation !== 'string' || observation.trim().length === 0 || observation.length > 500) {
    return new Response(
      JSON.stringify({ error: 'Validation failed: observation must be non-empty and 500 characters or less' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 5. Insert driver report under user's identity
  const reportId = `DR-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  const numericConfidence = typeof confidence === 'number' && confidence >= 0 && confidence <= 100
    ? confidence
    : 85;

  const { data: insertedReport, error: insertError } = await supabase
    .from('driver_reports')
    .insert({
      id: reportId,
      driver_id: user.id,
      route_id: route.id,
      route_name: route.name,
      observation: observation.trim(),
      severity: normalizedSeverity,
      confidence: numericConfidence,
    })
    .select()
    .single();

  if (insertError) {
    return new Response(
      JSON.stringify({ error: `Failed to insert driver report: ${insertError.message}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      report: insertedReport,
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
