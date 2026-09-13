import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Building2, Bell, LogOut, Menu, X, Globe, BarChart3, Lock, Radio } from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const { currentUser, logout, selectedRole, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Super Admin Overview', path: '/super-admin', icon: ShieldCheck },
    { label: 'Multi-Society Directory', path: '/super-admin/societies', icon: Building2 },
    { label: 'Society Intelligence', path: '/admin/intelligence', icon: BarChart3 },
    { label: 'Security & Audit Logs', path: '/admin/security-audit', icon: Lock },
    { label: 'Realtime Operations', path: '/admin/realtime', icon: Radio },
    { label: 'Notifications Center', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-white">CommunityOS</h1>
            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Super Admin Console</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="px-3 text-[10px] text-slate-500 uppercase font-bold">Role Switcher</div>
          <select
            value={selectedRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-2"
          >
            <option value="SUPER_ADMIN">SUPER ADMIN</option>
            <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
            <option value="RESIDENT">RESIDENT</option>
            <option value="SECURITY">SECURITY GUARD</option>
          </select>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/30 rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

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
                <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white">Super Admin</h2>
                  <p className="text-[10px] text-slate-400">CommunityOS Global</p>
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
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
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
                  <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
                  <option value="RESIDENT">RESIDENT</option>
                  <option value="SECURITY">SECURITY GUARD</option>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-bold text-xs text-purple-400">Super Admin</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Global System Active
          </div>

          <div className="flex items-center gap-4">
            <Link to="/notifications" className="p-2 text-slate-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                SA
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-white">{currentUser?.name || 'Super Admin'}</div>
                <div className="text-[10px] text-slate-400">Global Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
