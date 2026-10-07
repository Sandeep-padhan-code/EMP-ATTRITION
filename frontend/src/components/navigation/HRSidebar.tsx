import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const HRSidebar: React.FC = () => {
  const navItems: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { to: '/hr', label: 'Overview', icon: LayoutDashboard, end: true },
      ],
    },
    {
      group: 'People',
      items: [
        { to: '/hr/employees', label: 'Employees', icon: Users },
      ],
    },
    {
      group: 'Insights',
      items: [
        { to: '/hr/intelligence', label: 'Attrition Intelligence', icon: BrainCircuit },
        { to: '/hr/reports', label: 'Reports', icon: FileSpreadsheet },
      ],
    },
    {
      group: 'Communication',
      items: [
        { to: '/hr/messages', label: 'Messages', icon: MessageSquare },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-glow-brand">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight block">Attrition Intelligence</span>
          <span className="text-[10px] text-brand-400 font-mono tracking-wider uppercase block">Enterprise Edition</span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {group.group}
            </h4>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
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
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">ML Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Random Forest model calibrated (88.1% accuracy). 1,470 records synchronized.
          </p>
        </div>
      </div>
    </aside>
  );
};
