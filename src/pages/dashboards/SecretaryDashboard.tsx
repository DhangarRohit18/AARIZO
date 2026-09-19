import React from 'react';
import { useComplaints } from '../../domains/complaints/services/useComplaints';
import { useMoves } from '../../domains/moves/services/useMoves';
import { useRenovations } from '../../domains/renovations/services/useRenovations';
import { useCompliance } from '../../domains/compliance/services/useCompliance';
import { useAIInsights } from '../../domains/ai/services/useAIInsights';
import { aiService } from '../../repositories/ai/AIService';
import type { RBACUser } from '../../types/rbac';

export const SecretaryDashboard: React.FC<{ user: RBACUser }> = ({ user }) => {
  const societyId = user.societyId!;
  
  // Realtime hooks scoped for the Secretary
  const { openComplaints, breachedComplaints, loading: compLoading } = useComplaints(societyId);
  const { pendingApproval: movePending, loading: movesLoading } = useMoves(societyId);
  const { pendingApprovals: renPending, loading: renLoading } = useRenovations(societyId, 'SECRETARY');
  const { expiringContracts, expiredContracts, loading: amcLoading } = useCompliance(societyId, 'ADMIN');
  const { insights: pendingInsights, loading: aiLoading } = useAIInsights(societyId, 'PENDING_REVIEW');

  const loading = compLoading || movesLoading || renLoading || amcLoading || aiLoading;

  if (loading) {
    return <div className="p-4">Syncing Operations Data...</div>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Operations Command Center</h1>
      
      {/* AI Intelligence Insights (Zero-Trust Queue) */}
      {pendingInsights.length > 0 && (
        <section className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
            ✨ AI Operational Insights ({pendingInsights.length})
          </h2>
          <ul className="space-y-3">
            {pendingInsights.map(insight => (
              <li key={insight.id} className="p-4 bg-white border border-indigo-100 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                    {insight.context.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    Confidence: {(insight.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-lg mb-1">{insight.recommendation}</p>
                <p className="text-sm text-gray-600 mb-4">{insight.reason}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => aiService.resolveInsight(insight.id, 'ACCEPTED', user.id)}
                    className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded font-medium hover:bg-indigo-700"
                  >
                    Accept & Execute
                  </button>
                  <button 
                    onClick={() => aiService.resolveInsight(insight.id, 'REJECTED', user.id)}
                    className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded font-medium hover:bg-gray-200"
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Critical SLA Breaches */}
      {breachedComplaints.length > 0 && (
        <section className="bg-red-50 p-4 rounded-xl border border-red-200">
          <h2 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
            ⚠️ SLA Breaches ({breachedComplaints.length})
          </h2>
          <ul className="space-y-2">
            {breachedComplaints.map(comp => (
              <li key={comp.id} className="p-3 bg-white border border-red-100 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold text-red-900">{comp.title}</p>
                  <p className="text-xs text-red-600">Escalation Level: {comp.escalationLevel}</p>
                </div>
                <button className="text-sm bg-red-600 text-white px-3 py-1 rounded">Intervene</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="space-y-6">
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 p-1.5 rounded-lg text-sm">📥</span>
              Pending Move Approvals
            </h2>
            {movePending.length === 0 ? (
              <p className="text-gray-500 text-sm">All caught up.</p>
            ) : (
              <ul className="space-y-3">
                {movePending.map(move => (
                  <li key={move.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{move.residentName}</p>
                      <p className="text-xs text-gray-500">{new Date(move.date).toLocaleDateString()}</p>
                    </div>
                    <button className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-100">Review</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-800 p-1.5 rounded-lg text-sm">🔨</span>
              Pending Renovations
            </h2>
            {renPending.length === 0 ? (
              <p className="text-gray-500 text-sm">All caught up.</p>
            ) : (
              <ul className="space-y-3">
                {renPending.map(ren => (
                  <li key={ren.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Flat {ren.flatCode}</p>
                      <p className="text-xs text-gray-500">{ren.contractor.companyName}</p>
                    </div>
                    <button className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded font-medium hover:bg-orange-100">Review</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Operational Overview */}
        <div className="space-y-6">
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 p-1.5 rounded-lg text-sm">📄</span>
              Expiring AMCs
            </h2>
            {expiringContracts.length === 0 && expiredContracts.length === 0 ? (
              <p className="text-gray-500 text-sm">All contracts active.</p>
            ) : (
              <ul className="space-y-3">
                {expiredContracts.map(amc => (
                  <li key={amc.id} className="p-3 border border-red-200 bg-red-50 rounded">
                    <div className="flex justify-between">
                      <p className="font-semibold text-red-900">{amc.title}</p>
                      <span className="text-xs text-red-800 bg-red-200 px-2 rounded-full">EXPIRED</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">Expired on {new Date(amc.contractEnd).toLocaleDateString()}</p>
                  </li>
                ))}
                {expiringContracts.map(amc => (
                  <li key={amc.id} className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                    <div className="flex justify-between">
                      <p className="font-semibold text-yellow-900">{amc.title}</p>
                      <span className="text-xs text-yellow-800 bg-yellow-200 px-2 rounded-full">SOON</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">Expires {new Date(amc.contractEnd).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
