// Safety & Emergency Domain Types for CommunityOS

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  availableHours: string;
  iconType: 'security' | 'facility' | 'medical' | 'fire';
}

export interface SafetyInstruction {
  id: string;
  title: string;
  detail: string;
  category: 'gate' | 'fire' | 'lift' | 'assembly';
}

export interface SOSIncident {
  id: string;
  timestamp: string;
  residentName: string;
  flatCode: string;
  tower: string;
  status: 'active' | 'responded' | 'resolved';
  respondedByOfficer?: string;
}
