// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Package, QrCode, Search, ShieldCheck, Clock, AlertTriangle, Plus, Filter } from 'lucide-react';
import { parcelRoomService } from '../../../domains/deliveries/services/parcelRoomService';
import type { Parcel } from '../../../domains/deliveries/types';
import { realtimeService } from '../../../services/realtimeService';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

export const ParcelRoomSecurityHub: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // New parcel form state
  const [residentName, setResidentName] = useState('Vikram Joshi');
  const [flatCode, setFlatCode] = useState('Tower B · B-1204');
  const [courierCompany, setCourierCompany] = useState('Amazon');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [storageLocation, setStorageLocation] = useState('Rack A-1');
  const [notes, setNotes] = useState('');

  // Verify form state
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [verifyOtpInput, setVerifyOtpInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ success?: boolean; message?: string }>({});

  const loadParcels = () => {
    const list = parcelRoomService.getAllParcels('soc-gvs');
    setParcels(list);
  };

  useEffect(() => {
    loadParcels();

    // Real-time listener: Update view dynamically when delivery status changes
    const unsubscribe = realtimeService.subscribe('DELIVERY_STATUS', () => {
      loadParcels();
    });

    return () => unsubscribe();
  }, []);

  const handleRegisterParcel = (e: React.FormEvent) => {
    e.preventDefault();
    parcelRoomService.registerIncomingParcel({
      societyId: 'soc-gvs',
      residentId: 'res-1',
      residentName,
      flatCode,
      courierCompany,
      trackingNumber: trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      storageLocation,
      notes,
    });
    setShowAddModal(false);
    setTrackingNumber('');
    setNotes('');
    loadParcels();
  };

  const handleVerifyPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;
    const res = parcelRoomService.verifyAndCollectParcel(selectedParcel.id, verifyOtpInput);
    setVerifyResult(res);
    if (res.success) {
      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifyOtpInput('');
        setVerifyResult({});
        loadParcels();
      }, 1200);
    }
  };

  const filtered = parcels.filter((p) => {
    const matchesSearch =
      p.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.flatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.courierCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'FLAGGED_24H') return matchesSearch && p.isFlagged24h;
    if (filterStatus === 'FLAGGED_48H') return matchesSearch && p.isFlagged48h;
    return matchesSearch && p.status === filterStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Parcel & Delivery Room Hub</h1>
          <p className="text-sm text-slate-500">Register incoming courier parcels, assign storage, and verify resident OTP/QR pickups</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Register Incoming Parcel
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Ready For Pickup</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {parcels.filter((p) => p.status === 'READY_FOR_PICKUP' || p.status === 'STORED').length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Uncollected (&gt;24 Hours)</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {parcels.filter((p) => p.isFlagged24h).length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Overdue (&gt;48 Hours)</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {parcels.filter((p) => p.isFlagged48h).length}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Collected Today</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {parcels.filter((p) => p.status === 'COLLECTED').length}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Resident Name, Flat Code, Courier, or Tracking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs border-slate-200 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY_FOR_PICKUP">Ready For Pickup</option>
            <option value="STORED">Stored</option>
            <option value="FLAGGED_24H">Uncollected (&gt;24h)</option>
            <option value="FLAGGED_48H">Overdue (&gt;48h)</option>
            <option value="COLLECTED">Collected</option>
          </select>
        </div>
      </div>

      {/* Parcels List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <DataTable
          columns={[
            {
              key: 'courier',
              header: 'Parcel ID & Courier',
              render: (p: any) => (
                <div>
                  <div className="font-bold text-slate-800">{p.courierCompany}</div>
                  <div className="text-[10px] text-slate-400">Track: {p.trackingNumber}</div>
                </div>
              )
            },
            {
              key: 'resident',
              header: 'Resident & Flat',
              render: (p: any) => (
                <div>
                  <div className="font-semibold text-slate-800">{p.residentName}</div>
                  <div className="text-[10px] text-slate-500">{p.flatCode}</div>
                </div>
              )
            },
            {
              key: 'location',
              header: 'Storage Location',
              render: (p: any) => (
                <span className="px-2 py-1 bg-slate-100 font-bold text-slate-700 rounded text-[11px]">
                  {p.storageLocation}
                </span>
              )
            },
            {
              key: 'arrival',
              header: 'Arrival Time & Age',
              render: (p: any) => (
                <div>
                  <div>{new Date(p.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-[10px] text-slate-400">{p.ageHours} hrs ago</div>
                </div>
              )
            },
            {
              key: 'status',
              header: 'Status',
              render: (p: any) => (
                <div className="flex flex-col gap-1 items-start">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'COLLECTED' ? 'bg-blue-100 text-blue-800' :
                    p.status === 'READY_FOR_PICKUP' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {p.status}
                  </span>
                  {p.isFlagged48h && (
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[9px] rounded flex items-center gap-0.5">
                      <AlertTriangle size={10} /> 48h Overdue
                    </span>
                  )}
                  {p.isFlagged24h && !p.isFlagged48h && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-[9px] rounded flex items-center gap-0.5">
                      <Clock size={10} /> 24h Aging
                    </span>
                  )}
                </div>
              )
            },
            {
              key: 'actions',
              header: 'OTP / Action',
              render: (p: any) => (
                p.status !== 'COLLECTED' ? (
                  <button
                    onClick={() => {
                      setSelectedParcel(p);
                      setShowVerifyModal(true);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[11px] flex items-center gap-1"
                  >
                    <QrCode size={12} /> Verify OTP
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <ShieldCheck size={14} /> Collected by {p.collectedBy}
                  </span>
                )
              )
            }
          ]}
          data={filtered}
          keyExtractor={(p: any) => p.id}
          pageSize={10}
          mobileRender={(p: any) => (
            <MobileDataCard
              title={`${p.courierCompany} • ${p.flatCode}`}
              subtitle={`Track: ${p.trackingNumber} • Resident: ${p.residentName}`}
              status={
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'COLLECTED' ? 'bg-blue-100 text-blue-800' :
                    p.status === 'READY_FOR_PICKUP' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {p.status}
                  </span>
                  {p.isFlagged48h && (
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[9px] rounded flex items-center gap-0.5">
                      <AlertTriangle size={10} /> 48h Overdue
                    </span>
                  )}
                </div>
              }
              attributes={[
                { label: 'Storage Rack', value: p.storageLocation },
                { label: 'Arrived', value: `${new Date(p.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${p.ageHours}h ago)` },
                { label: 'Collection Note', value: p.status === 'COLLECTED' ? `Collected by ${p.collectedBy}` : 'Awaiting OTP verification' }
              ]}
              actions={
                p.status !== 'COLLECTED' ? (
                  <button
                    onClick={() => {
                      setSelectedParcel(p);
                      setShowVerifyModal(true);
                    }}
                    className="w-full py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={14} /> Verify OTP & Release Package
                  </button>
                ) : undefined
              }
            />
          )}
        />
      </div>

      {/* Add Parcel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Register Incoming Parcel</h3>
            <form onSubmit={handleRegisterParcel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Resident Name</label>
                <input
                  type="text"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Flat Code</label>
                <input
                  type="text"
                  value={flatCode}
                  onChange={(e) => setFlatCode(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Courier Partner</label>
                  <select
                    value={courierCompany}
                    onChange={(e) => setCourierCompany(e.target.value)}
                    className="w-full p-2 border rounded-lg border-slate-300"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Blinkit">Blinkit</option>
                    <option value="Zepto">Zepto</option>
                    <option value="Swiggy Instamart">Swiggy Instamart</option>
                    <option value="DHL">DHL</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Storage Location</label>
                  <select
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full p-2 border rounded-lg border-slate-300"
                  >
                    <option value="Rack A-1">Rack A-1</option>
                    <option value="Rack A-2">Rack A-2</option>
                    <option value="Rack B-1">Rack B-1</option>
                    <option value="Locker 101">Locker 101</option>
                    <option value="Locker 102">Locker 102</option>
                    <option value="Reception Desk">Reception Desk</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Tracking Number / AWB</label>
                <input
                  type="text"
                  placeholder="Optional AWB tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  Save & Generate OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedParcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Verify Pickup OTP</h3>
            <p className="text-xs text-slate-500">
              Parcel #{selectedParcel.id} for <strong>{selectedParcel.residentName} ({selectedParcel.flatCode})</strong>
            </p>
            <form onSubmit={handleVerifyPickup} className="space-y-3">
              <input
                type="text"
                placeholder="Enter 6-digit OTP or scan QR"
                value={verifyOtpInput}
                onChange={(e) => setVerifyOtpInput(e.target.value)}
                className="w-full p-3 text-center tracking-widest text-lg font-bold border-2 rounded-xl border-indigo-400 focus:outline-none"
                required
              />
              {verifyResult.message && (
                <div className={`p-2 rounded text-xs text-center font-bold ${verifyResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {verifyResult.message}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerifyOtpInput('');
                    setVerifyResult({});
                  }}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700"
                >
                  Confirm Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

