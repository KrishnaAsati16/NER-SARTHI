import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Building2, 
  Truck, 
  Radio, 
  LogOut 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { showToast, setActiveTab, theme } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'officer' | 'commander' | 'driver'>('commander');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ner_sarthi_auth') !== null;
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('ner_sarthi_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      alert('Please enter your official ID / Email');
      return;
    }

    const userData = {
      username,
      role,
      name: role === 'officer' ? 'Inspector Arjun Mehta' : role === 'commander' ? 'Commander Sharma' : 'Freight Fleet Driver',
      designation: role === 'officer' ? 'Field Operations Lead (RDRF)' : role === 'commander' ? 'DoNER Central Control Desk' : 'Emergency Logistics Convoy',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      token: `AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    };

    localStorage.setItem('ner_sarthi_auth', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsLoggedIn(true);
    showToast(`✅ Welcome back, ${userData.name}! Logged into Command Portal.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('ner_sarthi_auth');
    setCurrentUser(null);
    setIsLoggedIn(false);
    showToast('👋 Successfully logged out of NER-Sarthi.');
  };

  const setPreset = (presetRole: 'officer' | 'commander' | 'driver', email: string) => {
    setRole(presetRole);
    setUsername(email);
    setPassword('••••••••');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      
      {isLoggedIn && currentUser ? (
        /* Logged In Dashboard Card */
        <div className="glass-panel p-7 rounded-3xl border border-cyan-500/40 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>AUTHENTICATED SESSION ACTIVE</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{currentUser.name}</h2>
            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{currentUser.designation}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">ID: {currentUser.username} • Session: {currentUser.token}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
            <div className="text-left">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Authority Level</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">{currentUser.role} ACCESS</span>
            </div>
            <div className="text-left">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Login Timestamp</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{currentUser.loginTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <span>Go to Command Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:glass-panel-light dark:hover:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      ) : (
        /* Login Form */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">NER-Saarthi Portal Login</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Access the Ministry of DoNER real-time logistics & route command portal.
            </p>
          </div>

          {/* Quick Demo Preset Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              ⚡ Quick Demo Login Roles:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreset('commander', 'commander@doner.gov.in')}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center space-y-1 ${
                  role === 'commander'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-800 dark:bg-cyan-500/20 dark:border-cyan-500/60 dark:text-cyan-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-bold">Control Room</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('officer', 'arjun.mehta@rdrf.gov.in')}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center space-y-1 ${
                  role === 'officer'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-800 dark:bg-cyan-500/20 dark:border-cyan-500/60 dark:text-cyan-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-bold">Field Officer</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('driver', 'convoy.lead@driver.ner.in')}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center space-y-1 ${
                  role === 'driver'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-800 dark:bg-cyan-500/20 dark:border-cyan-500/60 dark:text-cyan-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-bold">Logistics Fleet</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email / ID:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. commander@doner.gov.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs py-3 pl-10 pr-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password / Security PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs py-3 pl-10 pr-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-cyan-600 focus:ring-cyan-500" />
                <span>Keep session active</span>
              </label>
              <span className="text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer font-semibold">Forgot PIN?</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md transition-transform active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <span>Sign In to Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-white/10 pt-4">
            <span>Official Portal • Government of India • Ministry of DoNER</span>
          </div>

        </div>
      )}

    </div>
  );
};
