import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { childSafetyService } from '../../../services/childSafetyService';
import type { ChildProfile, ChildPickupQR, PickupLog } from '../../../types/childSafety';
import { Modal } from '../../../components/ui/Modal';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  QrCode,
  AlertTriangle,
  Users,
  Clock,
  PhoneCall,
  XCircle,
  Plus
} from 'lucide-react';

export const ResidentChildSafetyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const residentName = currentUser?.name || 'Resident';
  const flatNumber = (currentUser as any)?.flatDetails || 'A-101';

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [pickupLogs, setPickupLogs] = useState<PickupLog[]>([]);

  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  // Modals state
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddPickupModal, setShowAddPickupModal] = useState(false);
  const [showGenerateQRModal, setShowGenerateQRModal] = useState(false);
  const [showMissingChildModal, setShowMissingChildModal] = useState(false);

  // Active generated QR display
  const [activeGeneratedQR, setActiveGeneratedQR] = useState<ChildPickupQR | null>(null);

  // Forms state
  const [childForm, setChildForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE' as ChildProfile['gender'],
    medicalNotes: '',
    guardianName: residentName,
    guardianRelationship: 'Parent',
    guardianPhone: currentUser?.phone || '+91 98765 43210'
  });

  const [pickupForm, setPickupForm] = useState({
    name: '',
    phone: '',
    relationship: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: ''
  });

  const [qrForm, setQrForm] = useState({
    pickupPersonId: '',
    maxUses: 1,
    validHours: 24
  });

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    const list = childSafetyService.getChildren(societyId).filter(c => c.flatNumber === flatNumber || flatNumber === 'A-101');
    setChildren(list);
    if (list.length > 0 && !selectedChild) {
      setSelectedChild(list[0]);
    }
    setPickupLogs(childSafetyService.getPickupLogs(societyId));
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.fullName || !childForm.dateOfBirth) return;

    const newChild = childSafetyService.createChildProfile(
      societyId,
      flatNumber,
      childForm.fullName,
      childForm.dateOfBirth,
      childForm.gender,
      [
        {
          id: `g-${Date.now()}`,
          name: childForm.guardianName,
          relationship: childForm.guardianRelationship,
          phone: childForm.guardianPhone,
          isPrimary: true
        }
      ],
      [],
      childForm.medicalNotes
    );

    setShowAddChildModal(false);
    setChildForm({
      fullName: '',
      dateOfBirth: '',
      gender: 'MALE',
      medicalNotes: '',
      guardianName: residentName,
      guardianRelationship: 'Parent',
      guardianPhone: currentUser?.phone || '+91 98765 43210'
    });
    loadData();
    setSelectedChild(newChild);
  };

  const handleAddPickupPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !pickupForm.name || !pickupForm.phone) return;

    childSafetyService.addAuthorizedPickupPerson(
      societyId,
      selectedChild.id,
      pickupForm.name,
      pickupForm.phone,
      pickupForm.relationship || 'Authorized Person',
      pickupForm.idProofType,
      pickupForm.idProofNumber
    );

    setShowAddPickupModal(false);
    setPickupForm({ name: '', phone: '', relationship: '', idProofType: 'Aadhaar Card', idProofNumber: '' });
    loadData();
  };

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !qrForm.pickupPersonId) return;

    const validFrom = new Date().toISOString();
    const validUntil = new Date(Date.now() + qrForm.validHours * 60 * 60 * 1000).toISOString();

    const qr = childSafetyService.generatePickupQR(
      societyId,
      selectedChild.id,
      qrForm.pickupPersonId,
      validFrom,
      validUntil,
      qrForm.maxUses
    );

    setActiveGeneratedQR(qr);
    setShowGenerateQRModal(false);
    loadData();
  };

  const handleReportMissing = () => {
    if (!selectedChild) return;
    childSafetyService.triggerMissingChildAlert(societyId, selectedChild.id, `${residentName} (Flat ${flatNumber})`);
    setShowMissingChildModal(false);
    loadData();
  };

  const handleRevokePickup = (pickupPersonId: string) => {
    if (!selectedChild) return;
    childSafetyService.revokeAuthorizedPickupPerson(societyId, selectedChild.id, pickupPersonId);
    loadData();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Child Safety & Gate Pickup Hub</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Register children profiles, authorize pickup caretakers, generate secure QR gate passes, and issue instant missing child alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddChildModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Register Child
          </button>
        </div>
      </div>

      {/* Children Profiles Selector */}
      {children.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {children.map(child => (
            <div
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 shrink-0 min-w-[240px] ${
                selectedChild?.id === child.id ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center font-bold text-indigo-700">
                {child.photoUrl ? (
                  <img src={child.photoUrl} alt={child.fullName} className="w-full h-full object-cover" />
                ) : (
                  child.fullName.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {child.fullName}
                  {child.status === 'MISSING' && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-pulse">MISSING</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Flat {child.flatNumber} • DOB: {child.dateOfBirth}</p>
                <span className={`inline-block text-[11px] font-semibold mt-1 ${
                  child.status === 'SAFE' ? 'text-emerald-600' : child.status === 'OUT_OF_SOCIETY' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  Status: {child.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Child Details & Authorized Pickup Persons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Alert Warning Banner if child is missing */}
            {selectedChild.status === 'MISSING' && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">ALERT: MISSING CHILD BROADCAST ACTIVE</h3>
                  <p className="text-xs text-rose-700 mt-1">
                    All society gate security guards have been alerted. Gate exits are currently locked down for {selectedChild.fullName}.
                  </p>
                </div>
              </div>
            )}

            {/* Child Profile Info Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center font-bold text-xl text-indigo-700">
                  {selectedChild.photoUrl ? (
                    <img src={selectedChild.photoUrl} alt={selectedChild.fullName} className="w-full h-full object-cover" />
                  ) : (
                    selectedChild.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedChild.fullName}</h2>
                  <p className="text-xs text-slate-500">Gender: {selectedChild.gender} • DOB: {selectedChild.dateOfBirth}</p>
                  {selectedChild.medicalNotes && (
                    <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-100">
                      <strong>Medical Notes:</strong> {selectedChild.medicalNotes}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowGenerateQRModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-4 h-4" /> Generate Pickup QR
                </button>
                <button
                  onClick={() => setShowMissingChildModal(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4" /> Report Missing
                </button>
              </div>
            </div>

            {/* Authorized Pickup Persons */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Authorized Pickup Persons</h2>
                  <p className="text-xs text-slate-500">People authorized to pick up {selectedChild.fullName} from society gate.</p>
                </div>
                <button
                  onClick={() => setShowAddPickupModal(true)}
                  className="px-3 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Pickup Person
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedChild.authorizedPickups.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No authorized pickup persons added yet. Click "Add Pickup Person" to authorize a nanny or relative.
                  </div>
                ) : (
                  selectedChild.authorizedPickups.map(person => (
                    <div key={person.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm border">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {person.name}
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              person.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {person.status}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            {person.relationship} • {person.phone} • ID: {person.idProofType} ({person.idProofNumber})
                          </p>
                        </div>
                      </div>
                      {person.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokePickup(person.id)}
                          className="px-2.5 py-1 text-xs border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Guardians & Pickup History Log */}
          <div className="space-y-6">
            {/* Guardians Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Guardians & Emergency Contacts
              </h3>
              <div className="space-y-2">
                {selectedChild.guardians.map(g => (
                  <div key={g.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{g.name} ({g.relationship})</span>
                      {g.isPrimary && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                    <p className="text-slate-500 flex items-center gap-1 mt-1">
                      <PhoneCall className="w-3 h-3 text-indigo-500" /> {g.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup History Log */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Recent Gate Pickups
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {pickupLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No recent pickup events logged</p>
                ) : (
                  pickupLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">{log.pickupPersonName}</strong>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          log.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                      {log.notes && <p className="text-slate-600 mt-0.5 italic">{log.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
          No child profiles registered for Flat {flatNumber}. Click "Register Child" to begin.
        </div>
      )}

      {/* Modal: Active Generated QR Display */}
      {activeGeneratedQR && (
        <Modal isOpen={!!activeGeneratedQR} onClose={() => setActiveGeneratedQR(null)} title="Child Pickup QR Gate Pass">
          <div className="text-center space-y-4 py-2">
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 inline-block">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 shadow-inner mx-auto flex items-center justify-center font-mono font-bold text-center text-indigo-900 text-xs leading-relaxed">
                [ QR CODE IMAGE ]
                <br />
                {activeGeneratedQR.qrCode}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{activeGeneratedQR.childName}</h3>
              <p className="text-xs text-slate-500">Authorized for: <strong>{activeGeneratedQR.pickupPersonName}</strong></p>
              <p className="text-xs text-slate-400 mt-1">Valid Until: {new Date(activeGeneratedQR.validUntil).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setActiveGeneratedQR(null)}
              className="w-full py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl"
            >
              Done / Share Pass
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Add Child */}
      <Modal isOpen={showAddChildModal} onClose={() => setShowAddChildModal(false)} title="Register Child Profile">
        <form onSubmit={handleAddChild} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Child's Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={childForm.fullName}
              onChange={e => setChildForm({ ...childForm, fullName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={childForm.dateOfBirth}
                onChange={e => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={childForm.gender}
                onChange={e => setChildForm({ ...childForm, gender: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medical / Special Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Allergies, blood group, special instructions"
              value={childForm.medicalNotes}
              onChange={e => setChildForm({ ...childForm, medicalNotes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddChildModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Register Child</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Pickup Person */}
      <Modal isOpen={showAddPickupModal} onClose={() => setShowAddPickupModal(false)} title={`Authorize Pickup Person for ${selectedChild?.fullName}`}>
        <form onSubmit={handleAddPickupPerson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sunita Devi"
              value={pickupForm.name}
              onChange={e => setPickupForm({ ...pickupForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={pickupForm.phone}
                onChange={e => setPickupForm({ ...pickupForm, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                placeholder="e.g. Nanny, Cab Driver, Uncle"
                value={pickupForm.relationship}
                onChange={e => setPickupForm({ ...pickupForm, relationship: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Type</label>
              <select
                value={pickupForm.idProofType}
                onChange={e => setPickupForm({ ...pickupForm, idProofType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Number</label>
              <input
                type="text"
                required
                placeholder="e.g. XXXX-XXXX-4589"
                value={pickupForm.idProofNumber}
                onChange={e => setPickupForm({ ...pickupForm, idProofNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddPickupModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Save Authorized Person</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Generate QR */}
      <Modal isOpen={showGenerateQRModal} onClose={() => setShowGenerateQRModal(false)} title={`Generate Pickup QR for ${selectedChild?.fullName}`}>
        <form onSubmit={handleGenerateQR} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Authorized Pickup Person</label>
            <select
              required
              value={qrForm.pickupPersonId}
              onChange={e => setQrForm({ ...qrForm, pickupPersonId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">-- Choose Person --</option>
              {selectedChild?.authorizedPickups.filter(p => p.status === 'ACTIVE').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Exit Uses</label>
              <input
                type="number"
                min={1}
                max={10}
                value={qrForm.maxUses}
                onChange={e => setQrForm({ ...qrForm, maxUses: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Validity (Hours)</label>
              <input
                type="number"
                min={1}
                max={72}
                value={qrForm.validHours}
                onChange={e => setQrForm({ ...qrForm, validHours: parseInt(e.target.value) || 24 })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowGenerateQRModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Generate Secure QR</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Report Missing Child Alert */}
      <Modal isOpen={showMissingChildModal} onClose={() => setShowMissingChildModal(false)} title="🚨 Report Missing Child Alert">
        <div className="space-y-4 py-2">
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>
              This will trigger a society-wide <strong>CRITICAL EMERGENCY BROADCAST</strong> to all Security Gate Guards and lock down exits for <strong>{selectedChild?.fullName}</strong>.
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Are you sure you want to flag <strong>{selectedChild?.fullName}</strong> (Flat {selectedChild?.flatNumber}) as missing?
          </p>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowMissingChildModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button onClick={handleReportMissing} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold rounded-lg">
              BROADCAST MISSING ALERT
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
