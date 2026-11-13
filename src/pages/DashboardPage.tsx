import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BasicDashboard } from '../components/dashboard/BasicDashboard';
import { KPICards } from '../components/dashboard/KPICards';
import { DemoControlsBar } from '../components/layout/DemoControlsBar';
import { LiveMap } from '../components/map/LiveMap';
import { DisruptionFeed } from '../components/dashboard/DisruptionFeed';
import { RouteDetailsDrawer } from '../components/dashboard/RouteDetailsDrawer';
import { VehicleDetailsDrawer } from '../components/dashboard/VehicleDetailsDrawer';
import { OfficerDetailsDrawer } from '../components/dashboard/OfficerDetailsDrawer';
import { DriverReportForm } from '../components/dashboard/DriverReportForm';
import { BarChart3, Map as MapIcon, AlertTriangle, RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t, isLoading, error, retryLoadData } = useApp();
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await retryLoadData();
    setIsRetrying(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-white/5" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-white/5" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-white/5" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-white/5" />
        </div>
        <div className="h-[480px] bg-slate-200 dark:bg-slate-800/80 rounded-3xl border border-slate-300 dark:border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Backend connection warning & retry banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">Backend Notice: {error} (Falling back to offline demo data)</span>
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 border border-amber-500/40 font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
          </button>
        </div>
      )}
      
      {/* Driver Road Observation Report Form (Visible for Driver role only) */}
      <DriverReportForm />

      {/* Top Header Row with Animated Segmented View Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
          <span className="text-xs font-black tracking-wider uppercase text-cyan-700 dark:text-cyan-400">
            {viewMode === 'basic' ? t('basicDashboard', 'Basic Route Dashboard') : t('mapView', 'Operational Map View')}
          </span>
        </div>

        {/* Smooth Animated Toggle Switch */}
        <div className="relative inline-flex items-center bg-slate-200/80 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300 dark:border-white/15 shadow-sm dark:shadow-2xl backdrop-blur-md">
          {/* Animated Active Pill Indicator */}
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/25 transition-all duration-300 ease-out ${
              viewMode === 'basic'
                ? 'left-1.5 w-[125px]'
                : 'left-[136px] w-[135px]'
            }`}
          />

          {/* Toggle Option 1: Basic Graphs */}
          <button
            type="button"
            onClick={() => setViewMode('basic')}
            className={`relative z-10 flex items-center justify-center space-x-1.5 w-[125px] py-1.5 text-xs font-black transition-colors duration-200 ${
              viewMode === 'basic' ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('basicGraphs', 'Basic Graphs')}</span>
          </button>

          {/* Toggle Option 2: Full Map Ops */}
          <button
            type="button"
            onClick={() => setViewMode('advanced')}
            className={`relative z-10 flex items-center justify-center space-x-1.5 w-[135px] py-1.5 text-xs font-black transition-colors duration-200 ${
              viewMode === 'advanced' ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t('fullMapOps', 'Full Map Ops')}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'basic' ? (
        <BasicDashboard />
      ) : (
        <div className="space-y-6">
          <DemoControlsBar />
          <KPICards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[550px]">
            <div className="lg:col-span-2 h-[450px] lg:h-full min-h-[450px]">
              <LiveMap />
            </div>
            <div className="lg:col-span-1 h-[450px] lg:h-full">
              <DisruptionFeed />
            </div>
          </div>
        </div>
      )}

      {/* Side Drawers */}
      <RouteDetailsDrawer />
      <VehicleDetailsDrawer />
      <OfficerDetailsDrawer />

    </div>
  );
};
