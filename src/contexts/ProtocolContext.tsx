import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  createdBy?: string;
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
  orderIndex: number;
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
  saving: boolean;
  lastSaved: Date | null;
  loadProtocol: (id: string) => Promise<void>;
  updateProtocol: (updates: Partial<Protocol>) => Promise<void>;
  saveSection: (sectionId: string, content: any) => Promise<void>;
  autoSaveSection: (sectionNumber: string, content: any) => void;
  refreshProtocol: () => Promise<void>;
  navigateToNextSection: (currentSection: string) => string | null;
  navigateToPrevSection: (currentSection: string) => string | null;
  getSectionProgress: (sectionNumber: string) => number;
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
  const { user } = useAuth();
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Auto-save debounce timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSavesRef = useRef<Map<string, any>>(new Map());

  const loadProtocol = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load protocol');
      }
      const data = await response.json();
      
      // Check if user has access to this protocol
      if (user && data.data.createdBy !== user.email) {
        console.warn('User accessing protocol created by another user');
      }
      
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
      setLastSaved(new Date());
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to update protocol:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (sectionId: string, content: any) => {
    if (!protocol) return;

    setSaving(true);
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

      setLastSaved(new Date());
      // Refresh protocol to get updated section
      await refreshProtocol();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to save section:', err);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save with debouncing (saves 2 seconds after last change)
  const autoSaveSection = useCallback((sectionNumber: string, content: any) => {
    if (!protocol) return;

    // Store pending save
    pendingSavesRef.current.set(sectionNumber, content);

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      const section = protocol.sections?.find(s => s.sectionNumber === sectionNumber);
      if (section) {
        setSaving(true);
        try {
          const response = await fetch(
            `http://localhost:3001/api/protocols/sections/${section.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content })
            }
          );

          if (response.ok) {
            setLastSaved(new Date());
            pendingSavesRef.current.delete(sectionNumber);
            
            // Update local protocol state without full refresh
            setProtocol(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                sections: prev.sections?.map(s => 
                  s.sectionNumber === sectionNumber 
                    ? { ...s, content }
                    : s
                )
              };
            });
          }
        } catch (err) {
          console.error('Auto-save failed:', err);
        } finally {
          setSaving(false);
        }
      }
    }, 2000); // 2 second debounce
  }, [protocol]);

  const refreshProtocol = async () => {
    if (protocol) {
      await loadProtocol(protocol.id);
    }
  };

  // Navigation helpers
  const navigateToNextSection = useCallback((currentSection: string): string | null => {
    if (!protocol?.sections) return null;
    
    const currentIndex = protocol.sections.findIndex(s => s.sectionNumber === currentSection);
    if (currentIndex === -1 || currentIndex === protocol.sections.length - 1) return null;
    
    return protocol.sections[currentIndex + 1].sectionNumber;
  }, [protocol]);

  const navigateToPrevSection = useCallback((currentSection: string): string | null => {
    if (!protocol?.sections) return null;
    
    const currentIndex = protocol.sections.findIndex(s => s.sectionNumber === currentSection);
    if (currentIndex <= 0) return null;
    
    return protocol.sections[currentIndex - 1].sectionNumber;
  }, [protocol]);

  // Calculate section progress based on content
  const getSectionProgress = useCallback((sectionNumber: string): number => {
    if (!protocol?.sections) return 0;
    
    const section = protocol.sections.find(s => s.sectionNumber === sectionNumber);
    if (!section || !section.content) return 0;
    
    const content = section.content;
    const fields = Object.keys(content);
    if (fields.length === 0) return 0;
    
    const filledFields = fields.filter(key => {
      const value = content[key];
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return !!value;
    });
    
    return Math.round((filledFields.length / fields.length) * 100);
  }, [protocol]);

  useEffect(() => {
    if (protocolId) {
      loadProtocol(protocolId);
    }
  }, [protocolId]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return (
    <ProtocolContext.Provider
      value={{
        protocol,
        loading,
        error,
        saving,
        lastSaved,
        loadProtocol,
        updateProtocol,
        saveSection,
        autoSaveSection,
        refreshProtocol,
        navigateToNextSection,
        navigateToPrevSection,
        getSectionProgress
      }}
    >
      {children}
    </ProtocolContext.Provider>
  );
};
