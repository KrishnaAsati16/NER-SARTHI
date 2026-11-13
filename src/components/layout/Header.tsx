import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { NotificationCenter } from './NotificationCenter';
import { 
  Shield, 
  Clock, 
  Compass, 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  BarChart3, 
  LogIn, 
  UserCheck,
  Sun, 
  Moon 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { simulatedTime, activeTab, setActiveTab, theme, toggleTheme, t, realtimeStatus } = useApp();
  const { user, profile } = useAuth();

  const allNavItems = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'routes', label: t('routes', 'Route Intelligence'), icon: MapPin },
    { id: 'logistics', label: t('logistics', 'AI Logistics Planner'), icon: Truck },
    { id: 'analytics', label: t('analytics', 'Analytics & Reports'), icon: BarChart3 },
    { id: 'explore', label: t('explore', 'Explore Northeast'), icon: Compass },
    { id: 'login', label: user ? t('portalAccount', 'Portal Account') : t('login', 'Portal Login'), icon: user ? UserCheck : LogIn },
  ];

  // Full navigation menu displayed for all authenticated roles & visitors
  const navItems = allNavItems;

  return (
    <header className="sticky top-0 z-[2000] w-full glass-panel border-b border-slate-200 dark:border-white/10 px-4 py-2.5 sm:px-6 shadow-sm dark:shadow-glass transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto space-y-2.5">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-cyan-100 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent">
                    NER-Sarthi
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    DoNER
                  </span>
                  {/* Compact Realtime status badge for mobile */}
                  <span 
                    className={`inline-flex lg:hidden items-center space-x-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full border ${
                      realtimeStatus === 'connected'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : realtimeStatus === 'reconnecting'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                        : 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30'
                    }`}
                    title={`Realtime: ${realtimeStatus}`}
                  >
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                      realtimeStatus === 'connected'
                        ? 'bg-emerald-500'
                        : realtimeStatus === 'reconnecting'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`} />
                    <span>{realtimeStatus === 'connected' ? 'Live' : realtimeStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium hidden md:block">
                  {t('nerSarthiSubtitle', 'AI-Powered Logistics & Accessibility Intelligence • North East India')}
                </p>
              </div>
            </div>
          </div>

          {/* Center System Status & Clock */}
          <div className="hidden lg:flex items-center space-x-3 glass-panel-light px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {t('systemOperational', 'System Operational')}
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-600">|</span>

            {/* Realtime Subscription Indicator */}
            <div className="flex items-center space-x-1.5" title={`Supabase Realtime: ${realtimeStatus}`}>
              {realtimeStatus === 'connected' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Live
                  </span>
                </>
              ) : realtimeStatus === 'reconnecting' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider animate-pulse">
                    Reconnecting...
                  </span>
                </>
              ) : (
                <>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400 dark:bg-slate-600"></span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Offline
                  </span>
                </>
              )}
            </div>

            <span className="text-slate-300 dark:text-slate-600">|</span>

            <div className="flex items-center space-x-1 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
              <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>{simulatedTime}</span>
            </div>

          </div>

          {/* Right Action Icons: Language Selector, Notification Center, Theme Switcher & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Global Language Selector */}
            <LanguageSelector />

            {/* Notification Center with Unread Badge */}
            <NotificationCenter />

            {/* Theme Toggle: Sun / Moon */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-300 shadow-sm flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:scale-105'
                  : 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 hover:scale-105 shadow-amber-500/10'
              }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Control Room / User Profile Tag */}
            <div 
              onClick={() => setActiveTab('login')}
              className="hidden sm:flex items-center space-x-2 glass-panel-light pl-2 pr-3 py-1 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:border-cyan-500/50 transition-colors"
              title={user ? 'View Official Profile' : 'Sign In'}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${
                profile?.role === 'commander' ? 'bg-cyan-600' : profile?.role === 'officer' ? 'bg-blue-600' : 'bg-slate-700'
              }`}>
                {user ? <UserCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {user ? (profile?.full_name || user.email?.split('@')[0]) : t('controlRoom', 'Control Room')}
                </p>
                <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                  {user ? `${profile?.role || 'driver'} active` : t('donerOps', 'DoNER Ops')}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Operational Modules Horizontal Navbar Row */}
        <div className="overflow-x-auto no-scrollbar pt-0.5">
          <nav className="flex items-center space-x-1.5 min-w-max">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-600/30 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
};
