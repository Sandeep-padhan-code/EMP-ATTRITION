import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handlePortalRedirect = () => {
    if (isAuthenticated) {
      navigate(role === 'hr' ? '/hr' : '/employee');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-600 selection:text-white">
      {/* Top Enterprise Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow-brand transition-transform group-hover:scale-105">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">Attrition Intelligence</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block">Enterprise HR SaaS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Product</a>
            <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#communication" className="hover:text-white transition-colors">Communication</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Ethics</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePortalRedirect}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Go to {role === 'hr' ? 'HR Console' : 'Employee Workspace'}
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Sign in
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Explore Platform
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Employee Attrition Intelligence Platform</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Powered by calibrated Random Forest ML • 88.10% accuracy • Decision Support Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role-Based Access Control (RBAC)
            </span>
            <span>Privacy-First Analytics</span>
            <span>© 2026 Enterprise Talent Systems</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
