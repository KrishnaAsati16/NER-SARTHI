import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RouteSegment, Vehicle, DisruptionAlert, AppNotification } from '../types';
import { mapRouteRow } from '../services/routesService';
import { mapVehicleRow } from '../services/vehiclesService';
import { mapDisruptionRow } from '../services/disruptionsService';
import { mapNotificationRow } from '../services/notificationsService';

export type RealtimeStatus = 'connected' | 'reconnecting' | 'disconnected';

interface UseRealtimeParams {
  session: any;
  setRoutes: React.Dispatch<React.SetStateAction<RouteSegment[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setDisruptions: React.Dispatch<React.SetStateAction<DisruptionAlert[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  onCriticalDisruption?: (disruption: DisruptionAlert) => void;
}

export function useRealtime({
  session,
  setRoutes,
  setVehicles,
  setDisruptions,
  setNotifications,
  onCriticalDisruption,
}: UseRealtimeParams) {
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('disconnected');
  const isSubscribedRef = useRef(false);

  // Keep latest callbacks in ref to prevent unnecessary subscription teardown/recreation
  const handlersRef = useRef({
    setRoutes,
    setVehicles,
    setDisruptions,
    setNotifications,
    onCriticalDisruption,
  });

  useEffect(() => {
    handlersRef.current = {
      setRoutes,
      setVehicles,
      setDisruptions,
      setNotifications,
      onCriticalDisruption,
    };
  });

  useEffect(() => {
    // Only subscribe when there is an active authenticated session
    if (!session) {
      return;
    }

    if (isSubscribedRef.current) {
      return;
    }
    isSubscribedRef.current = true;

    const channelName = `ner-sarthi-db-sync-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      // 1. Live Routes updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'routes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const mapped = mapRouteRow(payload.new);
            handlersRef.current.setRoutes(prev => [mapped, ...prev.filter(r => r.id !== mapped.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapRouteRow(payload.new);
            handlersRef.current.setRoutes(prev =>
              prev.map(r => {
                if (r.id === mapped.id) {
                  return {
                    ...r,
                    ...mapped,
                    assignedOfficerName: r.assignedOfficerName || mapped.assignedOfficerName,
                  };
                }
                return r;
              })
            );
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as any)?.id;
            if (id) {
              handlersRef.current.setRoutes(prev => prev.filter(r => r.id !== id));
            }
          }
        }
      )
      // 2. Live Vehicles updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const mapped = mapVehicleRow(payload.new);
            handlersRef.current.setVehicles(prev => [mapped, ...prev.filter(v => v.id !== mapped.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapVehicleRow(payload.new);
            handlersRef.current.setVehicles(prev =>
              prev.map(v => (v.id === mapped.id ? { ...v, ...mapped } : v))
            );
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as any)?.id;
            if (id) {
              handlersRef.current.setVehicles(prev => prev.filter(v => v.id !== id));
            }
          }
        }
      )
      // 3. Live Disruption Alerts updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disruption_alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const mapped = mapDisruptionRow(payload.new);
            handlersRef.current.setDisruptions(prev => [mapped, ...prev.filter(d => d.id !== mapped.id)]);

            // Trigger emergency banner if critical or high severity
            if (mapped.severity === 'critical' || mapped.severity === 'high') {
              handlersRef.current.onCriticalDisruption?.(mapped);
            }
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapDisruptionRow(payload.new);
            handlersRef.current.setDisruptions(prev =>
              prev.map(d => (d.id === mapped.id ? mapped : d))
            );
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as any)?.id;
            if (id) {
              handlersRef.current.setDisruptions(prev => prev.filter(d => d.id !== id));
            }
          }
        }
      )
      // 4. Live Notifications updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const mapped = mapNotificationRow(payload.new);
            handlersRef.current.setNotifications(prev => [mapped, ...prev.filter(n => n.id !== mapped.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const mapped = mapNotificationRow(payload.new);
            handlersRef.current.setNotifications(prev =>
              prev.map(n => (n.id === mapped.id ? mapped : n))
            );
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as any)?.id;
            if (id) {
              handlersRef.current.setNotifications(prev => prev.filter(n => n.id !== id));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('reconnecting');
        } else if (status === 'CLOSED') {
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      isSubscribedRef.current = false;
      setRealtimeStatus('disconnected');
      void supabase.removeChannel(channel);
    };
  }, [session]);

  return { realtimeStatus };
}
