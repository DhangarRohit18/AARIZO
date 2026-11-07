import { AIGovernancePolicyEngine } from '../server/src/aiGovernance';

describe('SafeGate 2.0 AI Governance & Product Differentiators', () => {
  test('AI Governance: blocks AI agents from autonomously approving payments', () => {
    const result = AIGovernancePolicyEngine.evaluateAction('APPROVE_PAYMENT', 'AI_AGENT');
    expect(result.allowed).toBe(false);
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.reason).toContain('restricted by SafeGate 2.0 AI Governance Policy');
  });

  test('AI Governance: blocks AI agents from autonomously granting gate clearance', () => {
    const result = AIGovernancePolicyEngine.evaluateAction('GRANT_GATE_CLEARANCE', 'AI_AGENT');
    expect(result.allowed).toBe(false);
    expect(result.requiresHumanApproval).toBe(true);
  });

  test('AI Governance: blocks AI agents from changing user roles', () => {
    const result = AIGovernancePolicyEngine.evaluateAction('CHANGE_USER_ROLE', 'AI_AGENT');
    expect(result.allowed).toBe(false);
    expect(result.requiresHumanApproval).toBe(true);
  });

  test('AI Governance: permits authorized human secretary to execute operations', () => {
    const result = AIGovernancePolicyEngine.evaluateAction('CHANGE_USER_ROLE', 'HUMAN_USER', 'secretary');
    expect(result.allowed).toBe(true);
    expect(result.requiresHumanApproval).toBe(false);
  });

  test('AI Governance: wraps suggestions with mandatory human sign-off disclaimer', () => {
    const suggestion = AIGovernancePolicyEngine.wrapAdvisorySuggestion(
      { recommendedGate: 'GATE_1', suggestedGuardId: 'guard_123' },
      'GRANT_GATE_CLEARANCE'
    );
    expect(suggestion.advisory).toBe(true);
    expect(suggestion.requiresHumanConfirmation).toBe(true);
    expect(suggestion.disclaimer).toContain('Requires human sign-off');
  });
});
