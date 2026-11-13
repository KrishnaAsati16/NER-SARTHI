import { supabase } from '../lib/supabase';
import { DriverReport, SocialReport } from '../types';

export function formatDisplayTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function fetchDriverReports(): Promise<DriverReport[]> {
  try {
    const { data, error } = await supabase
      .from('driver_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch driver reports: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): DriverReport => ({
      id: row.id,
      driverId: row.driver_id || '',
      routeId: row.route_id || '',
      routeName: row.route_name || '',
      observation: row.observation || '',
      severity: row.severity,
      confidence: Number(row.confidence ?? 80),
      timestamp: formatDisplayTime(row.created_at),
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading driver reports from Supabase.');
  }
}

export async function fetchSocialReports(): Promise<SocialReport[]> {
  try {
    const { data, error } = await supabase
      .from('social_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch social reports: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): SocialReport => ({
      id: row.id,
      handle: row.handle,
      routeId: row.route_id || '',
      routeName: row.route_name || '',
      content: row.content || '',
      severity: row.severity,
      confidence: Number(row.confidence ?? 80),
      timestamp: formatDisplayTime(row.created_at),
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading social reports from Supabase.');
  }
}
