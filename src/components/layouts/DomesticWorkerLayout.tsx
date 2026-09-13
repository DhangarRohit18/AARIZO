import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  Home,
  QrCode,
  LogOut,
} from 'lucide-react';

export const DomesticWorkerLayout: React.FC = () => {
  const { currentUser, logout, selectedRole, switchRole } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white">Domestic Staff Portal</h1>
            <p className="text-[10px] text-slate-400">{currentUser?.name || 'Sunita Devi'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => switchRole(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-1.5"
          >
            <option value="DOMESTIC_WORKER">DOMESTIC WORKER</option>
            <option value="RESIDENT">RESIDENT</option>
          </select>
          <button onClick={logout} className="p-2 text-rose-400 hover:text-rose-300">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto bg-slate-900/40">
        <Outlet />
      </main>
    </div>
  );
};
