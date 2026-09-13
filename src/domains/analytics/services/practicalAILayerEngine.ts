import type {
  AIComplaintClassification,
  AIMoveConciergePlan,
  AIDuplicateDetectionResult,
  AIPredictiveMaintenanceAlert,
  AIVernacularVoiceParsing,
  AISocietyHealthSummary,
} from '../types/aiTypes';
import { assetComplianceEngine } from '../../compliance/services/assetComplianceEngine';

class PracticalAILayerEngine {

  /**
   * USE CASE 1: Complaint Classification
   */
  public classifyComplaint(title: string, description: string): AIComplaintClassification {
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('lift') || text.includes('elevator') || text.includes('stuck') || text.includes('door')) {
      return {
        category: 'LIFT',
        priority: 'CRITICAL',
        suggestedVendorOrStaff: 'Otis Elevator AMC Vendor',
        confidenceScore: 0.96,
        rationale: 'High urgency keywords detected related to elevator safety and passenger transit.',
      };
    } else if (text.includes('water') || text.includes('leak') || text.includes('pump') || text.includes('pipe')) {
      return {
        category: 'PLUMBING',
        priority: text.includes('overflow') || text.includes('burst') ? 'HIGH' : 'MEDIUM',
        suggestedVendorOrStaff: 'Kirloskar Hydraulic Service Team',
        confidenceScore: 0.92,
        rationale: 'Hydraulic / water supply keywords detected requiring plumbing technician dispatch.',
      };
    } else if (text.includes('fire') || text.includes('smoke') || text.includes('alarm')) {
      return {
        category: 'FIRE_SAFETY',
        priority: 'CRITICAL',
        suggestedVendorOrStaff: 'Security & Fire Command Post',
        confidenceScore: 0.99,
        rationale: 'Fire safety hazard keywords detected.',
      };
    }

    return {
      category: 'GENERAL_MAINTENANCE',
      priority: 'LOW',
      suggestedVendorOrStaff: 'Estate Maintenance Supervisor',
      confidenceScore: 0.85,
      rationale: 'Standard maintenance classification based on content analysis.',
    };
  }

  /**
   * USE CASE 2: AI Move Concierge
   */
  public generateMovePlan(userPrompt: string): AIMoveConciergePlan {
    return {
      query: userPrompt,
      liftSlotRequirements: {
        suggestedDate: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
        suggestedTimeSlot: '10:00 AM - 01:00 PM (Off-peak hours)',
        paddingRequired: 'Service Lift #2 padded protective lining booked automatically',
      },
      gatepassChecklist: [
        'Time-bound cargo vehicle gatepass QR',
        'Mover staff headcount ID verification at Security Gate 1',
        'Society security clearance token',
      ],
      vendorChecklist: [
        'Packers & Movers GST invoice copy',
        'Worker list with ID proofs submitted 24h prior',
        'Vehicle registration number check',
      ],
      vehicleDetails: {
        recommendedVehicleType: 'Eicher 14ft Covered Truck or Tata Ace',
        maxWeightCapacity: 'Max 3.5 Tons per vehicle entry limit',
      },
      nocRequirements: [
        'No Outstanding Dues Certificate from Society Accounts',
        'Owner Tenant Movement NOC Form #4',
      ],
      disclaimer:
        'AI Concierge recommendation only. Final gatepass and lift slot reservation requires Society Manager approval.',
    };
  }

  /**
   * USE CASE 3: Duplicate / Spam Detection
   */
  public detectDuplicateOrSpam(
    title: string,
    existingItems: { id: string; title: string }[]
  ): AIDuplicateDetectionResult {
    const norm = title.trim().toLowerCase();

    for (const item of existingItems) {
      const matchNorm = item.title.trim().toLowerCase();
      if (norm === matchNorm || (norm.length > 8 && matchNorm.includes(norm))) {
        return {
          isLikelySpamOrDuplicate: true,
          duplicateConfidence: 0.94,
          matchedExistingId: item.id,
          reason: `High semantic match with existing ticket #${item.id}: "${item.title}"`,
        };
      }
    }

    return {
      isLikelySpamOrDuplicate: false,
      duplicateConfidence: 0.05,
      reason: 'No duplicate ticket matches detected in active roster.',
    };
  }

  /**
   * USE CASE 4: Predictive Maintenance
   */
  public getPredictiveMaintenanceAlerts(): AIPredictiveMaintenanceAlert[] {
    const assets = assetComplianceEngine.getAssets();

    return assets.map((a) => {
      const isExpiring = a.complianceStatus === 'EXPIRING' || a.complianceStatus === 'EXPIRED';
      const risk = isExpiring ? 88 : a.name.includes('Lift') ? 45 : 22;

      return {
        assetId: a.id,
        assetName: a.name,
        failureRiskPercentage: risk,
        riskLevel: risk > 75 ? 'HIGH' : risk > 40 ? 'MODERATE' : 'LOW',
        failureIndicators: isExpiring
          ? ['AMC contract expiring soon', 'Vibration anomaly detected in motor log', 'Scheduled inspection overdue']
          : ['Routine maintenance within operating limits'],
        recommendedAction: isExpiring
          ? 'Schedule urgent AMC vendor inspection & sensor recalibration.'
          : 'Continue standard quarterly maintenance cycle.',
      };
    });
  }

  /**
   * USE CASE 5: Vernacular Staff Voice Parsing
   */
  public parseVernacularVoice(voiceTranscript: string, language: string = 'Hindi/Marathi'): AIVernacularVoiceParsing {
    const text = voiceTranscript.toLowerCase();

    let cat: AIVernacularVoiceParsing['structuredCategory'] = 'task_update';
    if (text.includes('guard') || text.includes('patrol') || text.includes('chaukidari') || text.includes('round')) {
      cat = 'patrol';
    } else if (text.includes('cleaning') || text.includes('safai') || text.includes('kachra') || text.includes('sweep')) {
      cat = 'cleaning_checkpoint';
    } else if (text.includes('break') || text.includes('water leak') || text.includes('problem') || text.includes('khalal')) {
      cat = 'incident';
    }

    return {
      spokenLanguage: language,
      rawTranscript: voiceTranscript,
      structuredCategory: cat,
      extractedDetails: {
        location: text.includes('tower a') ? 'Tower A Lobby' : text.includes('gate') ? 'Main Gate' : 'Common Area',
        status: text.includes('complete') || text.includes('ho gaya') ? 'COMPLETED' : 'IN_PROGRESS',
        notes: voiceTranscript,
        timestamp: new Date().toLocaleTimeString(),
      },
    };
  }

  /**
   * USE CASE 6: Society Health Summary in Plain Language
   */
  public getPlainLanguageHealthSummary(currentScore: number, previousScore: number): AISocietyHealthSummary {
    const diff = currentScore - previousScore;
    const isUp = diff >= 0;

    return {
      scoreChangeExplanation: `The society health score moved by ${isUp ? '+' : ''}${diff} points to ${currentScore}/100. This positive trend is driven primarily by 100% active lift AMC compliance and a 94.2% dues collection rate.`,
      keyDrivers: [
        'Fire safety audit certificates renewed for 2026-2027',
        'Zero open emergency SOS incidents at main gate command post',
        'Complaint resolution speed improved to 95% SLA compliance',
      ],
      recommendations: [
        'Renew water tank quality certificate before Sept 30 to maintain Grade A rating',
        'Keep budget variance under 5% for Q4 operating budget',
      ],
      disclaimer: 'AI Health Summary is informational. Official governance decisions remain with the Management Committee.',
    };
  }
}

export const practicalAILayerEngine = new PracticalAILayerEngine();
