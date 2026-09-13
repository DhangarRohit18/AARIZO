export type RenovationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'HALTED';

export interface ContractorWorker {
  id: string;
  workerName: string;
  idProofType: 'AADAAR' | 'PAN' | 'VOTER' | 'DRIVING_LICENSE';
  idNumber: string;
  phone: string;
  isVerifiedBySecurity: boolean;
  qrCode: string;
}

export interface RenovationPermit {
  id: string;
  projectTitle: string;
  flatId: string;
  flatNumber: string;
  residentId: string;
  residentName: string;
  contractorCompany: string;
  contractorPhone: string;
  startDate: string;
  endDate: string;

  allowedHoursStart: string; // e.g. "09:00"
  allowedHoursEnd: string;   // e.g. "18:00"
  noiseRestrictions: string; // e.g. "No heavy drilling between 1 PM and 3 PM"
  weekendRulesAllowed: boolean;

  workers: ContractorWorker[];
  materialsList: string[];
  vehicleDetails?: string;

  status: RenovationStatus;
  gatepassCode: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}
