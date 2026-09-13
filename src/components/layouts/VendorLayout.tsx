import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, ShoppingBag, Bell, LogOut } from 'lucide-react';

export const VendorLayout: React.FC = () => {
  const { currentUser, logout, selectedRole, switchRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Vendor Dashboard', path: '/vendor', icon: Store },
    { label: 'Orders & Service Portal', path: '/vendor/portal', icon: ShoppingBag },
    { label: 'Notification Center', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600/20 text-amber-400 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xs md:text-sm text-white">Vendor Marketplace Hub</h1>
            <p className="text-[10px] text-slate-400">Fresh Mart Grocery • {currentUser?.name || 'Partner Portal'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="hidden sm:block bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-1.5"
          >
            <option value="VENDOR">VENDOR</option>
            <option value="SERVICE_PROVIDER">SERVICE PROVIDER</option>
            <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
          </select>
          <Link to="/notifications" className="p-2 text-slate-400 hover:text-white relative">
            <Bell className="w-5 h-5" />
          </Link>
          <button onClick={logout} className="p-2 text-rose-400 hover:text-rose-300">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-w-0">
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
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-2 flex items-center justify-around z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] font-semibold transition ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
