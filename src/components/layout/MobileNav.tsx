import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from './LanguageSelector';
import { NotificationCenter } from './NotificationCenter';
import { 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  Compass, 
  Menu, 
  X, 
  BarChart3, 
  LogIn, 
  Sun, 
  Moon 
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, theme, toggleTheme, t } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomNavItems = [
    { id: 'dashboard', label: t('dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'routes', label: t('routes', 'Routes'), icon: MapPin },
    { id: 'logistics', label: t('logistics', 'Logistics'), icon: Truck },
    { id: 'login', label: t('login', 'Login'), icon: LogIn },
  ];

  const fullNavItems = [
    { id: 'dashboard', label: t('dashboard', 'Command Dashboard'), icon: LayoutDashboard },
    { id: 'routes', label: t('routes', 'Route Intelligence'), icon: MapPin },
    { id: 'logistics', label: t('logistics', 'AI Logistics Planner'), icon: Truck },
    { id: 'analytics', label: t('analytics', 'Analytics & Reports'), icon: BarChart3 },
    { id: 'explore', label: t('explore', 'Explore Northeast'), icon: Compass },
    { id: 'login', label: t('login', 'Portal Login'), icon: LogIn },
  ];

  return (
    <>
      {/* Mobile Top Header Bar with Language Selector & Hamburger Menu */}
      <div className="lg:hidden flex items-center justify-between glass-panel px-3 py-2 border-b border-slate-200 dark:border-white/10 sticky top-[62px] z-[1900] transition-colors duration-300">
        <div className="flex items-center space-x-1.5">
          <LanguageSelector compact={true} />
        </div>
        <div className="flex items-center space-x-2">
          <NotificationCenter />
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg glass-panel-light text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-1.5 rounded-lg glass-panel-light text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Slide-out Navigation Drawer Overlay */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[2500] bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-white/10 pb-4">
              <h2 className="text-lg font-bold text-cyan-400">
                {t('navigation', 'Operational Navigation')}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg bg-white/10 text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {fullNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 border-t border-white/10 pt-4">
            <p>{t('ministryName', 'Ministry of DoNER • Government of India')}</p>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation for Smartphones */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1900] glass-panel border-t border-slate-200 dark:border-white/10 px-2 py-1.5 flex items-center justify-around">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
