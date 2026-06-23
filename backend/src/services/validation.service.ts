import prisma from '../db';

// ==================== VALIDATION RULE TYPES ====================
export interface ValidationIssue {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  section: string;
  field?: string;
  message: string;
  suggestion?: string;
  blocking: boolean; // Prevents protocol finalization if true
}

export interface ValidationReport {
  protocolId: string;
  validationDate: string;
  overallStatus: 'valid' | 'invalid' | 'valid_with_warnings';
  completenessScore: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  issues: ValidationIssue[];
  sectionStatus: Record<string, {
    complete: boolean;
    errors: number;
    warnings: number;
  }>;
}

// ==================== M11 CONFORMANCE RULES ====================
export class ValidationEngine {
  async validateProtocol(protocolId: string): Promise<ValidationReport> {
    try {
      const protocol = await prisma.protocol.findUnique({
        where: { id: protocolId },
        include: {
          sections: true,
          objectives: true,
          eligibilityCriteria: true,
          interventions: true
        }
      });

      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const issues: ValidationIssue[] = [];

      // Run all validation rule categories with error handling
      try {
        issues.push(...this.validateM11Conformance(protocol));
      } catch (error) {
        console.error('Error in validateM11Conformance:', error);
      }

      try {
        issues.push(...this.validateAdvancedM11Rules(protocol));
      } catch (error) {
        console.error('Error in validateAdvancedM11Rules:', error);
      }

      try {
        issues.push(...this.validateCrossSectionDependencies(protocol));
      } catch (error) {
        console.error('Error in validateCrossSectionDependencies:', error);
      }

      try {
        issues.push(...this.validateGCPRequirements(protocol));
      } catch (error) {
        console.error('Error in validateGCPRequirements:', error);
      }

      try {
        issues.push(...this.validateIndiaSpecificRules(protocol));
      } catch (error) {
        console.error('Error in validateIndiaSpecificRules:', error);
      }

      try {
        issues.push(...this.applyConditionalValidation(protocol, issues));
      } catch (error) {
        console.error('Error in applyConditionalValidation:', error);
      }

      // Calculate section status
      const sectionStatus = this.calculateSectionStatus(protocol, issues);

      // Determine overall status
      const totalErrors = issues.filter(i => i.severity === 'error').length;
      const totalWarnings = issues.filter(i => i.severity === 'warning').length;
      const totalInfo = issues.filter(i => i.severity === 'info').length;

      let overallStatus: 'valid' | 'invalid' | 'valid_with_warnings' = 'valid';
      if (totalErrors > 0) {
        overallStatus = 'invalid';
      } else if (totalWarnings > 0) {
        overallStatus = 'valid_with_warnings';
      }

      // Get completeness score
      const completenessScore = protocol.completenessPercentage || 0;

      const report: ValidationReport = {
        protocolId,
        validationDate: new Date().toISOString(),
        overallStatus,
        completenessScore,
        totalErrors,
        totalWarnings,
        totalInfo,
        issues,
        sectionStatus
      };

      // Store validation result
      try {
        await this.storeValidationResult(report);
      } catch (error) {
        console.error('Error storing validation result:', error);
        // Continue even if storage fails
      }

      return report;
    } catch (error) {
      console.error('Error in validateProtocol:', error);
      throw error;
    }
  }

  // ==================== M11 CONFORMANCE RULES ====================
  private validateM11Conformance(protocol: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Rule M11-001: Required Protocol Identifiers
    if (!protocol.sponsorProtocolIdentifier) {
      issues.push({
        ruleId: 'M11-001',
        severity: 'error',
        section: '0',
        field: 'sponsorProtocolIdentifier',
        message: 'Sponsor Protocol Identifier is required',
        suggestion: 'Add a unique protocol identifier (e.g., ABC-2024-001)',
        blocking: true
      });
    }

    if (!protocol.fullTitle) {
      issues.push({
        ruleId: 'M11-001',
        severity: 'error',
        section: '0',
        field: 'fullTitle',
        message: 'Full protocol title is required',
        suggestion: 'Provide descriptive title including phase, intervention, and indication',
        blocking: true
      });
    }

    // Rule M11-002: Amendment Requirements
    if (protocol.originalProtocolIndicator === false) {
      if (!protocol.protocolAmendmentNumber) {
        issues.push({
          ruleId: 'M11-002',
          severity: 'error',
          section: '0',
          field: 'protocolAmendmentNumber',
          message: 'Amendment number required when Original Protocol Indicator is false',
          suggestion: 'Specify amendment number (e.g., Amendment 1)',
          blocking: true
        });
      }

      if (!protocol.amendmentScope) {
        issues.push({
          ruleId: 'M11-002',
          severity: 'error',
          section: '0',
          field: 'amendmentScope',
          message: 'Amendment scope required (Global, Regional, National, or Site-Specific)',
          blocking: true
        });
      }
    }

    // Rule M11-003: Objectives & Estimands
    const primaryObjectives = protocol.objectives.filter((o: any) => o.objectiveType === 'primary');
    if (primaryObjectives.length === 0) {
      issues.push({
        ruleId: 'M11-003',
        severity: 'error',
        section: '3',
        message: 'At least one primary objective is required',
        suggestion: 'Add primary objective in Section 3',
        blocking: true
      });
    }

    // Check primary objective estimands
    primaryObjectives.forEach((obj: any, index: number) => {
      if (!obj.estimand) {
        issues.push({
          ruleId: 'M11-003',
          severity: 'warning',
          section: '3.1',
          field: `objectives[${index}].estimand`,
          message: `Primary objective "${obj.objectiveText.substring(0, 50)}..." missing estimand`,
          suggestion: 'Add estimand with treatment, population, endpoint, intercurrent events, and summary measure (ICH E9 R1)',
          blocking: false
        });
      } else {
        const estimand = obj.estimand as any;
        const missing: string[] = [];
        if (!estimand.treatment) missing.push('treatment');
        if (!estimand.population) missing.push('population');
        if (!estimand.endpoint) missing.push('endpoint');
        if (!estimand.intercurrentEvents?.strategy) missing.push('intercurrent events strategy');
        if (!estimand.summaryMeasure) missing.push('summary measure');

        if (missing.length > 0) {
          issues.push({
            ruleId: 'M11-003',
            severity: 'warning',
            section: '3.1',
            field: `objectives[${index}].estimand`,
            message: `Estimand incomplete: missing ${missing.join(', ')}`,
            suggestion: 'Complete all 5 estimand components per ICH E9(R1)',
            blocking: false
          });
        }
      }
    });

    // Rule M11-004: Population Criteria
    const inclusionCriteria = protocol.eligibilityCriteria.filter((c: any) => c.criterionType === 'inclusion');
    const exclusionCriteria = protocol.eligibilityCriteria.filter((c: any) => c.criterionType === 'exclusion');

    if (inclusionCriteria.length === 0) {
      issues.push({
        ruleId: 'M11-004',
        severity: 'error',
        section: '5.2',
        message: 'At least one inclusion criterion is required',
        suggestion: 'Add inclusion criteria defining target population',
        blocking: true
      });
    }

    if (exclusionCriteria.length === 0) {
      issues.push({
        ruleId: 'M11-004',
        severity: 'error',
        section: '5.3',
        message: 'At least one exclusion criterion is required',
        suggestion: 'Add exclusion criteria to ensure participant safety',
        blocking: true
      });
    }

    // Rule M11-005: Interventions
    const investigationalProducts = protocol.interventions.filter((i: any) => i.interventionType === 'investigational_product');
    if (investigationalProducts.length === 0) {
      issues.push({
        ruleId: 'M11-005',
        severity: 'error',
        section: '6',
        message: 'At least one investigational product required',
        suggestion: 'Add investigational product in Section 6',
        blocking: true
      });
    }

    // Check intervention details
    protocol.interventions.forEach((intervention: any, index: number) => {
      if (!intervention.routeOfAdministration) {
        issues.push({
          ruleId: 'M11-005',
          severity: 'warning',
          section: '6',
          field: `interventions[${index}].routeOfAdministration`,
          message: `Intervention "${intervention.productName}" missing route of administration`,
          suggestion: 'Specify route (e.g., Oral, IV, IM, SC)',
          blocking: false
        });
      }

      if (!intervention.dose || !intervention.doseUnit) {
        issues.push({
          ruleId: 'M11-005',
          severity: 'warning',
          section: '6',
          field: `interventions[${index}].dose`,
          message: `Intervention "${intervention.productName}" missing dose/dose unit`,
          suggestion: 'Specify dose and unit (e.g., 100 mg)',
          blocking: false
        });
      }
    });

    // Rule M11-006: Trial Design
    if (!protocol.trialPhase) {
      issues.push({
        ruleId: 'M11-006',
        severity: 'error',
        section: '4',
        field: 'trialPhase',
        message: 'Trial phase is required',
        suggestion: 'Specify phase (Phase 1, 2, 3, or 4)',
        blocking: true
      });
    }

    return issues;
  }

  // ==================== CROSS-SECTION DEPENDENCIES ====================
  private validateCrossSectionDependencies(protocol: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Dependency Check 1: Multiple interventions should indicate randomization
    if (protocol.interventions.length > 1) {
      // Check if design section mentions randomization
      const designSection = protocol.sections.find((s: any) => s.sectionNumber === '4');
      if (designSection?.content) {
        const content = designSection.content as any;
        if (!content.randomization) {
          issues.push({
            ruleId: 'DEP-001',
            severity: 'warning',
            section: '4',
            message: 'Multiple interventions detected but randomization not specified',
            suggestion: 'Add randomization details in Section 4 (design)',
            blocking: false
          });
        }
      }
    }

    // Dependency Check 2: Primary objective should have corresponding assessment
    // This would require checking if assessments table exists (Phase 1 doesn't have it yet)
    // Skip for now, add in Phase 2

    // Dependency Check 3: If blinded trial, unblinding procedures required
    // This would check Section 4 design for blinding
    // Skip for now, add when section content is more structured

    return issues;
  }

  // ==================== GCP REQUIREMENTS ====================
  private validateGCPRequirements(protocol: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // GCP Check 1: Informed Consent
    const oversightSection = protocol.sections.find((s: any) => s.sectionNumber === '11');
    if (oversightSection && !oversightSection.content?.informedConsent) {
      issues.push({
        ruleId: 'GCP-001',
        severity: 'warning',
        section: '11.1',
        message: 'Informed consent process not documented',
        suggestion: 'Add informed consent procedures in Section 11',
        blocking: false
      });
    }

    // GCP Check 2: Vulnerable populations protection
    const hasChildrenCriteria = protocol.eligibilityCriteria.some((c: any) => 
      c.criterionText.toLowerCase().includes('child') || 
      c.criterionText.toLowerCase().includes('pediatric') ||
      (c.criterionText.toLowerCase().includes('age') && c.criterionText.includes('18'))
    );

    if (hasChildrenCriteria && oversightSection && !oversightSection.content?.vulnerablePopulations) {
      issues.push({
        ruleId: 'GCP-002',
        severity: 'warning',
        section: '11',
        message: 'Trial may include vulnerable population (children) but additional protections not documented',
        suggestion: 'Add vulnerable population protections (assent, parental consent) in Section 11',
        blocking: false
      });
    }

    return issues;
  }

  // ==================== SECTION STATUS CALCULATION ====================
  private calculateSectionStatus(protocol: any, issues: ValidationIssue[]): Record<string, any> {
    const sectionStatus: Record<string, any> = {};

    protocol.sections.forEach((section: any) => {
      const sectionIssues = issues.filter(i => i.section === section.sectionNumber);
      const errors = sectionIssues.filter(i => i.severity === 'error').length;
      const warnings = sectionIssues.filter(i => i.severity === 'warning').length;

      sectionStatus[section.sectionNumber] = {
        title: section.sectionTitle,
        complete: section.isComplete,
        errors,
        warnings,
        status: errors > 0 ? 'invalid' : warnings > 0 ? 'warning' : section.isComplete ? 'complete' : 'incomplete'
      };
    });

    return sectionStatus;
  }

  // ==================== ADVANCED M11 CONFORMANCE RULES ====================
  private validateAdvancedM11Rules(protocol: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Rule M11-007: Trial Design - Randomization Details
    const designSection = protocol.sections.find((s: any) => s.sectionNumber === '4');
    if (protocol.interventions.length > 1 && designSection) {
      const content = designSection.content as any;
      if (content.randomization) {
        if (!content.randomization.method) {
          issues.push({
            ruleId: 'M11-007',
            severity: 'error',
            section: '4',
            field: 'randomization.method',
            message: 'Randomization method not specified',
            suggestion: 'Specify method (e.g., block randomization, stratified randomization, minimization)',
            blocking: true
          });
        }
        if (!content.randomization.ratio) {
          issues.push({
            ruleId: 'M11-007',
            severity: 'warning',
            section: '4',
            field: 'randomization.ratio',
            message: 'Randomization ratio not specified',
            suggestion: 'Specify allocation ratio (e.g., 1:1, 2:1)',
            blocking: false
          });
        }
      }
    }

    // Rule M11-008: Blinding Requirements
    if (designSection?.content) {
      const content = designSection.content as any;
      if (content.blinding && content.blinding.schema !== 'Open Label') {
        if (!content.blinding.measures) {
          issues.push({
            ruleId: 'M11-008',
            severity: 'warning',
            section: '6.7',
            message: 'Blinding measures not documented for blinded trial',
            suggestion: 'Add Section 6.7.3 describing how blinding will be maintained',
            blocking: false
          });
        }
        if (!content.blinding.unblindingProcedures) {
          issues.push({
            ruleId: 'M11-008',
            severity: 'warning',
            section: '6.7',
            message: 'Emergency unblinding procedures not documented',
            suggestion: 'Describe circumstances and procedures for emergency unblinding',
            blocking: false
          });
        }
      }
    }

    // Rule M11-009: Assessments Schedule
    const soaSection = protocol.sections.find((s: any) => s.sectionNumber === '1');
    if (soaSection && !soaSection.content?.scheduleOfActivities) {
      issues.push({
        ruleId: 'M11-009',
        severity: 'warning',
        section: '1.3',
        message: 'Schedule of Activities not defined',
        suggestion: 'Create SoA table showing all visits and procedures',
        blocking: false
      });
    }

    // Rule M11-010: Discontinuation Criteria
    const discontinuationSection = protocol.sections.find((s: any) => s.sectionNumber === '7');
    if (discontinuationSection && !discontinuationSection.content?.discontinuationCriteria) {
      issues.push({
        ruleId: 'M11-010',
        severity: 'warning',
        section: '7',
        message: 'Discontinuation criteria not specified',
        suggestion: 'Define criteria for participant discontinuation from intervention or trial',
        blocking: false
      });
    }

    // Rule M11-011: Adverse Event Definitions
    const aeSection = protocol.sections.find((s: any) => s.sectionNumber === '9');
    if (aeSection) {
      const content = aeSection.content as any;
      if (!content?.aeDefinition) {
        issues.push({
          ruleId: 'M11-011',
          severity: 'error',
          section: '9.1',
          message: 'Adverse Event (AE) definition not provided',
          suggestion: 'Define AE per ICH E2A or local regulation',
          blocking: true
        });
      }
      if (!content?.saeDefinition) {
        issues.push({
          ruleId: 'M11-011',
          severity: 'error',
          section: '9.1',
          message: 'Serious Adverse Event (SAE) definition not provided',
          suggestion: 'Define SAE with criteria (death, life-threatening, hospitalization, etc.)',
          blocking: true
        });
      }
      if (!content?.reportingTimelines) {
        issues.push({
          ruleId: 'M11-011',
          severity: 'error',
          section: '9.2',
          message: 'AE/SAE reporting timelines not specified',
          suggestion: 'Specify timeframes for reporting to sponsor and regulatory authorities',
          blocking: true
        });
      }
    }

    // Rule M11-012: Statistical Analysis Plan
    const statsSection = protocol.sections.find((s: any) => s.sectionNumber === '10');
    if (statsSection) {
      const content = statsSection.content as any;
      if (!content?.analysisSets) {
        issues.push({
          ruleId: 'M11-012',
          severity: 'warning',
          section: '10.2',
          message: 'Analysis sets not defined',
          suggestion: 'Define ITT, PP, and Safety analysis populations',
          blocking: false
        });
      }
      if (!content?.primaryAnalysis) {
        issues.push({
          ruleId: 'M11-012',
          severity: 'error',
          section: '10.4',
          message: 'Primary analysis method not specified',
          suggestion: 'Describe statistical method for primary endpoint analysis',
          blocking: true
        });
      }
      if (!content?.sampleSizeJustification) {
        issues.push({
          ruleId: 'M11-012',
          severity: 'error',
          section: '10.11',
          message: 'Sample size justification not provided',
          suggestion: 'Provide power calculation with assumptions (alpha, power, effect size, dropout)',
          blocking: true
        });
      }
    }

    // Rule M11-013: Data Safety Monitoring
    const oversightSection = protocol.sections.find((s: any) => s.sectionNumber === '11');
    if (oversightSection) {
      const content = oversightSection.content as any;
      if (protocol.trialPhase === 'phase_3' || protocol.trialPhase === 'phase_2_3') {
        if (!content?.committees?.some((c: any) => c.type === 'DMC')) {
          issues.push({
            ruleId: 'M11-013',
            severity: 'warning',
            section: '11.4',
            message: 'Phase 3 trial without Data Monitoring Committee (DMC)',
            suggestion: 'Consider establishing DMC for ongoing safety monitoring',
            blocking: false
          });
        }
      }
    }

    // Rule M11-014: Informed Consent Requirements
    if (oversightSection) {
      const content = oversightSection.content as any;
      if (!content?.informedConsent?.process) {
        issues.push({
          ruleId: 'M11-014',
          severity: 'error',
          section: '11.1',
          message: 'Informed consent process not documented',
          suggestion: 'Describe consent process, timing, and responsible parties',
          blocking: true
        });
      }
      if (!content?.informedConsent?.languages || content.informedConsent.languages.length === 0) {
        issues.push({
          ruleId: 'M11-014',
          severity: 'warning',
          section: '11.1',
          message: 'Consent form languages not specified',
          suggestion: 'List all languages for informed consent materials',
          blocking: false
        });
      }
    }

    // Rule M11-015: Protocol Version Control
    if (!protocol.protocolVersion) {
      issues.push({
        ruleId: 'M11-015',
        severity: 'error',
        section: '0',
        field: 'protocolVersion',
        message: 'Protocol version not specified',
        suggestion: 'Assign version number (e.g., 1.0, 2.0)',
        blocking: true
      });
    }
    if (!protocol.protocolDate) {
      issues.push({
        ruleId: 'M11-015',
        severity: 'error',
        section: '0',
        field: 'protocolDate',
        message: 'Protocol date not specified',
        suggestion: 'Add protocol date (version date)',
        blocking: true
      });
    }

    // Rule M11-016: Study Type Classification
    if (!protocol.studyType) {
      issues.push({
        ruleId: 'M11-016',
        severity: 'warning',
        section: '4',
        field: 'studyType',
        message: 'Study type not specified',
        suggestion: 'Classify as Interventional or Observational',
        blocking: false
      });
    }

    // Rule M11-017: Indication/Disease Area
    if (!protocol.indication) {
      issues.push({
        ruleId: 'M11-017',
        severity: 'error',
        section: '2',
        field: 'indication',
        message: 'Indication or disease area not specified',
        suggestion: 'Describe target condition or disease',
        blocking: true
      });
    }

    // Rule M11-018: Treatment Duration
    protocol.interventions.forEach((intervention: any, index: number) => {
      if (!intervention.duration) {
        issues.push({
          ruleId: 'M11-018',
          severity: 'warning',
          section: '6',
          field: `interventions[${index}].duration`,
          message: `Treatment duration not specified for "${intervention.productName}"`,
          suggestion: 'Specify duration (e.g., 12 weeks, until progression)',
          blocking: false
        });
      }
    });

    // Rule M11-019: Follow-up Period
    if (designSection?.content && !designSection.content.followUpPeriod) {
      issues.push({
        ruleId: 'M11-019',
        severity: 'warning',
        section: '4',
        message: 'Follow-up period not specified',
        suggestion: 'Define follow-up duration after treatment completion',
        blocking: false
      });
    }

    // Rule M11-020: Pregnancy Requirements
    const hasWomenOfChildbearing = protocol.eligibilityCriteria.some((c: any) => 
      c.criterionText.toLowerCase().includes('women') ||
      c.criterionText.toLowerCase().includes('female') ||
      c.criterionText.toLowerCase().includes('childbearing')
    );
    if (hasWomenOfChildbearing) {
      const populationSection = protocol.sections.find((s: any) => s.sectionNumber === '5');
      if (!populationSection?.content?.contraceptionRequirements) {
        issues.push({
          ruleId: 'M11-020',
          severity: 'warning',
          section: '5.4',
          message: 'Trial includes women of childbearing potential but contraception requirements not specified',
          suggestion: 'Add contraception requirements in Section 5.4',
          blocking: false
        });
      }
      const aeSection = protocol.sections.find((s: any) => s.sectionNumber === '9');
      if (!aeSection?.content?.pregnancyReporting) {
        issues.push({
          ruleId: 'M11-020',
          severity: 'warning',
          section: '9.3',
          message: 'Pregnancy reporting procedures not specified',
          suggestion: 'Add pregnancy reporting requirements in Section 9.3',
          blocking: false
        });
      }
    }

    // Rule M11-021: Glossary and Abbreviations
    const glossarySection = protocol.sections.find((s: any) => s.sectionNumber === '13');
    if (glossarySection && (!glossarySection.content || Object.keys(glossarySection.content).length === 0)) {
      issues.push({
        ruleId: 'M11-021',
        severity: 'info',
        section: '13',
        message: 'Glossary and abbreviations list is empty',
        suggestion: 'Add definitions for technical terms and abbreviations used in protocol',
        blocking: false
      });
    }

    return issues;
  }

  // ==================== INDIA-SPECIFIC VALIDATION RULES ====================
  private validateIndiaSpecificRules(protocol: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const indiaSection = protocol.sections.find((s: any) => 
      s.sectionNumber === '12' && s.content?.countrySpecific?.india
    );

    if (indiaSection) {
      const indiaData = indiaSection.content.countrySpecific.india;

      // Rule INDIA-001: CDSCO Approval Number
      if (!indiaData.cdscoApprovalNumber) {
        issues.push({
          ruleId: 'INDIA-001',
          severity: 'info',
          section: '12.2',
          message: 'CDSCO approval number not recorded (required after approval)',
          suggestion: 'Add DCGI/CDSCO approval number once obtained',
          blocking: false
        });
      }

      // Rule INDIA-002: CTRI Registration
      if (!indiaData.ctriNumber) {
        issues.push({
          ruleId: 'INDIA-002',
          severity: 'warning',
          section: '12.2',
          message: 'CTRI registration number not provided',
          suggestion: 'Register trial at CTRI (ctri.nic.in) before first participant enrollment',
          blocking: false
        });
      }

      // Rule INDIA-003: Compensation Policy
      if (!indiaData.compensationPolicy) {
        issues.push({
          ruleId: 'INDIA-003',
          severity: 'error',
          section: '12.2',
          message: 'Compensation policy not documented (NDCTR 2019 requirement)',
          suggestion: 'Add detailed compensation policy for trial-related injury/death',
          blocking: true
        });
      }

      // Rule INDIA-004: Insurance Coverage
      if (!indiaData.insurancePolicy) {
        issues.push({
          ruleId: 'INDIA-004',
          severity: 'error',
          section: '12.2',
          message: 'Insurance policy details not provided (mandatory in India)',
          suggestion: 'Document insurance coverage for participants (company, policy number, coverage amount)',
          blocking: true
        });
      }

      // Rule INDIA-005: Ethics Committee Approvals
      if (!indiaData.ecApprovals || indiaData.ecApprovals.length === 0) {
        issues.push({
          ruleId: 'INDIA-005',
          severity: 'warning',
          section: '12.2',
          message: 'Ethics Committee approval details not documented',
          suggestion: 'Add EC registration numbers and approval dates for all participating sites',
          blocking: false
        });
      }

      // Rule INDIA-006: Biological Sample Export
      if (indiaData.biologicalSamples?.export === true) {
        if (!indiaData.biologicalSamples.exportJustification) {
          issues.push({
            ruleId: 'INDIA-006',
            severity: 'error',
            section: '12.2',
            message: 'Biological sample export to abroad requires justification (NDCTR Rule 33)',
            suggestion: 'Provide scientific justification for why samples must be processed abroad',
            blocking: true
          });
        }
        if (!indiaData.biologicalSamples.dcgiApproval) {
          issues.push({
            ruleId: 'INDIA-006',
            severity: 'error',
            section: '12.2',
            message: 'DCGI approval required for biological sample export',
            suggestion: 'Obtain DCGI permission before exporting samples abroad',
            blocking: true
          });
        }
      }

      // Rule INDIA-007: Vulnerable Populations (ICMR Guidelines)
      const hasVulnerable = protocol.eligibilityCriteria.some((c: any) => 
        c.criterionText.toLowerCase().includes('child') ||
        c.criterionText.toLowerCase().includes('tribal') ||
        c.criterionText.toLowerCase().includes('rural') ||
        c.criterionText.toLowerCase().includes('economically')
      );
      if (hasVulnerable && !indiaData.vulnerablePopulationProtections) {
        issues.push({
          ruleId: 'INDIA-007',
          severity: 'error',
          section: '12.2',
          message: 'Trial includes vulnerable population but additional protections not documented (ICMR Guidelines 2017)',
          suggestion: 'Add protections for vulnerable populations (assent, community engagement, cultural considerations)',
          blocking: true
        });
      }

      // Rule INDIA-008: Community Engagement
      const hasTribalOrRural = protocol.eligibilityCriteria.some((c: any) => 
        c.criterionText.toLowerCase().includes('tribal') ||
        c.criterionText.toLowerCase().includes('rural')
      );
      if (hasTribalOrRural && !indiaData.communityEngagement) {
        issues.push({
          ruleId: 'INDIA-008',
          severity: 'warning',
          section: '12.2',
          message: 'Trial in tribal/rural communities should include community engagement plan',
          suggestion: 'Document community consultation and engagement procedures per ICMR guidelines',
          blocking: false
        });
      }

      // Rule INDIA-009: Multi-Language Consent
      const oversightSection = protocol.sections.find((s: any) => s.sectionNumber === '11');
      const consentLanguages = oversightSection?.content?.informedConsent?.languages || [];
      if (consentLanguages.length === 1 && consentLanguages[0] === 'English') {
        issues.push({
          ruleId: 'INDIA-009',
          severity: 'warning',
          section: '11.1',
          message: 'Informed consent only in English may not be appropriate for Indian participants',
          suggestion: 'Provide consent forms in local languages (Hindi, regional languages)',
          blocking: false
        });
      }

      // Rule INDIA-010: Audio-Visual Recording for Illiterate Participants
      if (oversightSection?.content?.informedConsent) {
        const consent = oversightSection.content.informedConsent;
        if (!consent.audioVisualRecording && !consent.witnessRequirement) {
          issues.push({
            ruleId: 'INDIA-010',
            severity: 'warning',
            section: '11.1',
            message: 'No provision for illiterate participants documented',
            suggestion: 'Add witness requirement and audio-visual recording for consent from illiterate participants',
            blocking: false
          });
        }
      }
    }

    return issues;
  }

  // ==================== CONDITIONAL VALIDATION LOGIC ====================
  private applyConditionalValidation(protocol: any, issues: ValidationIssue[]): ValidationIssue[] {
    const conditionalIssues: ValidationIssue[] = [];

    // Conditional 1: If Phase 1, require dose escalation details
    if (protocol.trialPhase === 'phase_1') {
      const interventionSection = protocol.sections.find((s: any) => s.sectionNumber === '6');
      if (interventionSection && !interventionSection.content?.doseEscalation) {
        conditionalIssues.push({
          ruleId: 'COND-001',
          severity: 'warning',
          section: '6',
          message: 'Phase 1 trial should describe dose escalation scheme',
          suggestion: 'Add dose escalation rules (e.g., 3+3 design, CRM, BOIN)',
          blocking: false
        });
      }
    }

    // Conditional 2: If crossover design, require washout period
    const designSection = protocol.sections.find((s: any) => s.sectionNumber === '4');
    if (designSection?.content?.designType === 'Crossover') {
      if (!designSection.content.washoutPeriod) {
        conditionalIssues.push({
          ruleId: 'COND-002',
          severity: 'error',
          section: '4',
          message: 'Crossover trial requires washout period specification',
          suggestion: 'Define washout period duration and justification',
          blocking: true
        });
      }
    }

    // Conditional 3: If adaptive design, require adaptation rules
    if (designSection?.content?.designType === 'Adaptive') {
      if (!designSection.content.adaptationRules) {
        conditionalIssues.push({
          ruleId: 'COND-003',
          severity: 'error',
          section: '4',
          message: 'Adaptive trial requires pre-specified adaptation rules',
          suggestion: 'Document adaptation criteria, timing, and decision rules',
          blocking: true
        });
      }
    }

    // Conditional 4: If biological drug, require immunogenicity assessment
    const hasBiologic = protocol.interventions.some((i: any) => 
      i.productName.toLowerCase().includes('mab') ||
      i.productName.toLowerCase().includes('antibody') ||
      i.dosageForm?.toLowerCase().includes('injection') ||
      i.interventionType === 'biologic'
    );
    if (hasBiologic) {
      const assessmentsSection = protocol.sections.find((s: any) => s.sectionNumber === '8');
      if (!assessmentsSection?.content?.immunogenicity) {
        conditionalIssues.push({
          ruleId: 'COND-004',
          severity: 'warning',
          section: '8.7',
          message: 'Biological product should include immunogenicity assessment',
          suggestion: 'Add anti-drug antibody (ADA) testing in Section 8.7',
          blocking: false
        });
      }
    }

    // Conditional 5: If oncology trial, require tumor assessment schedule
    if (protocol.indication?.toLowerCase().includes('cancer') ||
        protocol.indication?.toLowerCase().includes('tumor') ||
        protocol.indication?.toLowerCase().includes('oncology')) {
      const assessmentsSection = protocol.sections.find((s: any) => s.sectionNumber === '8');
      if (!assessmentsSection?.content?.tumorAssessment) {
        conditionalIssues.push({
          ruleId: 'COND-005',
          severity: 'warning',
          section: '8',
          message: 'Oncology trial should specify tumor assessment schedule',
          suggestion: 'Add tumor imaging schedule and response criteria (RECIST, iRECIST)',
          blocking: false
        });
      }
    }

    return conditionalIssues;
  }

  // ==================== STORE VALIDATION RESULT ====================
  private async storeValidationResult(report: ValidationReport): Promise<void> {
    try {
      // Ensure JSON serialization works properly
      const resultsJson = JSON.parse(JSON.stringify(report.issues));
      const sectionStatusJson = JSON.parse(JSON.stringify(report.sectionStatus));

      await prisma.validationResult.create({
        data: {
          protocolId: report.protocolId,
          validationDate: new Date(report.validationDate),
          overallStatus: report.overallStatus,
          totalIssues: report.issues.length,
          errorCount: report.totalErrors,
          warningCount: report.totalWarnings,
          results: resultsJson,
          sectionStatus: sectionStatusJson
        }
      });

      // Update protocol with last validation info and completeness
      await prisma.protocol.update({
        where: { id: report.protocolId },
        data: {
          completenessPercentage: report.completenessScore
        }
      });
    } catch (error) {
      console.error('Error in storeValidationResult:', error);
      throw error;
    }
  }
}

export const validationEngine = new ValidationEngine();
