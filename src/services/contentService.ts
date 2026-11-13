import { supabase } from '../lib/supabase';
import { TourismDestination, CulturalFestival, RSSItem, HistoricalDisruption } from '../types';

export async function fetchDestinations(): Promise<TourismDestination[]> {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch destinations: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): TourismDestination => ({
      id: row.id,
      name: row.name,
      state: row.state,
      category: row.category,
      description: row.description || '',
      image: row.image || '',
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading destinations from Supabase.');
  }
}

export async function fetchFestivals(): Promise<CulturalFestival[]> {
  try {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch festivals: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): CulturalFestival => ({
      id: row.id,
      name: row.name,
      state: row.state,
      month: row.month,
      description: row.description || '',
      image: row.image || '',
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading festivals from Supabase.');
  }
}

export async function fetchRSSItems(): Promise<RSSItem[]> {
  try {
    const { data, error } = await supabase
      .from('rss_items')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch RSS items: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): RSSItem => ({
      id: row.id,
      title: row.title,
      source: row.source || '',
      timestamp: row.published_at || new Date().toISOString(),
      category: row.category || 'General',
      summary: row.summary || '',
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading RSS items from Supabase.');
  }
}

export async function fetchHistoricalDisruptions(): Promise<HistoricalDisruption[]> {
  try {
    const { data, error } = await supabase
      .from('historical_disruptions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch historical disruptions: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any): HistoricalDisruption => ({
      id: row.id,
      date: row.date,
      district: row.district,
      cause: row.cause,
      severity: row.severity,
      clearanceHours: Number(row.clearance_hours ?? 0),
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading historical disruptions from Supabase.');
  }
}
