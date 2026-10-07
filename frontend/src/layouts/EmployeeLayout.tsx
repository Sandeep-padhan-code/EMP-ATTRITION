import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EmployeeSidebar } from '../components/navigation/EmployeeSidebar';
import { Topbar } from '../components/navigation/Topbar';
import { Loader2 } from 'lucide-react';

export const EmployeeLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs text-slate-500 font-medium">Loading employee workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/employee" replace />;
  }

  // Employees access employee portal; HR can also preview if they wish
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <EmployeeSidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
