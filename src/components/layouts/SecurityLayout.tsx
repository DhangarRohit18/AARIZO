import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  QrCode,
  Car,
  HardHat,
  Package,
  ShieldCheck,
  Bell,
  LogOut,
  BedDouble,
  Menu,
  X,
} from 'lucide-react';

export const SecurityLayout: React.FC = () => {
  const { currentUser, logout, selectedRole, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Gate Terminal', path: '/security', icon: QrCode },
    { label: 'Parking Scanner', path: '/security/parking', icon: Car },
    { label: 'Staff Terminal', path: '/security/staff-scanner', icon: HardHat },
    { label: 'Child Gate', path: '/security/child-safety', icon: ShieldCheck },
    { label: 'Delivery Intelligence', path: '/security/delivery-intelligence', icon: Package },
    { label: 'Emergency Command', path: '/security/emergency-command', icon: ShieldAlert },
    { label: 'Guest Stay Scanner', path: '/security/guest-stay', icon: BedDouble },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      {/* Top Header Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-slate-300 rounded-lg hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="p-2 bg-rose-600/20 text-rose-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xs md:text-sm text-white">Security Command</h1>
            <p className="text-[10px] text-slate-400">Green Valley • {currentUser?.name || 'Gate 1'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="hidden sm:block bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-1.5"
          >
            <option value="SECURITY">SECURITY GUARD</option>
            <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
            <option value="RESIDENT">RESIDENT</option>
          </select>
          <Link to="/notifications" className="p-2 text-slate-400 hover:text-white relative">
            <Bell className="w-5 h-5" />
          </Link>
          <button onClick={logout} className="p-2 text-rose-400 hover:text-rose-300">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 border-r border-slate-800 p-4 space-y-4 overflow-y-auto flex flex-col z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-600/20 text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white">Security Gate</h2>
                  <p className="text-[10px] text-slate-400">Green Valley Society</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Role Switcher</label>
                <select
                  value={selectedRole}
                  onChange={(e) => switchRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-2"
                >
                  <option value="SECURITY">SECURITY GUARD</option>
                  <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
                  <option value="RESIDENT">RESIDENT</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg text-xs font-semibold transition border border-rose-900/30"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-2 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Page Content Container */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (QR-First Security Actions) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-2 flex items-center justify-around z-40">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] font-semibold transition ${
                isActive ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
