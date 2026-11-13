import { supabase } from '../lib/supabase';
import { Vehicle } from '../types';

export function mapVehicleRow(row: any): Vehicle {
  return {
    id: row.id,
    cargo: row.cargo,
    origin: row.origin,
    destination: row.destination,
    eta: row.eta || 'On Schedule',
    etaMinutes: Number(row.eta_minutes ?? 0),
    status: row.status,
    lat: Number(row.lat),
    lng: Number(row.lng),
    speed: Number(row.speed ?? 0),
    routeId: row.route_id || '',
    risk: Number(row.risk ?? 0),
    driverName: row.driver_name || undefined,
  };
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapVehicleRow);
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading fleet vehicles from Supabase.');
  }
}
