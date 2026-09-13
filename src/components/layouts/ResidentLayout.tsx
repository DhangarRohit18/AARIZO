import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  UserCheck,
  CreditCard,
  Wrench,
  Store,
  Sparkles,
  Users,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  BedDouble,
  Bell,
  LogOut,
  Car,
  HardHat,
  Menu,
  X,
  Building2,
} from 'lucide-react';

export const ResidentLayout: React.FC = () => {
  const { currentUser, logout, selectedRole, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Resident Home', path: '/resident', icon: Home },
    { label: 'My Flat Info', path: '/resident/my-flat', icon: Building2 },
    { label: 'Visitor Pass Hub', path: '/resident/visitors', icon: UserCheck },
    { label: 'My Parking Pass', path: '/resident/parking', icon: Car },
    { label: 'Domestic Help Hub', path: '/resident/domestic-help', icon: HardHat },
    { label: 'Maintenance Requests', path: '/resident/maintenance', icon: Wrench },
    { label: 'Society Billing & Receipt', path: '/resident/billing', icon: CreditCard },
    { label: 'Society Marketplace', path: '/resident/marketplace', icon: Store },
    { label: 'Amenity Bookings', path: '/resident/amenities', icon: Sparkles },
    { label: 'Community Hub', path: '/resident/community', icon: Users },
    { label: 'Child Safety Portal', path: '/resident/child-safety', icon: ShieldCheck },
    { label: 'SOS Emergency SOS', path: '/resident/emergency', icon: ShieldAlert },
    { label: 'Garbage Operations', path: '/resident/garbage', icon: Trash2 },
    { label: 'Guest Accommodation', path: '/resident/guest-stay', icon: BedDouble },
    { label: 'Notification Center', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      {/* Top Header */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xs md:text-sm text-white">Green Valley Resident</h1>
              <p className="text-[10px] text-slate-400">Flat B-301 • {currentUser?.name || 'Siddharth Patel'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="hidden sm:block bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-1.5"
          >
            <option value="RESIDENT">RESIDENT</option>
            <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
            <option value="SECURITY">SECURITY GUARD</option>
          </select>
          <Link to="/notifications" className="p-2 text-slate-400 hover:text-white relative">
            <Bell className="w-5 h-5" />
          </Link>
          <button onClick={logout} className="p-2 text-rose-400 hover:text-rose-300">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Slide-over */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 border-r border-slate-800 p-4 space-y-4 overflow-y-auto flex flex-col z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white">Resident Portal</h2>
                  <p className="text-[10px] text-slate-400">Green Valley Society</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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
                <label className="text-[10px] text-slate-500 uppercase font-bold">Switch Persona</label>
                <select
                  value={selectedRole}
                  onChange={(e) => switchRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-2"
                >
                  <option value="RESIDENT">RESIDENT</option>
                  <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
                  <option value="SECURITY">SECURITY GUARD</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
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

      {/* Main Area */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 shrink-0 overflow-y-auto max-h-screen">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-2 flex items-center justify-around z-40">
        {[
          { label: 'Home', path: '/resident', icon: Home },
          { label: 'Visitors', path: '/resident/visitors', icon: UserCheck },
          { label: 'Maintenance', path: '/resident/maintenance', icon: Wrench },
          { label: 'Market', path: '/resident/marketplace', icon: Store },
          { label: 'SOS', path: '/resident/emergency', icon: ShieldAlert },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] font-semibold transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
