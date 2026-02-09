import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Protocol {
  id: string;
  sponsorProtocolIdentifier: string;
  fullTitle: string;
  shortTitle?: string;
  protocolVersion: string;
  protocolDate: string;
  protocolStatus?: string;
  trialPhase?: string;
  indication?: string;
  studyType?: string;
  completenessPercentage?: number;
  sections?: Section[];
  objectives?: Objective[];
  eligibilityCriteria?: EligibilityCriterion[];
  interventions?: Intervention[];
}

interface Section {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  sectionType: string;
  content: any;
  isComplete: boolean;
  isRequired: boolean;
}

interface Objective {
  id: string;
  objectiveType: string;
  objectiveText: string;
  estimand?: any;
}

interface EligibilityCriterion {
  id: string;
  criterionType: string;
  criterionNumber: string;
  criterionText: string;
}

interface Intervention {
  id: string;
  interventionType: string;
  productName: string;
  dose?: string;
  doseUnit?: string;
  dosageForm?: string;
  routeOfAdministration?: string;
  frequency?: string;
  duration?: string;
  rationale?: string;
}

interface ProtocolContextType {
  protocol: Protocol | null;
  loading: boolean;
  error: string | null;
  loadProtocol: (id: string) => Promise<void>;
  updateProtocol: (updates: Partial<Protocol>) => Promise<void>;
  saveSection: (sectionId: string, content: any) => Promise<void>;
  refreshProtocol: () => Promise<void>;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) {
    throw new Error('useProtocol must be used within ProtocolProvider');
  }
  return context;
};

interface ProtocolProviderProps {
  children: ReactNode;
  protocolId?: string;
}

export const ProtocolProvider: React.FC<ProtocolProviderProps> = ({ children, protocolId }) => {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProtocol = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load protocol');
      }
      const data = await response.json();
      setProtocol(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load protocol:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProtocol = async (updates: Partial<Protocol>) => {
    if (!protocol) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${protocol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update protocol');
      }

      const data = await response.json();
      setProtocol(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to update protocol:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (sectionId: string, content: any) => {
    if (!protocol) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/protocols/sections/${sectionId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save section');
      }

      // Refresh protocol to get updated section
      await refreshProtocol();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to save section:', err);
    }
  };

  const refreshProtocol = async () => {
    if (protocol) {
      await loadProtocol(protocol.id);
    }
  };

  useEffect(() => {
    if (protocolId) {
      loadProtocol(protocolId);
    }
  }, [protocolId]);

  return (
    <ProtocolContext.Provider
      value={{
        protocol,
        loading,
        error,
        loadProtocol,
        updateProtocol,
        saveSection,
        refreshProtocol
      }}
    >
      {children}
    </ProtocolContext.Provider>
  );
};
