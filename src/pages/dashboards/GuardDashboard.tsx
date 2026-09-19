import React from 'react';
import { useMoves } from '../../domains/moves/services/useMoves';
import { useRenovations } from '../../domains/renovations/services/useRenovations';
import type { RBACUser } from '../../types/rbac';

export const GuardDashboard: React.FC<{ user: RBACUser }> = ({ user }) => {
  const societyId = user.societyId!;
  
  // Realtime hooks explicitly scoped for the Guard's visibility
  const { todaysMoves, loading: movesLoading } = useMoves(societyId);
  const { activeRenovations, loading: renLoading } = useRenovations(societyId, 'guard');

  if (movesLoading || renLoading) {
    return <div className="p-4">Loading Live Gate Data...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Gate Security Hub</h1>
      
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 p-1.5 rounded-lg text-sm">ðŸšš</span>
          Today's Scheduled Moves
        </h2>
        {todaysMoves.length === 0 ? (
          <p className="text-gray-500 text-sm">No moves scheduled for today.</p>
        ) : (
          <ul className="space-y-3">
            {todaysMoves.map(move => (
              <li key={move.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{move.residentName} (Flat {move.flatCode})</p>
                  <p className="text-sm text-gray-600">{move.type} - Vendor: {move.vendor.companyName}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {move.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="bg-orange-100 text-orange-800 p-1.5 rounded-lg text-sm">ðŸš§</span>
          Active Renovations
        </h2>
        {activeRenovations.length === 0 ? (
          <p className="text-gray-500 text-sm">No active renovations inside the premises.</p>
        ) : (
          <ul className="space-y-3">
            {activeRenovations.map(ren => (
              <li key={ren.id} className="p-3 border rounded">
                <p className="font-semibold">Flat {ren.flatCode}</p>
                <p className="text-sm text-gray-600">Contractor: {ren.contractor.companyName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Allowed: {ren.rules.allowedHoursStart} - {ren.rules.allowedHoursEnd} 
                  {ren.rules.allowWeekends ? ' (Weekends OK)' : ' (No Weekends)'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      
      {/* 
        Placeholder for Visitors & Deliveries
        To be wired up when those modules are complete.
      */}
      <section className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
         <h2 className="text-lg font-bold text-gray-400 mb-2">Visitors & Deliveries</h2>
         <p className="text-sm text-gray-400">Live streams pending module completion.</p>
      </section>
    </div>
  );
};

