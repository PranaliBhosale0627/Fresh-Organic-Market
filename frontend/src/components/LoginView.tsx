import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, Shield, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authApi, authStorage } from '../api.js';

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; email: string; avatar: string; isAdmin: boolean; role?: string; isDeliveryPartner?: boolean }, token: string) => void;
  onNavigate: (view: string) => void;
}

export default function LoginView({ onLoginSuccess, onNavigate }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin' | 'delivery'>('login');
  
  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'register') {
        const res = await authApi.register(name, email, password);
        authStorage.setToken(res.token);
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(res.user, res.token);
        }, 1500);
      } else {
        // 'login' or 'admin'
        const loginEmail = activeTab === 'admin' ? 'admin@harvest.com' : activeTab === 'delivery' ? 'ravi.courier@harvest.com' : email;
        const res = await authApi.login(loginEmail, password);
        authStorage.setToken(res.token);
        setSuccess(activeTab === 'admin' ? 'Admin session verified! Launching Control Room...' : activeTab === 'delivery' ? 'Delivery dashboard verified!' : 'Welcome back! Logging in...');
        setTimeout(() => {
          onLoginSuccess(res.user, res.token);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, pass: string, isAdminMode: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authApi.login(demoEmail, pass);
      authStorage.setToken(res.token);
      setSuccess(isAdminMode ? 'Admin session verified! Launching Control Room...' : 'Logged in as Elena!');
      setTimeout(() => {
        onLoginSuccess(res.user, res.token);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 mb-20 text-left">
      <div className="bg-white rounded-[32px] border border-outline-variant/30 shadow-xl overflow-hidden relative p-8 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary">Verdant Harvest</h2>
          <p className="text-xs text-on-surface-variant">Fresh, Organic & Sustainable Groceries</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-surface-container p-1 rounded-full border border-outline-variant/40 shadow-inner">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'login' ? 'bg-white text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'register' ? 'bg-white text-primary shadow' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(null); }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'admin' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            onClick={() => { setActiveTab('delivery'); setError(null); }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'delivery' ? 'bg-secondary text-white shadow' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Rider
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-2xl border border-error/20 flex items-start gap-2.5 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0 text-error mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  placeholder="Elena Rodriguez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl py-3 pl-10 pr-4 text-xs font-medium outline-none transition-all"
                />
              </div>
            </div>
          )}

          {activeTab !== 'admin' && activeTab !== 'delivery' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  placeholder="elena.r@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl py-3 pl-10 pr-4 text-xs font-medium outline-none transition-all"
                />
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-1.5 bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-2">
              <p className="text-[11px] text-primary font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Administrative Access Restricted
              </p>
              <p className="text-[10px] text-on-surface-variant leading-normal">
                Logging in authorizes access to the control room. Use <strong>admin@harvest.com</strong> credentials.
              </p>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-1.5 bg-secondary/5 p-4 rounded-2xl border border-secondary/10 mb-2">
              <p className="text-[11px] text-secondary font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Delivery Partner Access
              </p>
              <p className="text-[10px] text-on-surface-variant leading-normal">
                Use <strong>ravi.courier@harvest.com</strong> with delivery partner credentials.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant block pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl py-3 pl-10 pr-4 text-xs font-medium outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {activeTab === 'register' ? 'Register Account' : activeTab === 'admin' ? 'Admin Access' : activeTab === 'delivery' ? 'Partner Access' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Panel */}
        <div className="border-t border-outline-variant/30 pt-6 space-y-3.5">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center">
            ⚡ Quick Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickLogin('elena.r@example.com', 'password123', false)}
              disabled={loading}
              className="border border-outline-variant/70 hover:border-primary/50 bg-surface-container-low text-on-surface px-3 py-2 rounded-2xl text-[10px] font-bold transition-all text-left flex flex-col justify-center gap-0.5 active:scale-95 cursor-pointer"
            >
              <span className="text-primary">Elena Rodriguez</span>
              <span className="text-[9px] text-on-surface-variant font-medium">Customer demo</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin@harvest.com', 'admin123', true)}
              disabled={loading}
              className="border border-primary/20 hover:border-primary/50 bg-primary/5 text-primary px-3 py-2 rounded-2xl text-[10px] font-bold transition-all text-left flex flex-col justify-center gap-0.5 active:scale-95 cursor-pointer"
            >
              <span className="text-primary flex items-center gap-1"><Shield className="w-3 h-3" /> System Admin</span>
              <span className="text-[9px] text-on-surface-variant font-medium">Control Dashboard</span>
            </button>
            <button
              onClick={() => handleQuickLogin('ravi.courier@harvest.com', 'partner123', false)}
              disabled={loading}
              className="border border-secondary/20 hover:border-secondary/50 bg-secondary/5 text-secondary px-3 py-2 rounded-2xl text-[10px] font-bold transition-all text-left flex flex-col justify-center gap-0.5 active:scale-95 cursor-pointer"
            >
              <span className="text-secondary">Ravi Courier</span>
              <span className="text-[9px] text-on-surface-variant font-medium">Delivery demo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
