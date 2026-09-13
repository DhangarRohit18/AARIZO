import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Zap,
  Droplet,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  Radio,
  QrCode,
  History,
  PhoneCall,
  UserPlus,
  Lock,
} from 'lucide-react';
import { safetyCommandEngine } from '../services/safetyCommandEngine';
import { EmergencyIncidentItem, IncidentStatus, EmergencyCategory, ChildProfileItem, PickupRecord } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

export const SafetyCommandHub: React.FC = () => {
  const { currentUser, selectedRole } = useAuth();
  const activeRole = (currentUser?.role || selectedRole || '').toUpperCase();

  const isAdminOrSecurity = ['SOCIETY_ADMIN', 'SUPER_ADMIN', 'SECRETARY', 'SECURITY', 'GUARD', 'SECURITY_GUARD'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'ONE_TAP_SOS' | 'COMMAND_CONSOLE' | 'CHILD_SAFETY' | 'GATE_VERIFIER'>('ONE_TAP_SOS');
  const [incidents, setIncidents] = useState<EmergencyIncidentItem[]>(() => safetyCommandEngine.getIncidents());
  const [children, setChildren] = useState<ChildProfileItem[]>(() => safetyCommandEngine.getChildren());
  const [pickups, setPickups] = useState<PickupRecord[]>(() => safetyCommandEngine.getPickupRecords());

  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncidentItem | null>(null);
  const [modalMode, setModalMode] = useState<'ASSIGN_RESPONDER' | 'TIMELINE' | 'ADD_CHILD' | 'ADD_PICKUP' | null>(null);

  // Forms
  const [responderForm, setResponderForm] = useState({
    responderName: 'Guard Ramesh Shinde',
    responderRole: 'Head Security',
  });

  const [childForm, setChildForm] = useState({
    childName: 'Aarav Malhotra',
    flatCode: 'A-101',
    guardianName: currentUser?.name || 'Siddharth Malhotra',
    guardianPhone: currentUser?.phone || '+91 98765 00000',
  });

  const [pickupForm, setPickupForm] = useState({
    name: 'Rohan Nanny',
    phone: '+91 98765 99887',
    relationship: 'Nanny',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-9900',
  });

  const [scanChildInput, setScanChildInput] = useState('');
  const [scanPickupInput, setScanPickupInput] = useState('');
  const [gateResult, setGateResult] = useState<{ isValid: boolean; child?: ChildProfileItem; reason?: string } | null>(null);

  const loadData = () => {
    setIncidents(safetyCommandEngine.getIncidents());
    setChildren(safetyCommandEngine.getChildren());
    setPickups(safetyCommandEngine.getPickupRecords());
  };

  useEffect(() => {
    loadData();
    const unsubscribeEmergency = realTimeSync.subscribe('EMERGENCY_ALERTS', () => loadData());
    const unsubscribeChild = realTimeSync.subscribe('CHILD_SAFETY_UPDATED', () => loadData());
    return () => {
      unsubscribeEmergency();
      unsubscribeChild();
    };
  }, []);

  const handleTriggerSOS = (category: EmergencyCategory) => {
    safetyCommandEngine.triggerOneTapSOS(
      category,
      currentUser?.id || 'res-1',
      currentUser?.name || 'Siddharth Malhotra',
      'A-101',
      currentUser?.phone || '+91 98765 00000',
      'Tower A, Flat 101'
    );
    loadData();
    alert(`ONE-TAP ${category} SOS DISPATCHED! Security Command Console & Family notified.`);
  };

  const handleAcknowledge = (id: string) => {
    safetyCommandEngine.acknowledgeIncident(id, currentUser?.name || 'Security Post');
    loadData();
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    safetyCommandEngine.assignResponder(
      selectedIncident.id,
      responderForm.responderName,
      responderForm.responderRole,
      currentUser?.name || 'Security Command'
    );

    setModalMode(null);
    loadData();
  };

  const handleResolve = (id: string) => {
    safetyCommandEngine.resolveIncident(id, 'RESOLVED', 'Incident resolved cleanly on site.', currentUser?.name || 'Security Post');
    loadData();
  };

  const handleAddChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    safetyCommandEngine.addChildProfile(childForm.childName, childForm.flatCode, childForm.guardianName, childForm.guardianPhone);
    setModalMode(null);
    loadData();
    alert('Child safety profile registered.');
  };

  const handleAddPickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!children[0]) return;
    safetyCommandEngine.addAuthorizedPickup(children[0].id, pickupForm);
    setModalMode(null);
    loadData();
    alert('Authorized pickup person added.');
  };

  const handleGateVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = safetyCommandEngine.verifyChildPickupAtGate(
      scanChildInput,
      scanPickupInput,
      currentUser?.name || 'Gate Guard'
    );
    setGateResult(result);
    loadData();
  };

  const getCategoryIcon = (cat: EmergencyCategory) => {
    switch (cat) {
      case 'MEDICAL':
        return <ShieldAlert className="text-rose-600" size={24} />;
      case 'FIRE':
        return <Flame className="text-amber-600" size={24} />;
      case 'SECURITY':
        return <ShieldCheck className="text-indigo-600" size={24} />;
      case 'CHILD_SAFETY':
        return <Users className="text-purple-600" size={24} />;
      case 'LIFT':
        return <AlertTriangle className="text-blue-600" size={24} />;
      case 'ELECTRICAL':
        return <Zap className="text-yellow-600" size={24} />;
      case 'WATER':
        return <Droplet className="text-cyan-600" size={24} />;
      default:
        return <AlertTriangle className="text-slate-600" size={24} />;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'TRIGGERED':
        return <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-full animate-ping">TRIGGERED</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-3 py-1 bg-amber-500 text-white font-bold text-xs rounded-full">ACKNOWLEDGED</span>;
      case 'RESPONDING':
        return <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-full">RESPONDING</span>;
      case 'RESOLVED':
        return <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-3 py-1 bg-slate-600 text-white font-bold text-xs rounded-full">CLOSED</span>;
    }
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <ShieldAlert size={24} className="animate-pulse" />
            </span>
            <h2 className="text-xl font-bold">Safety Command Center & Emergency Dispatch</h2>
          </div>
          <p className="text-slate-400 text-sm">
            One-Tap Emergency SOS, real-time command console, child pickup authorization & guardian alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeIncidents.length > 0 && (
            <span className="px-4 py-2 bg-rose-600 text-white text-xs font-extrabold rounded-xl shadow-lg animate-pulse flex items-center gap-1.5">
              <Radio size={16} /> {activeIncidents.length} ACTIVE INCIDENTS
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 bg-white px-4 rounded-xl shadow-sm">
        {[
          { key: 'ONE_TAP_SOS', label: 'One-Tap Emergency SOS', icon: ShieldAlert },
          { key: 'COMMAND_CONSOLE', label: `Command Console (${activeIncidents.length} Active)`, icon: Radio },
          { key: 'CHILD_SAFETY', label: 'Child Safety & Pickups', icon: Users },
          { key: 'GATE_VERIFIER', label: 'Gate Child Verification', icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 font-semibold text-xs md:text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: ONE-TAP SOS */}
      {activeTab === 'ONE_TAP_SOS' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <Lock size={16} className="text-amber-700 flex-shrink-0" />
            <span>
              <strong>Strict AI Boundary Rule:</strong> AI is strictly prohibited from independently making child-safety or gate entry decisions. All authorizations remain guardian-verified.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(
              [
                { category: 'MEDICAL', title: 'Medical Emergency', desc: 'Ambulance & Doctor Alert' },
                { category: 'FIRE', title: 'Fire Alert', desc: 'Fire System & Evacuation' },
                { category: 'SECURITY', title: 'Security Threat', desc: 'Intruder / Security Alert' },
                { category: 'CHILD_SAFETY', title: 'Child Safety SOS', desc: 'Missing / Unsafe Alert' },
                { category: 'LIFT', title: 'Lift Trapped', desc: 'Elevator Emergency Trap' },
                { category: 'ELECTRICAL', title: 'Electrical Hazard', desc: 'Spark / Power Threat' },
                { category: 'WATER', title: 'Severe Water Leak', desc: 'Burst Pipe Emergency' },
              ] as { category: EmergencyCategory; title: string; desc: string }[]
            ).map((sos) => (
              <div
                key={sos.category}
                onClick={() => handleTriggerSOS(sos.category)}
                className="bg-white p-5 rounded-2xl border-2 border-rose-100 hover:border-rose-500 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-rose-50 rounded-xl w-fit">{getCategoryIcon(sos.category)}</div>
                  <h4 className="font-extrabold text-slate-900 text-base">{sos.title}</h4>
                  <p className="text-xs text-slate-500">{sos.desc}</p>
                </div>

                <button className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1">
                  <Radio size={14} className="animate-pulse" /> TAP TO DISPATCH SOS
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: COMMAND CONSOLE */}
      {activeTab === 'COMMAND_CONSOLE' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Live Incident Feed & Response Console</h3>
            <button onClick={loadData} className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {inc.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{inc.title}</h4>
                  </div>
                  <div>{getStatusBadge(inc.status)}</div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    Resident: <strong className="text-slate-900">{inc.residentName}</strong> ({inc.flatCode}) • Phone:{' '}
                    {inc.phone}
                  </div>
                  <div>Location: {inc.location}</div>
                  {inc.responderName && (
                    <div className="text-indigo-600 font-bold">
                      Assigned Responder: {inc.responderName} ({inc.responderRole})
                    </div>
                  )}
                </div>

                {/* Response Actions */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-2">
                  <div className="text-[11px] text-slate-400">Triggered: {new Date(inc.createdAt).toLocaleString()}</div>

                  <div className="flex items-center gap-2">
                    {isAdminOrSecurity && inc.status === 'TRIGGERED' && (
                      <button
                        onClick={() => handleAcknowledge(inc.id)}
                        className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Acknowledge Alert
                      </button>
                    )}

                    {isAdminOrSecurity && (inc.status === 'TRIGGERED' || inc.status === 'ACKNOWLEDGED') && (
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setModalMode('ASSIGN_RESPONDER');
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Assign Responder
                      </button>
                    )}

                    {isAdminOrSecurity && inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleResolve(inc.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: CHILD SAFETY */}
      {activeTab === 'CHILD_SAFETY' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Guardian-Authorized Child Safety Roster</h3>
              <p className="text-xs text-slate-500">Authorized pickup persons & time-bound QR passes.</p>
            </div>
            <button
              onClick={() => setModalMode('ADD_CHILD')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <UserPlus size={15} /> Add Child Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <div key={child.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{child.childName}</h4>
                    <p className="text-xs text-slate-500">
                      Flat {child.flatCode} • Guardian: <strong className="text-slate-800">{child.guardianName}</strong>
                    </p>
                  </div>
                  <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-md">
                    {child.qrPassCode}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-slate-700">Authorized Pickup Persons ({child.authorizedPickups.length})</h5>
                    <button
                      onClick={() => {
                        setSelectedIncident(null);
                        setModalMode('ADD_PICKUP');
                      }}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      + Add Authorized Person
                    </button>
                  </div>

                  <div className="space-y-1">
                    {child.authorizedPickups.map((p) => (
                      <div key={p.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-slate-800">{p.name}</span>
                          <span className="text-slate-400 text-[10px]"> ({p.relationship})</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          APPROVED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: GATE VERIFIER */}
      {activeTab === 'GATE_VERIFIER' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <QrCode size={36} className="mx-auto text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Gate Security Child Exit Verifier</h3>
            <p className="text-xs text-slate-500">Verify child name or QR pass against guardian authorization list.</p>
          </div>

          <form onSubmit={handleGateVerifySubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Child Name or Pass Code</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Malhotra"
                value={scanChildInput}
                onChange={(e) => setScanChildInput(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Person Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunita Devi (Nanny)"
                value={scanPickupInput}
                onChange={(e) => setScanPickupInput(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> Verify Guardian Authorization
            </button>
          </form>

          {gateResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 mt-4 ${
                gateResult.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {gateResult.isValid ? (
                  <CheckCircle2 className="text-emerald-600" size={18} />
                ) : (
                  <AlertTriangle className="text-rose-600" size={18} />
                )}
                <span className={gateResult.isValid ? 'text-emerald-900' : 'text-rose-900'}>
                  {gateResult.isValid ? 'GATE CLEARED - AUTHORIZED PICKUP' : 'EXIT DENIED'}
                </span>
              </div>
              {gateResult.reason && <p className="text-xs text-slate-700 font-semibold">{gateResult.reason}</p>}
            </div>
          )}
        </div>
      )}

      {/* Modal: Assign Responder */}
      {modalMode === 'ASSIGN_RESPONDER' && selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Assign Emergency Responder</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responder Name</label>
                <input
                  type="text"
                  required
                  value={responderForm.responderName}
                  onChange={(e) => setResponderForm({ ...responderForm, responderName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responder Role</label>
                <input
                  type="text"
                  required
                  value={responderForm.responderRole}
                  onChange={(e) => setResponderForm({ ...responderForm, responderRole: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-500"
                >
                  Dispatch Responder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Child */}
      {modalMode === 'ADD_CHILD' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Child Profile</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddChildSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Child Name</label>
                <input
                  type="text"
                  required
                  value={childForm.childName}
                  onChange={(e) => setChildForm({ ...childForm, childName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Code</label>
                  <input
                    type="text"
                    required
                    value={childForm.flatCode}
                    onChange={(e) => setChildForm({ ...childForm, flatCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={childForm.guardianName}
                    onChange={(e) => setChildForm({ ...childForm, guardianName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Pickup */}
      {modalMode === 'ADD_PICKUP' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Authorized Pickup Person</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddPickupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Person Name</label>
                <input
                  type="text"
                  required
                  value={pickupForm.name}
                  onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={pickupForm.phone}
                    onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    required
                    value={pickupForm.relationship}
                    onChange={(e) => setPickupForm({ ...pickupForm, relationship: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
                >
                  Save Authorized Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
