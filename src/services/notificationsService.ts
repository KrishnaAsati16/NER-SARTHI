import { supabase } from '../lib/supabase';
import { AppNotification } from '../types';

export function formatRelativeOrDisplayTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return date.toLocaleDateString();
}

export function mapNotificationRow(row: any): AppNotification {
  return {
    id: row.id,
    alertKey: row.alert_key || 'general_alert',
    severity: row.severity,
    titleKey: row.title_key || row.alert_key || 'general_alert',
    messageKey: row.message_key || row.alert_key || 'general_alert',
    customTitle: row.custom_title || undefined,
    customMessage: row.custom_message || undefined,
    region: row.region || '',
    routeId: row.route_id || undefined,
    routeName: row.route_name || undefined,
    timestamp: formatRelativeOrDisplayTime(row.created_at),
    read: false,
  };
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapNotificationRow);
  } catch (err: any) {
    throw new Error(err.message || 'Error occurred while loading notifications from Supabase.');
  }
}
