import React, { createContext, useContext, useState, useEffect } from 'react';
import { RouteSegment, Vehicle, FieldOfficer, DisruptionAlert, AppNotification, EmergencyAlert, AlertLevel } from '../types';
import { LanguageCode, getUIText } from '../data/translations';
import routesData from '../data/routes.json';
import vehiclesData from '../data/vehicles.json';
import officersData from '../data/officers.json';
import { fetchRoutes } from '../services/routesService';
import { fetchVehicles } from '../services/vehiclesService';
import { fetchOfficers } from '../services/officersService';
import { fetchDisruptions } from '../services/disruptionsService';
import { fetchNotifications } from '../services/notificationsService';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useRealtime, RealtimeStatus } from '../hooks/useRealtime';

interface AppContextType {
  routes: RouteSegment[];
  vehicles: Vehicle[];
  officers: FieldOfficer[];
  disruptions: DisruptionAlert[];
  realtimeStatus: RealtimeStatus;
  selectedRoute: RouteSegment | null;
  selectedVehicle: Vehicle | null;
  selectedOfficer: FieldOfficer | null;
  activeTab: string;
  simulatedTime: string;
  toastMessage: string | null;
  theme: 'dark' | 'light';
  
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  retryLoadData: () => Promise<void>;
  
  // Regional Language Support
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  
  // Notification Center
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  
  // Emergency Alert Banner
  activeEmergencyAlert: EmergencyAlert | null;
  triggerEmergencyAlert: (alert: {
    alertKey: string;
    severity: AlertLevel;
    region: string;
    routeName: string;
    autoDismissMs?: number;
  }) => void;
  dismissEmergencyAlert: () => void;
  
  // Theme Toggle
  toggleTheme: () => void;
  
  // Selection handlers
  setSelectedRoute: (route: RouteSegment | null) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setSelectedOfficer: (officer: FieldOfficer | null) => void;
  setActiveTab: (tab: string) => void;
  
  // Simulation methods
  simulateLandslide: (routeId?: string) => void;
  simulateHeavyRain: (routeId?: string) => void;
  simulateVehicleDelay: (vehicleId?: string) => void;
  clearRoute: (routeId?: string) => void;
  showToast: (msg: string) => void;
  
  // Computed KPI Stats
  kpiStats: {
    activeShipments: number;
    delayedShipments: number;
    highRiskRoutes: number;
    avgTimeSaved: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-001',
    alertKey: 'landslide_critical',
    severity: 'CRITICAL',
    titleKey: 'landslide_critical',
    messageKey: 'landslide_critical',
    region: 'Sikkim / East Sikkim',
    routeId: 'R-008',
    routeName: 'Gangtok – Nathu La Corridor',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'NOTIF-002',
    alertKey: 'landslide_warning',
    severity: 'HIGH',
    titleKey: 'landslide_warning',
    messageKey: 'landslide_warning',
    region: 'Meghalaya / East Khasi Hills',
    routeId: 'R-003',
    routeName: 'Shillong – Silchar Highway',
    timestamp: '8 min ago',
    read: false,
  },
  {
    id: 'NOTIF-003',
    alertKey: 'heavy_rain_warning',
    severity: 'MEDIUM',
    titleKey: 'heavy_rain_warning',
    messageKey: 'heavy_rain_warning',
    region: 'Assam / Sonitpur',
    routeId: 'R-002',
    routeName: 'Guwahati – Tezpur Highway',
    timestamp: '15 min ago',
    read: true,
  },
  {
    id: 'NOTIF-004',
    alertKey: 'weather_changing_low',
    severity: 'LOW',
    titleKey: 'weather_changing_low',
    messageKey: 'weather_changing_low',
    region: 'Mizoram / Aizawl',
    routeId: 'R-009',
    routeName: 'Silchar – Aizawl Highway',
    timestamp: '32 min ago',
    read: true,
  }
];

const INITIAL_DISRUPTIONS: DisruptionAlert[] = [
  {
    id: 'ALERT-001',
    routeId: 'R-003',
    routeName: 'Shillong – Silchar Highway',
    title: 'Active Landslide & Mudslide Debris',
    severity: 'critical',
    timestamp: '11:28 AM',
    type: 'Landslide',
    description: 'Debris falling at Sonapur tunnel stretch. Route blocked.'
  },
  {
    id: 'ALERT-002',
    routeId: 'R-006',
    routeName: 'Dimapur – Kohima Highway',
    title: 'Road Surface Subsidence',
    severity: 'high',
    timestamp: '11:15 AM',
    type: 'Road Damage',
    description: 'Heavy cargo traffic restricted near Pagla Pahar.'
  },
  {
    id: 'ALERT-003',
    routeId: 'R-001',
    routeName: 'Guwahati – Shillong Corridor',
    title: 'Reduced Fog Visibility & Rain',
    severity: 'medium',
    timestamp: '11:10 AM',
    type: 'Heavy Rainfall',
    description: 'Visibility down to 4.2 km near Nongpoh.'
  },
  {
    id: 'ALERT-004',
    routeId: 'R-009',
    routeName: 'Silchar – Aizawl Highway',
    title: 'Rockfall Clearing Operations',
    severity: 'high',
    timestamp: '10:50 AM',
    type: 'Landslide',
    description: 'Single lane traffic moving under PWD supervision.'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [routes, setRoutes] = useState<RouteSegment[]>(routesData as RouteSegment[]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesData as Vehicle[]);
  const [officers, setOfficers] = useState<FieldOfficer[]>(officersData as FieldOfficer[]);
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>(INITIAL_DISRUPTIONS);
  
  const [selectedRoute, setSelectedRoute] = useState<RouteSegment | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<FieldOfficer | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [simulatedTime, setSimulatedTime] = useState<string>('11:35 AM');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ner_sarthi_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Regional Language Support (Default English, persists in localStorage)
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    const savedLang = localStorage.getItem('ner_sarthi_lang') as LanguageCode;
    return savedLang || 'en';
  });

  const setCurrentLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    localStorage.setItem('ner_sarthi_lang', lang);
  };

  const t = (key: string, fallback?: string): string => {
    return getUIText(key, currentLanguage, fallback);
  };

  // Notification Center State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const savedNotifs = localStorage.getItem('ner_sarthi_notifications');
    if (savedNotifs) {
      try {
        return JSON.parse(savedNotifs);
      } catch (e) {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('ner_sarthi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Emergency Alert Banner State
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<EmergencyAlert | null>(null);

  const triggerEmergencyAlert = (alertData: {
    alertKey: string;
    severity: AlertLevel;
    region: string;
    routeName: string;
    autoDismissMs?: number;
  }) => {
    const newAlert: EmergencyAlert = {
      id: `ALERT-EMG-${Date.now()}`,
      alertKey: alertData.alertKey,
      severity: alertData.severity,
      region: alertData.region,
      routeName: alertData.routeName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      autoDismissMs: alertData.autoDismissMs || 9000
    };

    setActiveEmergencyAlert(newAlert);

    // Also add to notification center
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      alertKey: alertData.alertKey,
      severity: alertData.severity,
      titleKey: alertData.alertKey,
      messageKey: alertData.alertKey,
      region: alertData.region,
      routeName: alertData.routeName,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dismissEmergencyAlert = () => {
    setActiveEmergencyAlert(null);
  };

  // Live Supabase Realtime synchronization
  const { realtimeStatus } = useRealtime({
    session,
    setRoutes,
    setVehicles,
    setDisruptions,
    setNotifications,
    onCriticalDisruption: (disruption) => {
      triggerEmergencyAlert({
        alertKey: disruption.title || disruption.type,
        severity: disruption.severity.toUpperCase() as AlertLevel,
        region: 'North East Corridor',
        routeName: disruption.routeName,
        autoDismissMs: disruption.severity === 'critical' ? 12000 : 8000,
      });
    },
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('ner_sarthi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(next === 'light' ? '☀️ Switched to Light Theme' : '🌙 Switched to Dark Theme');
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    let usedFallback = false;

    try {
      const [routesRes, vehiclesRes, officersRes, disruptionsRes, notifsRes] = await Promise.allSettled([
        fetchRoutes(),
        fetchVehicles(),
        fetchOfficers(),
        fetchDisruptions(),
        fetchNotifications()
      ]);

      // Routes
      if (routesRes.status === 'fulfilled' && routesRes.value.length > 0) {
        setRoutes(routesRes.value);
        console.log('[Data Source] routes: Supabase');
      } else {
        setRoutes(routesData as RouteSegment[]);
        usedFallback = true;
        console.log('[Data Source] routes: Fallback (Offline demo data)');
      }

      // Vehicles
      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.length > 0) {
        setVehicles(vehiclesRes.value);
        console.log('[Data Source] vehicles: Supabase');
      } else {
        setVehicles(vehiclesData as Vehicle[]);
        usedFallback = true;
        console.log('[Data Source] vehicles: Fallback (Offline demo data)');
      }

      // Officers
      if (officersRes.status === 'fulfilled' && officersRes.value.length > 0) {
        setOfficers(officersRes.value);
        console.log('[Data Source] officers: Supabase');
      } else {
        setOfficers(officersData as FieldOfficer[]);
        usedFallback = true;
        console.log('[Data Source] officers: Fallback (Offline demo data)');
      }

      // Disruptions
      if (disruptionsRes.status === 'fulfilled' && disruptionsRes.value.length > 0) {
        setDisruptions(disruptionsRes.value);
        console.log('[Data Source] disruptions: Supabase');
      } else {
        setDisruptions(INITIAL_DISRUPTIONS);
        usedFallback = true;
        console.log('[Data Source] disruptions: Fallback (Offline demo data)');
      }

      // Notifications
      if (notifsRes.status === 'fulfilled' && notifsRes.value.length > 0) {
        setNotifications(notifsRes.value);
        console.log('[Data Source] notifications: Supabase');
      } else {
        console.log('[Data Source] notifications: Fallback (Offline demo data)');
      }

      const errors = [routesRes, vehiclesRes, officersRes]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason?.message || String(r.reason));

      if (errors.length > 0) {
        setError(errors[0]);
      }

      if (usedFallback) {
        showToast('ℹ️ Using offline demo data');
      }
    } catch (err: any) {
      console.warn('Data loading error, falling back to local dataset:', err);
      setRoutes(routesData as RouteSegment[]);
      setVehicles(vehiclesData as Vehicle[]);
      setOfficers(officersData as FieldOfficer[]);
      setDisruptions(INITIAL_DISRUPTIONS);
      setError(err?.message || 'Failed to connect to backend service.');
      showToast('ℹ️ Using offline demo data');
      console.log('[Data Source] routes: Fallback (Offline demo data)');
      console.log('[Data Source] vehicles: Fallback (Offline demo data)');
      console.log('[Data Source] officers: Fallback (Offline demo data)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [session]);

  // Clock ticker & Update Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setSimulatedTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Decrement next update minutes
      setRoutes(prev => prev.map(r => ({
        ...r,
        nextUpdateMinutes: r.nextUpdateMinutes > 1 ? r.nextUpdateMinutes - 1 : 180
      })));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Vehicle position simulation (every 4 seconds)
  useEffect(() => {
    const vehicleInterval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status !== 'On Route' && v.status !== 'Delayed') return v;
        const deltaLat = (Math.random() - 0.48) * 0.003;
        const deltaLng = (Math.random() - 0.48) * 0.003;
        return {
          ...v,
          lat: Number((v.lat + deltaLat).toFixed(4)),
          lng: Number((v.lng + deltaLng).toFixed(4)),
        };
      }));
    }, 4000);

    return () => clearInterval(vehicleInterval);
  }, []);

  // Dynamic KPI Computation
  const activeShipments = vehicles.filter(v => v.status === 'On Route').length;
  const delayedShipments = vehicles.filter(v => v.status === 'Delayed').length;
  const highRiskRoutes = routes.filter(r => r.risk >= 50).length;
  const avgTimeSaved = '2h 18m';

  // Demo Simulation Actions via Supabase RPCs
  const simulateLandslide = async (targetId?: string) => {
    const targetRouteId = targetId || 'R-001';
    try {
      const { error } = await supabase.rpc('simulate_landslide', { p_route_id: targetRouteId });
      if (error) {
        if (error.message.includes('Only commanders')) {
          showToast('🔒 Access Restricted: Only commanders can run simulation controls.');
        } else {
          showToast(`⚠️ Simulation error: ${error.message}`);
        }
        return;
      }
      showToast('⚠️ Simulated Landslide dispatched to backend!');
      await loadInitialData();
    } catch (err: any) {
      console.error('simulateLandslide error:', err);
      showToast(`⚠️ ${err.message || 'Failed to trigger simulation.'}`);
    }
  };

  const simulateHeavyRain = async (targetId?: string) => {
    const targetRouteId = targetId || 'R-002';
    try {
      const { error } = await supabase.rpc('simulate_heavy_rain', { p_route_id: targetRouteId });
      if (error) {
        if (error.message.includes('Only commanders')) {
          showToast('🔒 Access Restricted: Only commanders can run simulation controls.');
        } else {
          showToast(`🌧️ Simulation error: ${error.message}`);
        }
        return;
      }
      showToast('🌧️ Simulated Heavy Rain dispatched to backend!');
      await loadInitialData();
    } catch (err: any) {
      console.error('simulateHeavyRain error:', err);
      showToast(`🌧️ ${err.message || 'Failed to trigger simulation.'}`);
    }
  };

  const simulateVehicleDelay = async (targetVId?: string) => {
    const targetVehicleId = targetVId || 'V-001';
    try {
      const { error } = await supabase.rpc('simulate_vehicle_delay', { p_vehicle_id: targetVehicleId });
      if (error) {
        if (error.message.includes('Only commanders')) {
          showToast('🔒 Access Restricted: Only commanders can run simulation controls.');
        } else {
          showToast(`🚚 Simulation error: ${error.message}`);
        }
        return;
      }
      showToast(`🚚 Vehicle ${targetVehicleId} marked delayed on backend!`);
      await loadInitialData();
    } catch (err: any) {
      console.error('simulateVehicleDelay error:', err);
      showToast(`🚚 ${err.message || 'Failed to trigger simulation.'}`);
    }
  };

  const clearRoute = async (targetId?: string) => {
    const targetRouteId = targetId || 'R-001';
    try {
      const { error } = await supabase.rpc('clear_route', { p_route_id: targetRouteId });
      if (error) {
        if (error.message.includes('Only commanders')) {
          showToast('🔒 Access Restricted: Only commanders can run simulation controls.');
        } else {
          showToast(`✅ Clear route error: ${error.message}`);
        }
        return;
      }
      showToast('✅ Route corridor restored to CLEAR on backend!');
      await loadInitialData();
    } catch (err: any) {
      console.error('clearRoute error:', err);
      showToast(`✅ ${err.message || 'Failed to clear route.'}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        routes,
        vehicles,
        officers,
        disruptions,
        realtimeStatus,
        selectedRoute,
        selectedVehicle,
        selectedOfficer,
        activeTab,
        simulatedTime,
        toastMessage,
        theme,
        isLoading,
        error,
        retryLoadData: loadInitialData,
        currentLanguage,
        setCurrentLanguage,
        t,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        activeEmergencyAlert,
        triggerEmergencyAlert,
        dismissEmergencyAlert,
        toggleTheme,
        setSelectedRoute,
        setSelectedVehicle,
        setSelectedOfficer,
        setActiveTab,
        simulateLandslide,
        simulateHeavyRain,
        simulateVehicleDelay,
        clearRoute,
        showToast,
        kpiStats: {
          activeShipments,
          delayedShipments,
          highRiskRoutes,
          avgTimeSaved
        }
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
