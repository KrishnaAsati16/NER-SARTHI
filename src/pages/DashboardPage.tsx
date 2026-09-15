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
import { BarChart3, Map as MapIcon } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useApp();
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');

  return (
    <div className="space-y-4">
      
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
