import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  const errorMsg = `Missing required Supabase environment variable(s): ${missingVars.join(', ')}. Please define them in .env.local.`;
  console.error(`[Supabase Init Error] ${errorMsg}`);
  throw new Error(errorMsg);
}

// Log only the hostname at startup (never the anon key)
try {
  const url = new URL(supabaseUrl);
  console.log(`[Supabase] Initialized with endpoint host: ${url.hostname}`);
} catch {
  console.log(`[Supabase] Initialized with endpoint: ${supabaseUrl}`);
}

export const supabase: SupabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export const createClient = <Database = any>(
  options?: Parameters<typeof createSupabaseClient>[2]
) => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, options);
};

export default supabase;
