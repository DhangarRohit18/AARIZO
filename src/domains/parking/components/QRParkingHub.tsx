import React, { useState, useEffect } from 'react';
import {
  Car,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Camera,
  Ban,
  Clock,
  Layers,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { qrParkingService } from '../services/qrParkingService';
import { ParkingSlotItem, ParkingViolationRecord, ParkingType, OccupancyState, ParkingPassQR } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

export const QRParkingHub: React.FC = () => {
  const { currentUser, selectedRole } = useAuth();
  const activeRole = (currentUser?.role || selectedRole || '').toUpperCase();

  const isAdmin = ['SOCIETY_ADMIN', 'SUPER_ADMIN', 'SECRETARY'].includes(activeRole);
  const isSecurity = ['SECURITY', 'GUARD', 'SECURITY_GUARD', 'SOCIETY_ADMIN'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'MAP' | 'SLOTS' | 'VIOLATIONS' | 'SECURITY_SCANNER' | 'MY_PARKING'>('MAP');
  const [slots, setSlots] = useState<ParkingSlotItem[]>(() => qrParkingService.getSlots());
  const [violations, setViolations] = useState<ParkingViolationRecord[]>(() => qrParkingService.getViolations());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  const [modalMode, setModalMode] = useState<'ADD_SLOT' | 'ASSIGN' | 'REQUEST_PASS' | 'REPORT_VIOLATION' | 'VIEW_PASS' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlotItem | null>(null);
  const [activeQRPass, setActiveQRPass] = useState<ParkingPassQR | null>(null);

  // Forms
  const [slotForm, setSlotForm] = useState({
    slotCode: '',
    level: 'Basement 1',
    parkingType: 'RESIDENT' as ParkingType,
  });

  const [assignForm, setAssignForm] = useState({
    flatCode: 'A-101',
    residentName: 'Siddharth Malhotra',
    vehicleNumber: '',
    parkingType: 'RESIDENT' as ParkingType,
  });

  const [passRequestForm, setPassRequestForm] = useState({
    parkingType: 'TEMPORARY' as ParkingType,
    vehicleNumber: 'MH-12-RS-9988',
    slotCode: 'B1-T01',
    durationDays: 7,
  });

  const [violationForm, setViolationForm] = useState({
    vehicleNumber: '',
    slotCode: '',
    violationType: 'UNAUTHORIZED_PARKING' as any,
    privateNotes: '',
    photoEvidenceUrl: '',
  });

  const [qrScanInput, setQrScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{ isValid: boolean; slot?: ParkingSlotItem; reason?: string } | null>(null);

  const loadData = () => {
    setSlots(qrParkingService.getSlots());
    setViolations(qrParkingService.getViolations());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = realTimeSync.subscribe('PARKING_UPDATED', () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.slotCode) return;
    qrParkingService.createSlot(slotForm.slotCode, slotForm.level, slotForm.parkingType, currentUser?.name || 'Admin');
    setModalMode(null);
    loadData();
    alert('Parking slot created successfully.');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !assignForm.vehicleNumber) return;
    qrParkingService.assignOrReassignSlot(
      selectedSlot.id,
      assignForm.flatCode,
      assignForm.residentName,
      assignForm.vehicleNumber,
      assignForm.parkingType
    );
    setModalMode(null);
    loadData();
    alert('Slot assigned successfully.');
  };

  const handleRequestPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = qrParkingService.generateQRPass(
      passRequestForm.parkingType,
      passRequestForm.vehicleNumber,
      currentUser?.name || 'Resident',
      'A-101',
      passRequestForm.slotCode,
      passRequestForm.durationDays
    );
    setActiveQRPass(pass);
    setModalMode('VIEW_PASS');
    loadData();
  };

  const handleReportViolationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    qrParkingService.reportViolation(
      violationForm.vehicleNumber,
      violationForm.slotCode,
      violationForm.violationType,
      violationForm.privateNotes,
      currentUser?.name || 'Security Guard',
      violationForm.photoEvidenceUrl
    );
    setModalMode(null);
    loadData();
    alert('Violation logged privately. Notification & warning sent to vehicle owner.');
  };

  const handleGateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrScanInput) return;
    const result = qrParkingService.validateQRPassAtGate(qrScanInput);
    setScanResult(result);
  };

  const getSlotColor = (state: OccupancyState) => {
    switch (state) {
      case 'AVAILABLE':
        return 'bg-emerald-50 border-emerald-500 text-emerald-800';
      case 'OCCUPIED':
        return 'bg-rose-50 border-rose-500 text-rose-800';
      case 'RESERVED':
        return 'bg-blue-50 border-blue-500 text-blue-800';
      case 'VISITOR':
        return 'bg-amber-50 border-amber-500 text-amber-800';
      case 'BLOCKED':
        return 'bg-slate-100 border-slate-400 text-slate-600';
      default:
        return 'bg-slate-50 border-slate-300 text-slate-700';
    }
  };

  const filteredSlots = slots.filter((slot) => {
    if (selectedTypeFilter !== 'ALL' && slot.parkingType !== selectedTypeFilter) return false;
    if (selectedStateFilter !== 'ALL' && slot.occupancyState !== selectedStateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        slot.slotCode.toLowerCase().includes(q) ||
        (slot.assignedVehicleNumber && slot.assignedVehicleNumber.toLowerCase().includes(q)) ||
        (slot.assignedFlatCode && slot.assignedFlatCode.toLowerCase().includes(q)) ||
        (slot.assignedResidentName && slot.assignedResidentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const levels = Array.from(new Set(slots.map((s) => s.level)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Car size={24} />
            </span>
            <h2 className="text-xl font-bold">QR Parking System & Enforcement Engine</h2>
          </div>
          <p className="text-slate-400 text-sm">
            6 Parking types, dynamic QR gate validation, visual map layouts & private violation warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalMode('REQUEST_PASS')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
          >
            <QrCode size={16} /> Request Temporary / Vacation Pass
          </button>
          {isAdmin && (
            <button
              onClick={() => setModalMode('ADD_SLOT')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle size={16} /> Create Parking Slot
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 bg-white px-4 rounded-xl shadow-sm">
        {[
          { key: 'MAP', label: 'Visual Parking Map', icon: Layers },
          { key: 'SLOTS', label: `Parking Slots (${slots.length})`, icon: Car },
          { key: 'VIOLATIONS', label: `Private Violations (${violations.length})`, icon: ShieldAlert },
          { key: 'SECURITY_SCANNER', label: 'Gate Security QR Scanner', icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 font-semibold text-xs md:text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: VISUAL MAP */}
      {activeTab === 'MAP' && (
        <div className="space-y-6">
          {/* Legend */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" /> <span>AVAILABLE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" /> <span>OCCUPIED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" /> <span>RESERVED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" /> <span>VISITOR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-500" /> <span>BLOCKED</span>
            </div>
          </div>

          {/* Map Grids */}
          {levels.map((lvl) => {
            const levelSlots = slots.filter((s) => s.level === lvl);
            return (
              <div key={lvl} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-800 text-base">{lvl} Parking Grid Layout</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {levelSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        if (isAdmin) {
                          setAssignForm({
                            flatCode: slot.assignedFlatCode || 'A-101',
                            residentName: slot.assignedResidentName || 'Resident',
                            vehicleNumber: slot.assignedVehicleNumber || '',
                            parkingType: slot.parkingType,
                          });
                          setModalMode('ASSIGN');
                        }
                      }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${getSlotColor(
                        slot.occupancyState
                      )}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-sm">{slot.slotCode}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/80">
                          {slot.parkingType}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-semibold truncate">
                        {slot.assignedVehicleNumber || slot.occupancyState}
                      </div>
                      {slot.assignedFlatCode && (
                        <div className="text-[10px] opacity-80">Flat {slot.assignedFlatCode}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: SLOTS TABLE */}
      {activeTab === 'SLOTS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search slot, vehicle, flat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs"
                />
              </div>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-xs font-semibold bg-white text-slate-700"
              >
                <option value="ALL">All Types</option>
                <option value="RESIDENT">RESIDENT</option>
                <option value="VISITOR">VISITOR</option>
                <option value="TEMPORARY">TEMPORARY</option>
                <option value="VACATION">VACATION</option>
                <option value="SERVICE">SERVICE</option>
                <option value="DELIVERY">DELIVERY</option>
              </select>
            </div>

            <button onClick={loadData} className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {filteredSlots.map((slot) => (
              <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                      {slot.slotCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{slot.level}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {slot.parkingType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Vehicle: <strong className="text-slate-800">{slot.assignedVehicleNumber || 'None'}</strong> • Flat:{' '}
                    {slot.assignedFlatCode || 'N/A'} • Owner: {slot.assignedResidentName || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      slot.occupancyState === 'OCCUPIED'
                        ? 'bg-rose-100 text-rose-800'
                        : slot.occupancyState === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {slot.occupancyState}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setAssignForm({
                          flatCode: slot.assignedFlatCode || 'A-101',
                          residentName: slot.assignedResidentName || 'Resident',
                          vehicleNumber: slot.assignedVehicleNumber || '',
                          parkingType: slot.parkingType,
                        });
                        setModalMode('ASSIGN');
                      }}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg"
                    >
                      Assign / Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: VIOLATIONS */}
      {activeTab === 'VIOLATIONS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Private Parking Violation Logs</h3>
              <p className="text-xs text-slate-500">Evidence photo capture & direct private resident warnings (No public shaming).</p>
            </div>
            {isSecurity && (
              <button
                onClick={() => setModalMode('REPORT_VIOLATION')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Camera size={14} /> Report Violation
              </button>
            )}
          </div>

          <div className="space-y-3">
            {violations.map((v) => (
              <div key={v.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-rose-100 text-rose-800">
                      {v.violationType}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Vehicle: {v.vehicleNumber}</h4>
                    <span className="text-xs text-slate-500">(Slot {v.slotCode})</span>
                  </div>

                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                    {v.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{v.privateNotes}</p>
                <div className="text-[11px] text-slate-400">
                  Reported by: {v.reportedBy} • Owner Flat: {v.flatCode || 'Unregistered'} ({v.residentName || 'Visitor'})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: SECURITY SCANNER */}
      {activeTab === 'SECURITY_SCANNER' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <QrCode size={36} className="mx-auto text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Gate Security Parking Pass QR Scanner</h3>
            <p className="text-xs text-slate-500">Scan QR pass or enter Vehicle Number / Slot Code.</p>
          </div>

          <form onSubmit={handleGateScan} className="space-y-4 pt-2">
            <div>
              <input
                type="text"
                required
                placeholder="Scan QR or Enter Vehicle Number / Slot Code (e.g. B1-P01)"
                value={qrScanInput}
                onChange={(e) => setQrScanInput(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> Validate Gate Parking Pass
            </button>
          </form>

          {scanResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 mt-4 ${
                scanResult.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {scanResult.isValid ? (
                  <CheckCircle2 className="text-emerald-600" size={18} />
                ) : (
                  <AlertTriangle className="text-rose-600" size={18} />
                )}
                <span className={scanResult.isValid ? 'text-emerald-900' : 'text-rose-900'}>
                  {scanResult.isValid ? 'ACCESS GRANTED - VALID PARKING PASS' : 'ACCESS DENIED'}
                </span>
              </div>
              {scanResult.reason && <p className="text-xs text-slate-700">{scanResult.reason}</p>}
              {scanResult.slot && (
                <div className="text-xs text-slate-800 pt-1 font-medium">
                  Allocated Slot: <strong>{scanResult.slot.slotCode}</strong> ({scanResult.slot.level}) • Flat:{' '}
                  {scanResult.slot.assignedFlatCode}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Request Pass */}
      {modalMode === 'REQUEST_PASS' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Request Temporary / Vacation Pass</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRequestPassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Type</label>
                <select
                  value={passRequestForm.parkingType}
                  onChange={(e) => setPassRequestForm({ ...passRequestForm, parkingType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
                >
                  <option value="TEMPORARY">TEMPORARY PARKING</option>
                  <option value="VACATION">VACATION PARKING</option>
                  <option value="VISITOR">GUEST / VISITOR PARKING</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  required
                  value={passRequestForm.vehicleNumber}
                  onChange={(e) => setPassRequestForm({ ...passRequestForm, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
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
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
                >
                  Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Generated Pass */}
      {modalMode === 'VIEW_PASS' && activeQRPass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <h3 className="font-bold text-slate-900 text-lg">Digital QR Parking Pass</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  activeQRPass.passCode
                )}`}
                alt="QR Pass"
                className="mx-auto"
              />
            </div>
            <div className="text-xs space-y-1 text-slate-700 font-medium">
              <div className="font-mono font-bold text-indigo-600 text-sm">{activeQRPass.passCode}</div>
              <div>Vehicle: {activeQRPass.vehicleNumber}</div>
              <div>Valid Until: {activeQRPass.validUntil}</div>
            </div>
            <button
              onClick={() => setModalMode(null)}
              className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Done & Save
            </button>
          </div>
        </div>
      )}

      {/* Modal: Assign Slot */}
      {modalMode === 'ASSIGN' && selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Assign Slot {selectedSlot.slotCode}</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  required
                  placeholder="MH-12-AB-1234"
                  value={assignForm.vehicleNumber}
                  onChange={(e) => setAssignForm({ ...assignForm, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Code</label>
                  <input
                    type="text"
                    required
                    value={assignForm.flatCode}
                    onChange={(e) => setAssignForm({ ...assignForm, flatCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resident Name</label>
                  <input
                    type="text"
                    required
                    value={assignForm.residentName}
                    onChange={(e) => setAssignForm({ ...assignForm, residentName: e.target.value })}
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
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Violation */}
      {modalMode === 'REPORT_VIOLATION' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Report Parking Violation</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleReportViolationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    placeholder="MH-12-AB-9999"
                    value={violationForm.vehicleNumber}
                    onChange={(e) => setViolationForm({ ...violationForm, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Code</label>
                  <input
                    type="text"
                    required
                    placeholder="B1-P01"
                    value={violationForm.slotCode}
                    onChange={(e) => setViolationForm({ ...violationForm, slotCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Violation Type</label>
                <select
                  value={violationForm.violationType}
                  onChange={(e) => setViolationForm({ ...violationForm, violationType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-semibold"
                >
                  <option value="UNAUTHORIZED_PARKING">UNAUTHORIZED PARKING</option>
                  <option value="WRONG_SLOT">PARKED IN WRONG SLOT</option>
                  <option value="OVERSTAY">EXCEEDED VISITOR TIME LIMIT</option>
                  <option value="BLOCKING_DRIVEWAY">BLOCKING DRIVEWAY / RAMP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Evidence Photo Link (URL)</label>
                <input
                  type="text"
                  placeholder="https://example.com/evidence/photo.jpg"
                  value={violationForm.photoEvidenceUrl}
                  onChange={(e) => setViolationForm({ ...violationForm, photoEvidenceUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Private Notes</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe location details..."
                  value={violationForm.privateNotes}
                  onChange={(e) => setViolationForm({ ...violationForm, privateNotes: e.target.value })}
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
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-rose-500"
                >
                  Report & Dispatch Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
