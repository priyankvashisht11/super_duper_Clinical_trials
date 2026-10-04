const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api';

export interface Protocol {
  id: string;
  sponsorProtocolIdentifier: string;
  fullTitle: string;
  shortTitle?: string;
  protocolVersion: string;
  protocolDate: string;
  trialPhase?: string;
  indication?: string;
  studyType: string;
  protocolStatus: string;
  completenessPercentage: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sections?: ProtocolSection[];
  objectives?: Objective[];
  eligibilityCriteria?: EligibilityCriterion[];
  interventions?: Intervention[];
}

export interface ProtocolSection {
  id: string;
  protocolId: string;
  sectionNumber: string;
  sectionTitle: string;
  sectionType: string;
  content: any;
  isRequired: boolean;
  isComplete: boolean;
  orderIndex: number;
}

export interface Objective {
  id: string;
  protocolId: string;
  objectiveType: 'primary' | 'secondary' | 'exploratory';
  orderIndex: number;
  objectiveText: string;
  estimand?: any;
  rationale?: string;
}

export interface EligibilityCriterion {
  id: string;
  protocolId: string;
  criterionType: 'inclusion' | 'exclusion';
  criterionNumber: string;
  criterionText: string;
  orderIndex: number;
  isCritical: boolean;
}

export interface Intervention {
  id: string;
  protocolId: string;
  interventionType: 'investigational_product' | 'comparator' | 'placebo' | 'other';
  productName: string;
  dosageForm?: string;
  routeOfAdministration?: string;
  dose?: string;
  doseUnit?: string;
  frequency?: string;
  duration?: string;
  rationale?: string;
}

export interface CreateProtocolInput {
  sponsorProtocolIdentifier: string;
  fullTitle: string;
  shortTitle?: string;
  protocolVersion?: string;
  protocolDate: string;
  trialPhase?: string;
  indication?: string;
  studyType?: string;
  createdBy: string;
}

class ProtocolService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data;
  }

  // Protocol CRUD
  async createProtocol(input: CreateProtocolInput): Promise<Protocol> {
    return this.request<Protocol>('/protocols', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getAllProtocols(): Promise<Protocol[]> {
    return this.request<Protocol[]>('/protocols');
  }

  async getProtocolById(id: string): Promise<Protocol> {
    return this.request<Protocol>(`/protocols/${id}`);
  }

  async updateProtocol(id: string, updates: Partial<CreateProtocolInput>): Promise<Protocol> {
    return this.request<Protocol>(`/protocols/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProtocol(id: string): Promise<void> {
    await this.request<void>(`/protocols/${id}`, {
      method: 'DELETE',
    });
  }

  // Objectives
  async addObjective(data: {
    protocolId: string;
    objectiveType: 'primary' | 'secondary' | 'exploratory';
    objectiveText: string;
    orderIndex?: number;
    estimand?: any;
    rationale?: string;
  }): Promise<Objective> {
    return this.request<Objective>('/protocols/objectives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
    return this.request<Objective>(`/protocols/objectives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Eligibility Criteria
  async addCriterion(data: {
    protocolId: string;
    criterionType: 'inclusion' | 'exclusion';
    criterionText: string;
    isCritical?: boolean;
    orderIndex?: number;
  }): Promise<EligibilityCriterion> {
    return this.request<EligibilityCriterion>('/protocols/criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCriterion(id: string, updates: Partial<EligibilityCriterion>): Promise<EligibilityCriterion> {
    return this.request<EligibilityCriterion>(`/protocols/criteria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCriterion(id: string): Promise<void> {
    await this.request<void>(`/protocols/criteria/${id}`, {
      method: 'DELETE',
    });
  }

  // Interventions
  async addIntervention(data: {
    protocolId: string;
    interventionType: 'investigational_product' | 'comparator' | 'placebo' | 'other';
    productName: string;
    dosageForm?: string;
    routeOfAdministration?: string;
    dose?: string;
    doseUnit?: string;
    frequency?: string;
    duration?: string;
    rationale?: string;
  }): Promise<Intervention> {
    return this.request<Intervention>('/protocols/interventions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIntervention(id: string, updates: Partial<Intervention>): Promise<Intervention> {
    return this.request<Intervention>(`/protocols/interventions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Sections
  async updateSection(id: string, content: any, isComplete?: boolean): Promise<ProtocolSection> {
    return this.request<ProtocolSection>(`/protocols/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content, isComplete }),
    });
  }
}

export const protocolService = new ProtocolService();
