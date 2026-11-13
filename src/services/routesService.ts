import { supabase } from '../lib/supabase';
import { RouteSegment } from '../types';

export function formatDisplayTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function mapRouteRow(row: any): RouteSegment {
  return {
    id: row.id,
    name: row.name,
    origin: row.origin,
    destination: row.destination,
    coordinates: (typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates) || [],
    status: row.status,
    risk: Number(row.risk ?? 0),
    rainRisk: Number(row.rain_risk ?? 0),
    landslideRisk: row.landslide_risk,
    landslideProbability: Number(row.landslide_probability ?? 0),
    visibility: Number(row.visibility ?? 10),
    source: row.source || 'Field Sensor Network',
    confidence: Number(row.confidence ?? 85),
    lastUpdated: formatDisplayTime(row.last_updated),
    nextUpdateMinutes: Number(row.next_update_minutes ?? 180),
    assignedOfficerId: row.assigned_officer_id || '',
    assignedOfficerName: row.officers?.name || row.assigned_officer_name || row.assigned_officer_id || 'Duty Officer',
    sector: row.sector || '',
    lengthKm: Number(row.length_km ?? 0),
  };
}

export async function fetchRoutes(): Promise<RouteSegment[]> {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*, officers:assigned_officer_id (name)')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch routes: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapRouteRow);
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading route segments from Supabase.');
  }
}
