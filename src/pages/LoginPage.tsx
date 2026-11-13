import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  LogOut, 
  UserPlus, 
  LogIn, 
  AlertCircle,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { session, user, profile, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const { showToast, setActiveTab } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setAuthError(error.message);
          showToast(`❌ Authentication failed: ${error.message}`);
        } else {
          showToast('✅ Successfully signed in to NER-Sarthi Command Portal.');
          setActiveTab('dashboard');
        }
      } else {
        if (!fullName.trim()) {
          setAuthError('Please enter your full name for official identification.');
          setSubmitting(false);
          return;
        }

        // On sign up, pass only full_name in options.data. Never send role from client.
        const { error, user: newUser } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          setAuthError(error.message);
          showToast(`❌ Registration failed: ${error.message}`);
        } else {
          showToast('✅ Account registered! You can now access your dashboard.');
          if (newUser && !session) {
            setMode('signin');
          } else {
            setActiveTab('dashboard');
          }
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    showToast('👋 Successfully logged out of NER-Sarthi.');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      {session && user ? (
        /* Logged In Dashboard Card - Reads purely from database profile */
        <div className="glass-panel p-7 rounded-3xl border border-cyan-500/40 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>AUTHENTICATED SESSION ACTIVE</span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {profile?.full_name || user.email?.split('@')[0]}
            </h2>
            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
              {profile?.designation || (profile?.role === 'commander' ? 'Central Control Room Lead' : profile?.role === 'officer' ? 'Field Operations Lead' : 'Logistics Fleet Convoy')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Account: {user.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
            <div className="text-left">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Verified Role</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {profile?.role || 'driver'} ACCESS
              </span>
            </div>
            <div className="text-left">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">User UUID</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold truncate block" title={user.id}>
                {user.id.slice(0, 13)}...
              </span>
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
        /* Sign In / Sign Up Form */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'signin' ? 'NER-Saarthi Portal Login' : 'Create Official Account'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Access the Ministry of DoNER real-time logistics & route command portal.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => { setMode('signin'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setAuthError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Hint text regarding access levels (replacing fake preset buttons) */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-start space-x-2.5 text-xs text-cyan-900 dark:text-cyan-200">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Access Authorization Notice:</strong> New accounts are assigned <em>Driver (Fleet Logistics)</em> clearance by default. Official <em>Control Room (Commander)</em> and <em>Field Operations (Officer)</em> elevations are provisioned by DoNER central administrators.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Officer Vikram Singh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs py-3 pl-10 pr-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@doner.gov.in or email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs py-3 pl-10 pr-3 rounded-xl border border-slate-300 dark:border-white/15 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password:
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

            <button
              type="submit"
              disabled={submitting || authLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md transition-transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Command Center' : 'Create Account'}</span>
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
