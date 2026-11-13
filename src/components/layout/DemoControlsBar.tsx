import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../../data/translations';
import { AlertOctagon, CloudRain, Clock, CheckCircle2, Play, Info, Globe } from 'lucide-react';

export const DemoControlsBar: React.FC = () => {
  const { profile } = useAuth();
  const { 
    simulateLandslide, 
    simulateHeavyRain, 
    simulateVehicleDelay, 
    clearRoute,
    toastMessage,
    currentLanguage,
    t
  } = useApp();

  const isCommander = profile?.role === 'commander';
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="w-full glass-panel border border-cyan-500/30 rounded-2xl p-3 sm:p-4 mb-6 shadow-glow-cyan transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Header */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-100">
                {t('demoControlCenter', 'Demo Simulation Control Center')}
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center space-x-1">
                <Globe className="w-2.5 h-2.5" />
                <span>{t('language', 'Language')}: {currentLangObj.flag} {currentLangObj.name}</span>
              </span>
              {!isCommander && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center space-x-1">
                  <span>🔒 Commander access required</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {t('demoDescription', 'Trigger live simulated emergencies broadcast across the Map, Emergency Banner & Notification Center in selected language.')}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            disabled={!isCommander}
            onClick={() => isCommander && simulateLandslide('R-001')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isCommander
                ? 'bg-red-600/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 border-red-400/40 active:scale-95 cursor-pointer'
                : 'bg-red-950/40 text-red-300/40 border-red-900/30 cursor-not-allowed opacity-60'
            }`}
            title={isCommander ? t('simulateLandslide', 'Simulate Landslide') : 'Commander access required'}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t('simulateLandslide', 'Landslide Alert')}</span>
          </button>

          <button
            type="button"
            disabled={!isCommander}
            onClick={() => isCommander && simulateHeavyRain('R-002')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isCommander
                ? 'bg-amber-600/80 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 border-amber-400/40 active:scale-95 cursor-pointer'
                : 'bg-amber-950/40 text-amber-300/40 border-amber-900/30 cursor-not-allowed opacity-60'
            }`}
            title={isCommander ? t('simulateHeavyRain', 'Simulate Heavy Rain') : 'Commander access required'}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{t('simulateHeavyRain', 'Heavy Rain Alert')}</span>
          </button>

          <button
            type="button"
            disabled={!isCommander}
            onClick={() => isCommander && simulateVehicleDelay('V-001')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isCommander
                ? 'bg-blue-600/80 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border-blue-400/40 active:scale-95 cursor-pointer'
                : 'bg-blue-950/40 text-blue-300/40 border-blue-900/30 cursor-not-allowed opacity-60'
            }`}
            title={isCommander ? t('delayVehicle', 'Delay Vehicle') : 'Commander access required'}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('delayVehicle', 'Delay Vehicle')}</span>
          </button>

          <button
            type="button"
            disabled={!isCommander}
            onClick={() => isCommander && clearRoute('R-001')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isCommander
                ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400/40 active:scale-95 cursor-pointer'
                : 'bg-emerald-950/40 text-emerald-300/40 border-emerald-900/30 cursor-not-allowed opacity-60'
            }`}
            title={isCommander ? t('clearCorridor', 'Clear Corridor') : 'Commander access required'}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('clearCorridor', 'Clear Corridor')}</span>
          </button>
        </div>

      </div>

      {/* Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="mt-3 pt-2 border-t border-cyan-500/30 flex items-center space-x-2 text-xs font-semibold text-cyan-300 animate-pulse">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
