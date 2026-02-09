export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationStatus = 'valid' | 'invalid' | 'valid_with_warnings';
export type SectionValidationStatus = 'invalid' | 'warning' | 'complete' | 'incomplete';

export interface ValidationIssue {
  ruleId: string;
  severity: ValidationSeverity;
  section: string;
  field?: string;
  message: string;
  suggestion?: string;
  blocking: boolean;
}

export interface SectionStatus {
  title: string;
  complete: boolean;
  errors: number;
  warnings: number;
  status: SectionValidationStatus;
}

export interface ValidationReport {
  protocolId: string;
  validationDate: string;
  overallStatus: ValidationStatus;
  completenessScore: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  issues: ValidationIssue[];
  sectionStatus: Record<string, SectionStatus>;
}
