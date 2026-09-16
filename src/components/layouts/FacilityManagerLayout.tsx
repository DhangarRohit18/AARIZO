import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  Clock,
  Calendar,
  Trash2,
  Zap,
  LogOut,
  Bell,
  Home,
} from 'lucide-react';

export const FacilityManagerLayout: React.FC = () => {
  const { currentUser, logout, selectedRole, switchRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Facility Dashboard', path: '/facility', icon: Home },
    { label: 'Maintenance Tasks', path: '/facility/maintenance', icon: Wrench },
    { label: 'Staff Shifts & Roster', path: '/facility/shifts', icon: Clock },
    { label: 'AMC Contracts', path: '/facility/amc', icon: Calendar },
    { label: 'Housekeeping & Waste', path: '/facility/cleaning', icon: Trash2 },
    { label: 'Utilities & Power', path: '/facility/utilities', icon: Zap },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600/20 text-amber-400 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white">Facility Operations Manager</h1>
            <p className="text-[10px] text-slate-400">Green Valley Society • {currentUser?.name || 'Facility Manager'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-1.5"
          >
            <option value="FACILITY_MANAGER">FACILITY MANAGER</option>
            <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
            <option value="SERVICE_PROVIDER">SERVICE PROVIDER</option>
          </select>
          <button onClick={logout} className="p-2 text-rose-400 hover:text-rose-300">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-w-0">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
