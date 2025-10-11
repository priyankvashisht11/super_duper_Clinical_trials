import { 
  DocumentGenerationRequest, 
  DocumentGenerationResponse, 
  Citation, 
  ClinicalTrial 
} from '../types';
import { searchService } from './searchService';

// Mock document generation service for demo purposes
export class DocumentService {
  
  /**
   * Generate research document based on selected trials and research question
   */
  async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    // Simulate AI processing time
    await this.delay(2000);

    const trials = await searchService.getTrialsByIds(request.trialIds);
    const content = await this.generateContent(trials, request);
    const citations = this.generateCitations(trials, request.citationStyle);

    return {
      documentId: this.generateDocumentId(),
      content,
      citations,
      metadata: {
        generatedAt: new Date(),
        wordCount: this.countWords(content),
        processingTime: 2000
      }
    };
  }

  /**
   * Generate streaming document content (for real-time display)
   */
  async* generateStreamingDocument(
    request: DocumentGenerationRequest,
    onProgress?: (progress: number, status: string) => void
  ): AsyncGenerator<{ chunk: string; progress: number; status: string }, DocumentGenerationResponse, unknown> {
    const trials = await searchService.getTrialsByIds(request.trialIds);
    
    // Simulate AI processing stages
    const stages = [
      { status: 'Analyzing clinical trials...', duration: 800 },
      { status: 'Processing research question...', duration: 600 },
      { status: 'Generating content structure...', duration: 700 },
      { status: 'Writing document sections...', duration: 1000 },
      { status: 'Formatting citations...', duration: 500 },
      { status: 'Finalizing document...', duration: 400 }
    ];

    let totalProgress = 0;
    const progressIncrement = 15; // 15% for initial processing

    // Initial processing stages
    for (const stage of stages) {
      onProgress?.(totalProgress, stage.status);
      await this.delay(stage.duration);
      totalProgress += progressIncrement / stages.length;
    }

    // Generate full content
    const fullContent = await this.generateContent(trials, request);
    const citations = this.generateCitations(trials, request.citationStyle);
    
    // Stream content in realistic chunks (words/phrases)
    const words = fullContent.split(' ');
    const chunkSizes = [3, 5, 4, 6, 2, 7, 4, 3, 5]; // Varying chunk sizes for realistic streaming
    let wordIndex = 0;
    let chunkIndex = 0;
    let streamedContent = '';

    onProgress?.(15, 'Streaming generated content...');

    while (wordIndex < words.length) {
      const chunkSize = chunkSizes[chunkIndex % chunkSizes.length];
      const chunk = words.slice(wordIndex, wordIndex + chunkSize).join(' ');
      
      if (chunk) {
        streamedContent += (wordIndex === 0 ? '' : ' ') + chunk;
        const progress = 15 + ((wordIndex / words.length) * 85); // 15% base + 85% for streaming
        
        yield {
          chunk: chunk + (wordIndex + chunkSize < words.length ? ' ' : ''),
          progress: Math.min(progress, 100),
          status: progress < 100 ? 'Generating content...' : 'Generation complete'
        };

        // Realistic streaming delay with some variation
        const baseDelay = 80;
        const variation = Math.random() * 60; // 0-60ms variation
        await this.delay(baseDelay + variation);
      }

      wordIndex += chunkSize;
      chunkIndex++;
    }

    onProgress?.(100, 'Document generation complete');

    return {
      documentId: this.generateDocumentId(),
      content: streamedContent,
      citations,
      metadata: {
        generatedAt: new Date(),
        wordCount: this.countWords(streamedContent),
        processingTime: Date.now() - Date.now() // Will be calculated properly in real implementation
      }
    };
  }

  /**
   * Get available document templates
   */
  getDocumentTemplates() {
    return [
      {
        type: 'literature_review',
        name: 'Literature Review Summary',
        description: 'Comprehensive review of selected clinical trials with analysis and conclusions'
      },
      {
        type: 'trial_comparison',
        name: 'Trial Comparison Report',
        description: 'Side-by-side comparison of multiple trials with key differences highlighted'
      },
      {
        type: 'patient_eligibility',
        name: 'Patient Eligibility Assessment',
        description: 'Analysis of patient eligibility criteria across selected trials'
      },
      {
        type: 'research_proposal',
        name: 'Research Proposal Draft',
        description: 'Foundation for research proposal based on current trial landscape'
      }
    ];
  }

  /**
   * Export document in different formats
   */
  async exportDocument(
    content: string, 
    citations: Citation[], 
    format: 'docx' | 'pdf' | 'txt',
    filename?: string
  ): Promise<{ blob: Blob; filename: string }> {
    await this.delay(1500); // Simulate processing time
    
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = filename || `clinical-trials-document-${timestamp}`;
    
    let exportContent: string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'txt':
        exportContent = this.formatAsPlainText(content, citations);
        mimeType = 'text/plain';
        fileExtension = 'txt';
        break;
        
      case 'docx':
        exportContent = this.formatAsDocx(content, citations);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExtension = 'docx';
        break;
        
      case 'pdf':
        exportContent = this.formatAsPdf(content, citations);
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const blob = new Blob([exportContent], { type: mimeType });
    
    return {
      blob,
      filename: `${defaultFilename}.${fileExtension}`
    };
  }

  /**
   * Download exported document
   */
  downloadDocument(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Private helper methods

  private async generateContent(trials: ClinicalTrial[], request: DocumentGenerationRequest): Promise<string> {
    switch (request.templateType) {
      case 'literature_review':
        return this.generateLiteratureReview(trials, request.researchQuestion);
      case 'trial_comparison':
        return this.generateTrialComparison(trials, request.researchQuestion);
      case 'patient_eligibility':
        return this.generateEligibilityAssessment(trials, request.researchQuestion);
      case 'research_proposal':
        return this.generateResearchProposal(trials, request.researchQuestion);
      default:
        return this.generateLiteratureReview(trials, request.researchQuestion);
    }
  }

  private generateLiteratureReview(trials: ClinicalTrial[], researchQuestion: string): string {
    const conditions = [...new Set(trials.map(t => t.condition))];
    const phases = [...new Set(trials.map(t => t.phase))];
    
    return `# Literature Review: ${researchQuestion}

## Executive Summary

This literature review examines ${trials.length} clinical trials investigating ${conditions.join(', ')} across ${phases.join(', ')} phases of clinical development. The analysis provides insights into current research trends, therapeutic approaches, and potential gaps in the Indian clinical research landscape.

## Background and Rationale

${researchQuestion} represents a critical area of medical research with significant implications for patient care in India. The selected trials span multiple institutions and represent diverse approaches to addressing this clinical question.

## Methodology

A comprehensive search of the Clinical Trials Registry of India (CTRI) identified ${trials.length} relevant studies meeting the inclusion criteria. Trials were analyzed for study design, patient populations, interventions, and primary outcomes.

## Key Findings

### Study Characteristics
- **Total Trials Analyzed**: ${trials.length}
- **Primary Conditions**: ${conditions.join(', ')}
- **Study Phases**: ${phases.map(p => `Phase ${p}`).join(', ')}
- **Geographic Distribution**: ${[...new Set(trials.flatMap(t => t.locations.map(l => l.state)))].join(', ')}

### Intervention Approaches
${trials.map((trial, index) => `
**${index + 1}. ${trial.title}** (${trial.ctriNumber})
- *Intervention*: ${trial.intervention}
- *Phase*: ${trial.phase}
- *Status*: ${trial.recruitmentStatus.replace('_', ' ')}
- *Primary Sponsor*: ${trial.primarySponsor}
`).join('')}

### Patient Population Analysis
The trials collectively target diverse patient populations with varying inclusion and exclusion criteria. Common inclusion criteria include:
${trials.flatMap(t => t.inclusionCriteria.slice(0, 2)).slice(0, 5).map(criteria => `- ${criteria}`).join('\n')}

### Geographic and Institutional Distribution
The studies are conducted across major medical institutions in India, with significant representation from:
${[...new Set(trials.flatMap(t => t.locations.map(l => `${l.city}, ${l.state}`)))].slice(0, 5).map(location => `- ${location}`).join('\n')}

## Clinical Implications

The reviewed trials demonstrate significant progress in addressing ${researchQuestion}. Key clinical implications include:

1. **Therapeutic Innovation**: The diversity of interventions suggests active research into novel therapeutic approaches.

2. **Patient Access**: Geographic distribution of trials indicates efforts to improve patient access to experimental treatments across India.

3. **Regulatory Compliance**: All trials are registered with CTRI, demonstrating adherence to regulatory requirements and transparency standards.

## Research Gaps and Future Directions

Based on this analysis, several research gaps and opportunities for future investigation emerge:

1. **Population Diversity**: Continued efforts to ensure representative patient populations across different demographic groups.

2. **Long-term Outcomes**: Need for extended follow-up studies to assess long-term safety and efficacy.

3. **Health Economics**: Integration of cost-effectiveness analyses to support healthcare policy decisions.

## Conclusions

The current landscape of clinical trials addressing ${researchQuestion} demonstrates robust research activity with promising therapeutic approaches. The diversity of interventions and institutional involvement suggests a maturing research ecosystem capable of addressing complex clinical questions.

## Recommendations

1. **Collaborative Networks**: Establish multi-institutional collaborative networks to enhance patient recruitment and data sharing.

2. **Regulatory Harmonization**: Continue efforts to align with international regulatory standards while maintaining focus on Indian patient populations.

3. **Technology Integration**: Leverage digital health technologies to improve trial efficiency and patient engagement.

## Limitations

This review is limited to trials registered in the CTRI database and may not capture all relevant research activities. Additionally, the analysis is based on publicly available trial information and does not include detailed results or interim analyses.

---

*This document was generated using AI-powered analysis of clinical trial data. All information should be verified against original sources and current medical literature. This analysis is for research purposes only and should not be used for clinical decision-making without appropriate medical supervision.*`;
  }

  private generateTrialComparison(trials: ClinicalTrial[], researchQuestion: string): string {
    return `# Clinical Trial Comparison Report: ${researchQuestion}

## Overview

This report provides a comprehensive comparison of ${trials.length} clinical trials related to ${researchQuestion}. The analysis highlights key similarities and differences across study designs, patient populations, and intervention approaches.

## Comparative Analysis

### Study Design Comparison

| Trial | Phase | Study Type | Status | Duration |
|-------|-------|------------|--------|----------|
${trials.map(trial => {
  const duration = trial.completionDate ? 
    Math.round((trial.completionDate.getTime() - trial.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 'Ongoing';
  return `| ${trial.ctriNumber} | ${trial.phase} | ${trial.studyType} | ${trial.recruitmentStatus.replace('_', ' ')} | ${duration} months |`;
}).join('\n')}

### Intervention Comparison

${trials.map((trial, index) => `
#### Trial ${index + 1}: ${trial.ctriNumber}
**Title**: ${trial.title}
**Intervention**: ${trial.intervention}
**Primary Sponsor**: ${trial.primarySponsor}
**Key Inclusion Criteria**:
${trial.inclusionCriteria.slice(0, 3).map(criteria => `- ${criteria}`).join('\n')}
`).join('')}

### Geographic Distribution

${trials.map(trial => `
**${trial.ctriNumber}**: ${trial.locations.map(loc => `${loc.city}, ${loc.state}`).join('; ')}
`).join('')}

### Key Differences and Similarities

#### Similarities:
- All trials focus on ${[...new Set(trials.map(t => t.condition))].join(' and ')}
- Common regulatory compliance with CTRI registration
- Similar ethical oversight and informed consent processes

#### Key Differences:
- **Phase Distribution**: ${[...new Set(trials.map(t => t.phase))].map(p => `Phase ${p}`).join(', ')}
- **Intervention Approaches**: Diverse therapeutic strategies ranging from pharmaceutical interventions to digital health solutions
- **Patient Populations**: Varying inclusion/exclusion criteria targeting different patient subgroups

## Recommendations for Trial Selection

Based on this comparative analysis, the following recommendations are provided:

1. **For Patients**: Consider geographic accessibility, inclusion criteria alignment, and intervention type preferences
2. **For Researchers**: Identify potential collaboration opportunities and complementary study designs
3. **For Clinicians**: Understand the breadth of available treatment options and research opportunities

## Conclusion

The compared trials represent a comprehensive approach to addressing ${researchQuestion} with diverse methodologies and patient populations. This diversity strengthens the overall evidence base and provides multiple pathways for patient participation in clinical research.

---

*This comparison is based on publicly available trial information and should be supplemented with detailed protocol reviews for comprehensive evaluation.*`;
  }

  private generateEligibilityAssessment(trials: ClinicalTrial[], researchQuestion: string): string {
    const allInclusion = trials.flatMap(t => t.inclusionCriteria);
    const allExclusion = trials.flatMap(t => t.exclusionCriteria);
    
    return `# Patient Eligibility Assessment: ${researchQuestion}

## Overview

This assessment analyzes patient eligibility criteria across ${trials.length} clinical trials to identify common requirements and potential barriers to participation.

## Eligibility Criteria Analysis

### Common Inclusion Criteria

The following inclusion criteria appear frequently across the analyzed trials:

${this.getCommonCriteria(allInclusion).map(criteria => `- ${criteria}`).join('\n')}

### Common Exclusion Criteria

Frequently cited exclusion criteria include:

${this.getCommonCriteria(allExclusion).map(criteria => `- ${criteria}`).join('\n')}

### Trial-Specific Requirements

${trials.map((trial, index) => `
#### Trial ${index + 1}: ${trial.ctriNumber}
**Condition**: ${trial.condition}
**Phase**: ${trial.phase}

**Inclusion Criteria**:
${trial.inclusionCriteria.map(criteria => `- ${criteria}`).join('\n')}

**Exclusion Criteria**:
${trial.exclusionCriteria.map(criteria => `- ${criteria}`).join('\n')}
`).join('')}

## Eligibility Assessment Framework

### Age Requirements
- **Pediatric Trials**: ${trials.filter(t => t.inclusionCriteria.some(c => c.includes('6-18') || c.includes('children'))).length} trials
- **Adult Trials**: ${trials.filter(t => t.inclusionCriteria.some(c => c.includes('18-') || c.includes('adult'))).length} trials
- **Elderly Inclusion**: ${trials.filter(t => t.inclusionCriteria.some(c => c.includes('75') || c.includes('elderly'))).length} trials

### Disease-Specific Requirements
${[...new Set(trials.map(t => t.condition))].map(condition => `
**${condition}**: ${trials.filter(t => t.condition === condition).length} trial(s)
`).join('')}

### Geographic Accessibility
Trials are available in the following locations:
${[...new Set(trials.flatMap(t => t.locations.map(l => `${l.city}, ${l.state}`)))].map(location => `- ${location}`).join('\n')}

## Patient Matching Recommendations

### High Eligibility Scenarios
Patients with the following characteristics may have multiple trial options:
- Adults aged 18-65 years
- Diagnosed condition with adequate disease duration
- Stable on current medications
- Adequate organ function
- Willing to provide informed consent

### Potential Barriers
Common barriers to trial participation include:
- Severe comorbidities
- Recent participation in other trials
- Pregnancy or breastfeeding
- Geographic limitations
- Language barriers

## Clinical Decision Support

### For Healthcare Providers
1. **Screening Checklist**: Use common criteria to pre-screen potential participants
2. **Referral Pathways**: Establish connections with trial sites for patient referrals
3. **Patient Education**: Provide comprehensive information about trial participation

### For Patients
1. **Self-Assessment**: Review basic eligibility criteria before consultation
2. **Questions to Ask**: Prepare specific questions about trial procedures and expectations
3. **Support Resources**: Identify available support for trial participation

## Conclusion

The eligibility landscape for ${researchQuestion} trials offers diverse opportunities for patient participation while maintaining appropriate safety standards. Understanding these criteria helps optimize patient-trial matching and improves access to innovative treatments.

---

*This assessment is for informational purposes only. Final eligibility determination must be made by qualified clinical trial personnel through comprehensive screening procedures.*`;
  }

  private generateResearchProposal(trials: ClinicalTrial[], researchQuestion: string): string {
    return `# Research Proposal Draft: ${researchQuestion}

## Title
Investigating ${researchQuestion}: A Comprehensive Analysis Based on Current Clinical Trial Landscape

## Background and Rationale

### Current Research Landscape
The analysis of ${trials.length} ongoing and completed clinical trials in India reveals significant research activity addressing ${researchQuestion}. These studies span ${[...new Set(trials.map(t => t.phase))].map(p => `Phase ${p}`).join(', ')} of clinical development and involve major medical institutions across the country.

### Research Gap Identification
Based on the current trial portfolio, several research gaps have been identified:

1. **Methodological Gaps**: Limited representation of certain study designs or patient populations
2. **Geographic Gaps**: Underrepresentation of certain regions or healthcare settings
3. **Intervention Gaps**: Potential for novel therapeutic approaches not currently under investigation

### Significance
${researchQuestion} represents a critical area of medical research with significant implications for:
- Patient outcomes and quality of life
- Healthcare system efficiency
- Economic burden of disease
- Public health policy

## Research Objectives

### Primary Objective
To investigate [specific research question] through [proposed methodology] in the Indian healthcare context.

### Secondary Objectives
1. Evaluate the effectiveness of [intervention] compared to standard care
2. Assess safety and tolerability in the target population
3. Identify predictors of treatment response
4. Analyze cost-effectiveness and healthcare resource utilization

## Methodology

### Study Design
Based on the analysis of existing trials, a [randomized controlled trial/observational study/systematic review] design is proposed to address the identified research gaps.

### Study Population
**Inclusion Criteria** (refined based on current trial analysis):
${this.getCommonCriteria(trials.flatMap(t => t.inclusionCriteria)).slice(0, 5).map(criteria => `- ${criteria}`).join('\n')}

**Exclusion Criteria**:
${this.getCommonCriteria(trials.flatMap(t => t.exclusionCriteria)).slice(0, 5).map(criteria => `- ${criteria}`).join('\n')}

### Sample Size Calculation
Based on similar trials in the analyzed dataset, an estimated sample size of [X] participants would provide adequate power to detect clinically meaningful differences.

### Study Procedures
1. **Screening and Enrollment**: Following established protocols from successful trials
2. **Intervention Delivery**: Incorporating best practices from current research
3. **Follow-up Assessments**: Standardized outcome measures aligned with regulatory requirements
4. **Data Management**: Robust systems ensuring data quality and regulatory compliance

## Expected Outcomes

### Primary Endpoints
- [Specific measurable outcome based on research question]
- Timeline for assessment: [X] weeks/months

### Secondary Endpoints
- Safety and tolerability measures
- Quality of life assessments
- Healthcare resource utilization
- Patient-reported outcomes

## Institutional Framework

### Proposed Study Sites
Based on the geographic distribution of current trials:
${[...new Set(trials.flatMap(t => t.locations.map(l => `${l.city}, ${l.state}`)))].slice(0, 5).map(location => `- ${location}`).join('\n')}

### Regulatory Considerations
- CTRI registration and regulatory approvals
- Ethics committee approvals at all participating sites
- Good Clinical Practice (GCP) compliance
- Data protection and privacy regulations

## Budget and Timeline

### Estimated Timeline
- Protocol development and regulatory approvals: 6 months
- Patient recruitment and enrollment: 12 months
- Study conduct and follow-up: 18 months
- Data analysis and reporting: 6 months
- **Total Duration**: 42 months

### Budget Considerations
Based on similar trials in the analyzed dataset:
- Personnel costs
- Site management and monitoring
- Laboratory and diagnostic procedures
- Data management and statistical analysis
- Regulatory and administrative costs

## Impact and Dissemination

### Expected Impact
This research will contribute to:
- Evidence-based clinical practice guidelines
- Improved patient outcomes
- Healthcare policy development
- International research collaboration

### Dissemination Plan
- Peer-reviewed publications in high-impact journals
- Presentations at national and international conferences
- Policy briefs for healthcare stakeholders
- Patient and public engagement activities

## Risk Assessment and Mitigation

### Potential Risks
1. **Recruitment Challenges**: Mitigation through multi-site approach and community engagement
2. **Regulatory Delays**: Early engagement with regulatory authorities
3. **Data Quality Issues**: Robust monitoring and quality assurance procedures

## Conclusion

This research proposal builds upon the strong foundation of current clinical trial activity in India while addressing identified gaps in the research landscape. The proposed study has the potential to significantly advance our understanding of ${researchQuestion} and improve patient care.

## Next Steps

1. Detailed protocol development
2. Stakeholder engagement and collaboration agreements
3. Funding applications and budget finalization
4. Regulatory submission preparation
5. Site selection and feasibility assessments

---

*This proposal draft is based on analysis of current clinical trial data and should be refined through detailed literature review, stakeholder consultation, and regulatory guidance.*`;
  }

  private getCommonCriteria(criteria: string[]): string[] {
    const criteriaCount = new Map<string, number>();
    
    criteria.forEach(criterion => {
      const normalized = criterion.toLowerCase().trim();
      criteriaCount.set(normalized, (criteriaCount.get(normalized) || 0) + 1);
    });

    return Array.from(criteriaCount.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([criterion, _]) => criterion.charAt(0).toUpperCase() + criterion.slice(1));
  }

  private generateCitations(trials: ClinicalTrial[], style: string): Citation[] {
    return trials.map((trial, index) => ({
      id: `citation-${index + 1}`,
      text: this.formatCitation(trial, style),
      url: `https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=${trial.ctriNumber}`,
      type: 'trial' as const
    }));
  }

  private formatCitation(trial: ClinicalTrial, style: string): string {
    const year = trial.startDate.getFullYear();
    
    switch (style) {
      case 'ama':
        return `${trial.principalInvestigator}. ${trial.title}. Clinical Trials Registry - India. ${trial.ctriNumber}. Registered ${trial.startDate.toLocaleDateString()}. ${trial.primarySponsor}; ${year}.`;
      
      case 'apa':
        return `${trial.principalInvestigator} (${year}). ${trial.title}. Clinical Trials Registry - India, ${trial.ctriNumber}. ${trial.primarySponsor}.`;
      
      case 'vancouver':
        return `${trial.principalInvestigator}. ${trial.title}. Clinical Trials Registry - India; ${trial.ctriNumber}. ${year}.`;
      
      default:
        return `${trial.principalInvestigator}. ${trial.title}. ${trial.ctriNumber}. ${trial.primarySponsor}; ${year}.`;
    }
  }

  private generateDocumentId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private formatAsPlainText(content: string, citations: Citation[]): string {
    let formattedContent = content;
    
    // Add citations section
    if (citations.length > 0) {
      formattedContent += '\n\n' + '='.repeat(50) + '\n';
      formattedContent += 'REFERENCES\n';
      formattedContent += '='.repeat(50) + '\n\n';
      
      citations.forEach((citation, index) => {
        formattedContent += `${index + 1}. ${citation.text}\n`;
        if (citation.url) {
          formattedContent += `   Available at: ${citation.url}\n`;
        }
        formattedContent += '\n';
      });
    }

    // Add metadata footer
    formattedContent += '\n' + '-'.repeat(50) + '\n';
    formattedContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    formattedContent += 'Clinical Trials Intelligence Platform\n';
    formattedContent += 'This document was generated using AI-powered analysis.\n';
    
    return formattedContent;
  }

  private formatAsDocx(content: string, citations: Citation[]): string {
    // Mock DOCX format - in real implementation, would use a library like docx
    let docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
      </w:r>
    </w:p>`;

    if (citations.length > 0) {
      docxContent += `
    <w:p>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>References</w:t>
      </w:r>
    </w:p>`;
      
      citations.forEach((citation, index) => {
        docxContent += `
    <w:p>
      <w:r>
        <w:t>${index + 1}. ${citation.text}</w:t>
      </w:r>
    </w:p>`;
      });
    }

    docxContent += `
  </w:body>
</w:document>`;

    return docxContent;
  }

  private formatAsPdf(content: string, citations: Citation[]): string {
    // Mock PDF format - in real implementation, would use a library like jsPDF
    let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${content.length + (citations.length * 100)}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${content.replace(/\n/g, ') Tj T* (')}) Tj
`;

    if (citations.length > 0) {
      pdfContent += `
T*
T*
/F1 14 Tf
(References) Tj
T*
/F1 12 Tf
`;
      citations.forEach((citation, index) => {
        pdfContent += `(${index + 1}. ${citation.text}) Tj T* `;
      });
    }

    pdfContent += `
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000189 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${content.length + 500}
%%EOF`;

    return pdfContent;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const documentService = new DocumentService();