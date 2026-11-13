import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RouteSegment } from '../types';
import { getVisibilityClassification, getRainRiskLabel } from '../utils/riskEngine';
import { MapPin, CloudRain, AlertTriangle, ShieldCheck, Clock, Radio, Search, Filter } from 'lucide-react';

export const RouteIntelligencePage: React.FC = () => {
  const { routes, officers, setSelectedRoute } = useApp();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);

  const route = routes.find(r => r.id === selectedRouteId) || routes[0];
  const visibilityInfo = getVisibilityClassification(route.visibility);
  const rainInfo = getRainRiskLabel(route.rainRisk);
  const assignedOfficer = officers.find(o => o.id === route.assignedOfficerId) || officers[0];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>Route Accessibility Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep inspecting 25 highway corridors across Assam, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura, & Sikkim.
          </p>
        </div>

        {/* Dropdown Route Selector */}
        <div className="w-full md:w-80">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Highway Corridor:
          </label>
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full bg-slate-900/90 text-cyan-300 font-semibold text-xs py-2.5 px-3 rounded-xl border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                {r.id} — {r.name} ({r.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Corridor Intelligence Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Corridor Hero Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">{route.id}</span>
                <h2 className="text-xl font-extrabold text-white">{route.name}</h2>
                <p className="text-xs text-slate-400">{route.sector} • Length: {route.lengthKm} km</p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  route.status === 'clear' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  route.status === 'at-risk' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                }`}>
                  {route.status === 'clear' ? '🟢 CLEAR' : route.status === 'at-risk' ? '🟡 AT RISK' : '🔴 BLOCKED'}
                </span>
              </div>
            </div>

            {/* 4 Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Risk Score</span>
                <p className="text-xl font-extrabold text-cyan-300 mt-0.5">{route.risk}%</p>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Landslide State</span>
                <p className={`text-sm font-extrabold uppercase mt-1 ${
                  route.landslideRisk === 'CLEAR' ? 'text-emerald-400' :
                  route.landslideRisk === 'MONITOR' ? 'text-amber-400' : 'text-red-500'
                }`}>
                  {route.landslideRisk === 'CLEAR' ? '🟢 CLEAR' : route.landslideRisk === 'MONITOR' ? '🟡 MONITOR' : '🔴 BLOCKED'}
                </p>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Rainfall Risk</span>
                <p className={`text-sm font-extrabold mt-1 ${rainInfo.color}`}>{route.rainRisk}%</p>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Visibility</span>
                <p className={`text-sm font-extrabold mt-1 ${visibilityInfo.color}`}>{route.visibility} km</p>
              </div>
            </div>

            {/* Live Update Timestamps */}
            <div className="glass-card p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Last updated at <strong className="text-white">{route.lastUpdated}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-300 font-mono">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Next expected update in <strong>{route.nextUpdateMinutes} minutes</strong></span>
              </div>
            </div>
          </div>

          {/* Assigned Officer & Reports */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Assigned Field Officer & Ground Intelligence</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Officer Profile</span>
                <h4 className="text-base font-bold text-white">{assignedOfficer.name}</h4>
                <p className="text-xs text-slate-300">{assignedOfficer.rank}</p>
                <p className="text-xs text-slate-400">{assignedOfficer.department}</p>
                <p className="text-xs text-emerald-400 font-mono pt-1">Control Room: {assignedOfficer.controlRoom}</p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Ground Observation</span>
                <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-white/5">
                  "{assignedOfficer.lastReport}"
                </p>
                <p className="text-[10px] text-slate-400 text-right">Confidence Score: {route.confidence}%</p>
              </div>
            </div>
          </div>

        </div>

        {/* Corridor List Sidebar (1 Col) */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-white/10 pb-2">
            All 25 Highway Corridors
          </h3>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {routes.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  r.id === selectedRouteId
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-white'
                    : 'glass-card border-white/10 text-slate-300 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-cyan-400 font-mono">{r.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                    r.status === 'clear' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.status === 'at-risk' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 mt-1 truncate">{r.name}</h4>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Risk: {r.risk}%</span>
                  <span>Landslide: {r.landslideRisk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
