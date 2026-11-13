import { supabase } from '../lib/supabase';
import { DisruptionAlert } from '../types';

export function formatDisplayTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function mapDisruptionRow(row: any): DisruptionAlert {
  return {
    id: row.id,
    routeId: row.route_id || '',
    routeName: row.route_name || '',
    title: row.title,
    severity: row.severity,
    timestamp: formatDisplayTime(row.created_at),
    type: row.type,
    description: row.description || '',
  };
}

export async function fetchDisruptions(): Promise<DisruptionAlert[]> {
  try {
    const { data, error } = await supabase
      .from('disruption_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch disruptions: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapDisruptionRow);
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading disruption alerts from Supabase.');
  }
}
