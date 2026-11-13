import { supabase } from '../lib/supabase';
import { WeatherInfo } from '../types';

export async function fetchWeatherReadings(): Promise<WeatherInfo[]> {
  try {
    const { data, error } = await supabase
      .from('weather_readings')
      .select('*')
      .order('recorded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch weather readings: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): WeatherInfo => ({
      district: row.district,
      state: row.state,
      temperature: Number(row.temperature ?? 0),
      rainfall: Number(row.rainfall ?? 0),
      rainProbability: Number(row.rain_probability ?? 0),
      visibility: Number(row.visibility ?? 10),
      wind: Number(row.wind ?? 0),
      landslideRisk: row.landslide_risk || 'CLEAR',
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading weather readings from Supabase.');
  }
}
