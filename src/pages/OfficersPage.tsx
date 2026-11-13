import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, MapPin, Phone, FileText, Search } from 'lucide-react';

export const OfficersPage: React.FC = () => {
  const { officers, setSelectedOfficer } = useApp();
  const [search, setSearch] = useState('');

  const filteredOfficers = officers.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.department.toLowerCase().includes(search.toLowerCase()) ||
    o.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Field Officer Network</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ground operations personnel deployed across critical North Eastern corridors & mountain passes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search officer, sector, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 text-xs py-2.5 pl-9 pr-3 rounded-xl border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOfficers.map(officer => (
          <div
            key={officer.id}
            onClick={() => setSelectedOfficer(officer)}
            className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 hover:border-emerald-400/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Badge & Name */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">{officer.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 {officer.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {officer.name}
                </h3>
                <p className="text-xs font-medium text-slate-300">{officer.rank}</p>
                <p className="text-xs text-slate-400">{officer.department}</p>
              </div>

              {/* Location & Contact */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{officer.location} ({officer.sector})</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Control Desk: {officer.controlRoom}</span>
                </div>
              </div>

              {/* Last Report */}
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Latest Field Report:</span>
                <p className="text-slate-300 italic line-clamp-2">
                  "{officer.lastReport}"
                </p>
                <p className="text-[10px] text-slate-400 text-right">Reported at {officer.lastUpdate}</p>
              </div>

            </div>

            <button
              onClick={() => setSelectedOfficer(officer)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors"
            >
              View Full Officer Dossier
            </button>

          </div>
        ))}
      </div>

    </div>
  );
};
