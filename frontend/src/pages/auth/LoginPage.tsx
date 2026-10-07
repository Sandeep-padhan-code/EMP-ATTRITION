import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layers, ShieldCheck, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('hr@acme-corp.internal');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if session expired
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setErrorMessage('Your session has expired. Please sign in again.');
    }
  }, [location]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(role === 'hr' ? '/hr' : '/employee', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await login(email, password);
      // Route based on backend verified role
      navigate(user.role === 'hr' ? '/hr' : '/employee', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Left Value Proposition Panel */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950/40 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-brand-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow-brand transition-transform group-hover:scale-105">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">Attrition Intelligence</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block">Enterprise HR SaaS</span>
            </div>
          </Link>

          <div className="mt-14 space-y-4 max-w-md text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs text-brand-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calibrated Random Forest • 88.1% Accuracy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise retention intelligence for modern people teams.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Identify turnover pressure across 1,470 employee records, understand driving factors, and engage talent before resignations occur.
            </p>
          </div>

          <div className="mt-8 space-y-3 max-w-sm text-left text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real dataset records & real-time ML inference</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict Role-Based Access Control (HR vs Employee)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>HR ↔ Employee messaging & retention action plans</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Decision Support Architecture</span>
          <span>© 2026 Enterprise Talent Systems</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-slate-900/50">
        <div className="max-w-sm w-full mx-auto space-y-6 text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a role demo credential or enter your enterprise email.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1-Click Demo Credentials Box */}
          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Quick Demo Accounts</span>
              <span className="text-brand-400 text-[10px]">Click to prefill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSetDemo('hr@acme-corp.internal', 'admin123')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === 'hr@acme-corp.internal'
                    ? 'bg-brand-600/20 border-brand-500 text-white font-medium shadow-2xs'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="block font-semibold text-white">HR Leadership</span>
                <span className="block text-[10px] text-slate-400">Elena Rostova</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetDemo('employee1@acme-corp.internal', 'password123')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === 'employee1@acme-corp.internal'
                    ? 'bg-brand-600/20 border-brand-500 text-white font-medium shadow-2xs'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="block font-semibold text-white">Employee Role</span>
                <span className="block text-[10px] text-slate-400">Mary Davis (Sales)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full"
            >
              Sign in to Platform
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Protected by enterprise token authorization and server-side RBAC.
          </div>
        </div>
      </div>
    </div>
  );
};
