import { api } from './api';

export interface Policy {
  id: number;
  policy_code: string;
  policy_name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  rule_count?: number;
  rules?: PolicyRule[];
  created_at?: string;
  updated_at?: string;
}

export interface PolicyRule {
  id: number;
  policy_id: number;
  rule_code: string;
  rule_name: string;
  description?: string;
  conditions?: any;
  calculation_formula?: string;
  is_active: boolean;
  effective_date?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const libraryService = {
  // Policies
  getAllPolicies: async (): Promise<Policy[]> => {
    const response = await api.get('/library/policies');
    return response.data;
  },

  getPolicyById: async (id: number): Promise<Policy> => {
    const response = await api.get(`/library/policies/${id}`);
    return response.data;
  },

  createPolicy: async (data: Partial<Policy>): Promise<Policy> => {
    const response = await api.post('/library/policies', data);
    return response.data;
  },

  updatePolicy: async (id: number, data: Partial<Policy>): Promise<Policy> => {
    const response = await api.put(`/library/policies/${id}`, data);
    return response.data;
  },

  deletePolicy: async (id: number): Promise<void> => {
    await api.delete(`/library/policies/${id}`);
  },

  // Policy Rules
  getRulesByPolicy: async (policyId: number): Promise<PolicyRule[]> => {
    const response = await api.get(`/library/policies/${policyId}/rules`);
    return response.data;
  },

  createRule: async (policyId: number, data: Partial<PolicyRule>): Promise<PolicyRule> => {
    const response = await api.post(`/library/policies/${policyId}/rules`, data);
    return response.data;
  },

  updateRule: async (ruleId: number, data: Partial<PolicyRule>): Promise<PolicyRule> => {
    const response = await api.put(`/library/rules/${ruleId}`, data);
    return response.data;
  },

  deleteRule: async (ruleId: number): Promise<void> => {
    await api.delete(`/library/rules/${ruleId}`);
  },

  // Get all active policies with their rules (for policy tagging dropdown)
  getActivePoliciesWithRules: async (): Promise<Policy[]> => {
    const response = await api.get('/library/policies/active-with-rules');
    return response.data;
  },
};
