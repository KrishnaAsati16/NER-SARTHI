import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Shield, Phone, MapPin, FileText, CheckCircle2 } from 'lucide-react';

export const OfficerDetailsDrawer: React.FC = () => {
  const { selectedOfficer, setSelectedOfficer } = useApp();

  if (!selectedOfficer) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[2200] w-full max-w-sm glass-panel border-l border-white/10 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400">FIELD OFFICER</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                🟢 {selectedOfficer.status}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1">{selectedOfficer.name}</h2>
            <p className="text-xs text-slate-400">{selectedOfficer.rank}</p>
          </div>
          <button
            onClick={() => setSelectedOfficer(null)}
            className="p-2 rounded-xl glass-panel-light text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Officer Details Card */}
        <div className="glass-card p-4 rounded-xl border border-white/10 space-y-3">
          <div>
            <span className="text-xs text-slate-400">Department:</span>
            <p className="text-sm font-bold text-cyan-300 mt-0.5">{selectedOfficer.department}</p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-xs text-slate-400">Assigned Sector:</span>
            <p className="text-sm font-bold text-white mt-0.5">{selectedOfficer.sector}</p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-xs text-slate-400">Current Location:</span>
            <p className="text-sm font-bold text-white mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedOfficer.location}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-xs text-slate-400">Fictional Control Room Phone:</span>
            <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedOfficer.controlRoom}</span>
            </p>
          </div>
        </div>

        {/* Latest Field Observation */}
        <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Latest Field Observation Report</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-white/5 italic">
            "{selectedOfficer.lastReport}"
          </p>
          <p className="text-[10px] text-slate-400 text-right">Reported at {selectedOfficer.lastUpdate}</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => setSelectedOfficer(null)}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
        >
          Close Officer Profile
        </button>
      </div>

    </div>
  );
};
