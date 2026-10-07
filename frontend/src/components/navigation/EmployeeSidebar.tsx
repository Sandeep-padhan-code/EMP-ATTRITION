import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  User,
  MessageSquare,
  Bell,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

export const EmployeeSidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/employee', label: 'My Workspace', icon: Home, end: true },
    { to: '/employee/profile', label: 'My Profile', icon: User },
    { to: '/employee/messages', label: 'HR Check-ins', icon: MessageSquare },
    { to: '/employee/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
          <HeartHandshake className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight block">People Connect</span>
          <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase block">Employee Portal</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Employee Info Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60 text-xs">
          <p className="font-semibold text-slate-200">{user?.name}</p>
          <p className="text-slate-400 text-[11px] mt-0.5">{user?.job_role}</p>
          <p className="text-slate-500 text-[10px] mt-1">{user?.department}</p>
        </div>
      </div>
    </aside>
  );
};
