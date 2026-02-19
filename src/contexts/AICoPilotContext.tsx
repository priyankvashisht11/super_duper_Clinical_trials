import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { aiService } from '../services/aiService';

interface FieldContext {
  fieldName: string;
  fieldValue: string;
  fieldType: string;
  sectionNumber: string;
  protocolContext: any;
}

interface ValidationResult {
  status: 'valid' | 'warning' | 'error' | 'incomplete';
  message: string;
}

interface AICoPilotContextType {
  currentField: FieldContext | null;
  setCurrentField: (field: FieldContext | null) => void;
  suggestions: string[];
  guidance: string[];
  validation: ValidationResult | null;
  isAnalyzing: boolean;
  analyzeField: (field: FieldContext) => Promise<void>;
}

const AICoPilotContext = createContext<AICoPilotContextType | undefined>(undefined);

export const AICoPilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentField, setCurrentField] = useState<FieldContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [guidance, setGuidance] = useState<string[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const analyzeField = useCallback(async (field: FieldContext) => {
    if (!field || !field.fieldValue || field.fieldValue.length < 3) {
      setSuggestions([]);
      setValidation(null);
      setGuidance([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      const prompt = `Analyze this protocol field and provide:
1. 3-5 auto-complete suggestions to improve/complete the text
2. 2-3 specific guidance tips for this field
3. Validation status (valid/warning/error/incomplete) with a specific message

Field: ${field.fieldName}
Section: ${field.sectionNumber}
Current Input: "${field.fieldValue}"
Protocol: ${field.protocolContext?.title || 'N/A'} (${field.protocolContext?.phase || 'N/A'})

Respond in this format:
SUGGESTIONS:
- suggestion 1
- suggestion 2
- suggestion 3

GUIDANCE:
- tip 1
- tip 2

VALIDATION: [status] - message`;

      const response = await aiService.getSectionAssistance(
        field.sectionNumber,
        { [field.fieldName]: field.fieldValue },
        prompt,
        field.protocolContext
      );

      // Parse response
      const content = response.content;
      const suggestionsList: string[] = [];
      const guidanceList: string[] = [];
      let validationResult: ValidationResult = {
        status: 'incomplete',
        message: 'Continue entering information'
      };

      const lines = content.split('\n');
      let section = '';

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.toUpperCase().includes('SUGGESTIONS:')) {
          section = 'suggestions';
        } else if (trimmed.toUpperCase().includes('GUIDANCE:')) {
          section = 'guidance';
        } else if (trimmed.toUpperCase().includes('VALIDATION:')) {
          section = 'validation';
          const match = trimmed.match(/\[(valid|warning|error|incomplete)\]\s*-?\s*(.+)/i);
          if (match) {
            validationResult = {
              status: match[1].toLowerCase() as any,
              message: match[2].trim()
            };
          }
        } else if (trimmed.match(/^[-•*]\s+/)) {
          const text = trimmed.replace(/^[-•*]\s+/, '');
          if (section === 'suggestions' && suggestionsList.length < 5) {
            suggestionsList.push(text);
          } else if (section === 'guidance' && guidanceList.length < 3) {
            guidanceList.push(text);
          }
        }
      });

      setSuggestions(suggestionsList);
      setGuidance(guidanceList);
      setValidation(validationResult);
    } catch (error) {
      console.error('AI analysis error:', error);
      setSuggestions([]);
      setGuidance(['AI analysis temporarily unavailable']);
      setValidation(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Debounced analysis on field change
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (currentField?.fieldValue && currentField.fieldValue.length >= 3) {
      const timer = setTimeout(() => {
        analyzeField(currentField);
      }, 800); // 800ms debounce to reduce API calls
      setDebounceTimer(timer);
    } else {
      setSuggestions([]);
      setValidation(null);
      setGuidance([]);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [currentField?.fieldValue]);

  return (
    <AICoPilotContext.Provider
      value={{
        currentField,
        setCurrentField,
        suggestions,
        guidance,
        validation,
        isAnalyzing,
        analyzeField
      }}
    >
      {children}
    </AICoPilotContext.Provider>
  );
};

export const useAICoPilot = () => {
  const context = useContext(AICoPilotContext);
  if (!context) {
    throw new Error('useAICoPilot must be used within AICoPilotProvider');
  }
  return context;
};
