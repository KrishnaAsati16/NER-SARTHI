import { supabase } from '../lib/supabase';
import { FieldOfficer } from '../types';

export function formatDisplayTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function fetchOfficers(): Promise<FieldOfficer[]> {
  try {
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch officers: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): FieldOfficer => ({
      id: row.id,
      name: row.name,
      department: row.department || '',
      rank: row.rank || '',
      controlRoom: row.control_room || '',
      status: row.status,
      location: row.location || '',
      lat: Number(row.lat),
      lng: Number(row.lng),
      lastUpdate: formatDisplayTime(row.last_update),
      lastReport: row.last_report || '',
      sector: row.sector || '',
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading field officers from Supabase.');
  }
}
