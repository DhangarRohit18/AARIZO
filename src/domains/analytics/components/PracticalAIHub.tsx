import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Truck,
  AlertTriangle,
  Mic,
  FileSearch,
  Activity,
  Lock,
} from 'lucide-react';
import { practicalAILayerEngine } from '../services/practicalAILayerEngine';
import type {
  AIComplaintClassification,
  AIMoveConciergePlan,
  AIPredictiveMaintenanceAlert,
  AIVernacularVoiceParsing,
} from '../types/aiTypes';

export const PracticalAIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CONCIERGE' | 'CLASSIFIER' | 'PREDICTIVE' | 'VOICE' | 'HEALTH_EXPLAIN'>('CONCIERGE');

  // Concierge State
  const [movePrompt, setMovePrompt] = useState('What do I need to move into Tower B flat 402 this Saturday?');
  const [movePlan, setMovePlan] = useState<AIMoveConciergePlan | null>(null);

  // Classifier State
  const [complaintTitle, setComplaintTitle] = useState('Elevator making screeching noise and stuck between 3rd floor');
  const [complaintDesc, setComplaintDesc] = useState('Passenger lift #2 in Tower A stalled for 5 minutes.');
  const [classification, setClassification] = useState<AIComplaintClassification | null>(null);

  // Voice State
  const [voiceText, setVoiceText] = useState('Gate 1 security patrol clear, round complete, all lights working.');
  const [voiceParsed, setVoiceParsed] = useState<AIVernacularVoiceParsing | null>(null);

  // Predictive Alerts
  const predictiveAlerts: AIPredictiveMaintenanceAlert[] = practicalAILayerEngine.getPredictiveMaintenanceAlerts();

  const handleRunConcierge = (e: React.FormEvent) => {
    e.preventDefault();
    setMovePlan(practicalAILayerEngine.generateMovePlan(movePrompt));
  };

  const handleRunClassifier = (e: React.FormEvent) => {
    e.preventDefault();
    setClassification(practicalAILayerEngine.classifyComplaint(complaintTitle, complaintDesc));
  };

  const handleRunVoice = (e: React.FormEvent) => {
    e.preventDefault();
    setVoiceParsed(practicalAILayerEngine.parseVernacularVoice(voiceText));
  };

  const healthSummary = practicalAILayerEngine.getPlainLanguageHealthSummary(94, 91);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {/* Header & Safety Guard Warning */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">AARIZO Practical AI Intelligence Suite</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            6 Focused AI Use Cases: Complaint Classification, Move Concierge, Spam Detection, Predictive Maintenance, Vernacular Voice, and Plain-Language Health Summaries.
          </p>
        </div>

        {/* AI Safety Boundary Guard Badge */}
        <div className="px-3.5 py-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold flex items-center gap-2 shrink-0">
          <Lock size={16} /> Strict Human Approval Guard Active
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { key: 'CONCIERGE', label: 'AI Move Concierge', icon: Truck },
          { key: 'CLASSIFIER', label: 'Complaint Classifier & Spam', icon: FileSearch },
          { key: 'PREDICTIVE', label: 'Predictive Maintenance', icon: AlertTriangle },
          { key: 'VOICE', label: 'Vernacular Staff Voice', icon: Mic },
          { key: 'HEALTH_EXPLAIN', label: 'Plain Health Summary', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
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

      {/* TAB 1: AI MOVE CONCIERGE */}
      {activeTab === 'CONCIERGE' && (
        <div className="space-y-4">
          <form onSubmit={handleRunConcierge} className="flex gap-2">
            <input
              type="text"
              value={movePrompt}
              onChange={(e) => setMovePrompt(e.target.value)}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              placeholder="Ask AI Concierge about move requirements..."
            />
            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Bot size={16} /> Ask AI Concierge
            </button>
          </form>

          {movePlan && (
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                <h3 className="font-bold text-indigo-950 text-sm">Generated Move-In Execution Plan</h3>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full text-[10px]">
                  AI Recommendation Only
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Lift Slot & Schedule:</span>
                  <p className="text-slate-600">{movePlan.liftSlotRequirements.suggestedTimeSlot}</p>
                  <span className="text-[11px] text-indigo-600 mt-1 block">{movePlan.liftSlotRequirements.paddingRequired}</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Cargo Vehicle Limits:</span>
                  <p className="text-slate-600">{movePlan.vehicleDetails.recommendedVehicleType}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">{movePlan.vehicleDetails.maxWeightCapacity}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Gatepass & NOC Requirements:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {movePlan.gatepassChecklist.concat(movePlan.nocRequirements).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-amber-700 italic bg-amber-50 p-2 rounded.xl border border-amber-200 font-medium">
                ⚠️ {movePlan.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLAINT CLASSIFIER */}
      {activeTab === 'CLASSIFIER' && (
        <div className="space-y-4">
          <form onSubmit={handleRunClassifier} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Complaint Title</label>
              <input
                type="text"
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Analyze & Classify Complaint
            </button>
          </form>

          {classification && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Category: {classification.category}</span>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded-full text-[10px]">
                  Priority: {classification.priority}
                </span>
              </div>
              <p className="text-slate-600">Routing Suggestion: {classification.suggestedVendorOrStaff}</p>
              <p className="text-slate-500 italic font-medium">{classification.rationale}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PREDICTIVE MAINTENANCE */}
      {activeTab === 'PREDICTIVE' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Asset Failure Predictor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictiveAlerts.map((alert) => (
              <div key={alert.assetId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900">{alert.assetName}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      alert.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Risk: {alert.failureRiskPercentage}%
                  </span>
                </div>
                <p className="text-slate-600">{alert.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERNACULAR VOICE */}
      {activeTab === 'VOICE' && (
        <div className="space-y-4">
          <form onSubmit={handleRunVoice} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">Spoken Staff Transcript (Hindi/Marathi/English)</label>
            <input
              type="text"
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-sm">
              Convert Speech to Structured Data
            </button>
          </form>

          {voiceParsed && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">Category: {voiceParsed.structuredCategory}</span>
                <span className="text-indigo-600 font-bold">{voiceParsed.spokenLanguage}</span>
              </div>
              <p className="text-slate-600">Location: {voiceParsed.extractedDetails.location}</p>
              <p className="text-slate-600">Status: {voiceParsed.extractedDetails.status}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PLAIN HEALTH SUMMARY */}
      {activeTab === 'HEALTH_EXPLAIN' && (
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Society Health Plain-Language Summary</h3>
          <p className="text-slate-700 text-sm">{healthSummary.scoreChangeExplanation}</p>

          <div>
            <span className="font-bold text-slate-900 block mb-1">Key Positive Drivers:</span>
            <ul className="list-disc pl-4 text-slate-600 space-y-1">
              {healthSummary.keyDrivers.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
