import React from 'react';
import { useComplaints } from '../../domains/complaints/services/useComplaints';
import { useMoves } from '../../domains/moves/services/useMoves';
import { useRenovations } from '../../domains/renovations/services/useRenovations';
import { useCompliance } from '../../domains/compliance/services/useCompliance';
import type { RBACUser } from '../../types/rbac';
import { can } from '../../utils/permissions';

export const ResidentDashboard: React.FC<{ user: RBACUser }> = ({ user }) => {
  const societyId = user.societyId!;
  const residentId = user.id;

  // Realtime hooks explicitly scoped for the specific Resident
  const { complaints, loading: compLoading } = useComplaints(societyId, residentId);
  const { activeResidentMoves, loading: movesLoading } = useMoves(societyId, residentId);
  const { activeRenovations, pendingApprovals: renPending, loading: renLoading } = useRenovations(societyId, 'RESIDENT', residentId);
  
  const loading = compLoading || movesLoading || renLoading;

  if (loading) {
    return <div className="p-4">Syncing your household data...</div>;
  }

  const allResidentRenovations = [...activeRenovations, ...renPending];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}</h1>
          <p className="text-gray-500">Flat {user.flatNumber}</p>
        </div>
      </div>
      
      {/* 
        Placeholder for Visitors & Parcels
      */}
      <div className="grid grid-cols-2 gap-4">
        <section className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
          <h2 className="text-sm font-bold text-gray-400 mb-2">My Visitors</h2>
          <p className="text-xs text-gray-400">Live stream pending module completion.</p>
        </section>
        <section className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
          <h2 className="text-sm font-bold text-gray-400 mb-2">My Parcels</h2>
          <p className="text-xs text-gray-400">Live stream pending module completion.</p>
        </section>
      </div>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="bg-red-100 text-red-800 p-1.5 rounded-lg text-sm">🎫</span>
          My Tickets & Complaints
        </h2>
        {complaints.length === 0 ? (
          <p className="text-gray-500 text-sm">You have no active complaints.</p>
        ) : (
          <ul className="space-y-3">
            {complaints.map(comp => (
              <li key={comp.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{comp.title}</p>
                  <p className="text-xs text-gray-500">Category: {comp.category}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  {comp.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 p-1.5 rounded-lg text-sm">📦</span>
          My Move Requests
        </h2>
        {activeResidentMoves.length === 0 ? (
          <p className="text-gray-500 text-sm">No active moves.</p>
        ) : (
          <ul className="space-y-3">
            {activeResidentMoves.map(move => (
              <li key={move.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{move.type} - {new Date(move.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Lift Slot: {move.timeSlot}</p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {move.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="bg-orange-100 text-orange-800 p-1.5 rounded-lg text-sm">🔨</span>
          My Renovations
        </h2>
        {allResidentRenovations.length === 0 ? (
          <p className="text-gray-500 text-sm">No ongoing renovations.</p>
        ) : (
          <ul className="space-y-3">
            {allResidentRenovations.map(ren => (
              <li key={ren.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">Contractor: {ren.contractor.companyName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(ren.startDate).toLocaleDateString()} - {new Date(ren.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {ren.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
};
