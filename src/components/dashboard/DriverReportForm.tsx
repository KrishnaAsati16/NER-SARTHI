import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Send, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DisruptionSeverity } from '../../types';

export const DriverReportForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { routes, showToast } = useApp();

  const [routeId, setRouteId] = useState<string>(routes[0]?.id || 'R-001');
  const [observation, setObservation] = useState('');
  const [severity, setSeverity] = useState<DisruptionSeverity>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Visible only for drivers
  if (!user || profile?.role !== 'driver') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter road observation details.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    const selectedRoute = routes.find(r => r.id === routeId);
    const routeName = selectedRoute ? selectedRoute.name : 'NER Corridor';

    try {
      // Real enforcement is RLS in database: driver_id must equal auth.uid()::text
      const { error } = await supabase
        .from('driver_reports')
        .insert({
          id: `DR-${Date.now().toString().slice(-6)}`,
          driver_id: user.id, // user.id as text
          route_id: routeId,
          route_name: routeName,
          observation: observation.trim(),
          severity: severity,
          confidence: 90,
        });

      if (error) {
        throw error;
      }

      setStatusMsg({ type: 'success', text: 'Road report logged and dispatched to Central Control Desk.' });
      showToast('✅ Road report successfully submitted!');
      setObservation('');
    } catch (err: any) {
      console.error('[DriverReport] Error submitting report:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to submit road report.' });
      showToast(`❌ Submission failed: ${err.message || 'Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-white/95 dark:bg-slate-900/90 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Driver Road Observation Report
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Submit real-time road condition or obstruction notice directly from your route
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 uppercase">
          Fleet Driver
        </span>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Route Corridor:
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hazard Severity:
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as DisruptionSeverity)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="low">🟢 Low (Minor delay / caution)</option>
              <option value="medium">🟡 Medium (Slowdown / heavy rain)</option>
              <option value="high">🟠 High (Partial blockage / mudslide)</option>
              <option value="critical">🔴 Critical (Total road blockage)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Observation Notes:
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe the terrain issue, landslide, water accumulation, or police diversion encountered..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Transmitting Report...' : 'Transmit Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
