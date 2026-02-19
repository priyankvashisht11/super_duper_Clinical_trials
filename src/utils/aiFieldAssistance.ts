/**
 * AI Field Assistance Utility
 * Provides intelligent, context-aware field guidance and suggestions
 * for clinical trial protocol fields across all 14 sections
 */

export interface FieldGuidance {
  fieldName: string;
  purpose: string;
  whatToFill: string;
  examples: string[];
  regulatoryNotes?: string;
  commonMistakes?: string[];
}

export interface AIPromptConfig {
  systemContext: string;
  userPrompt: string;
  expectedFormat: string;
  maxLength?: number;
}

/**
 * Field guidance database - explains what each field is for
 */
export const FIELD_GUIDANCE: Record<string, FieldGuidance> = {
  // Metadata Section
  indication: {
    fieldName: 'Indication',
    purpose: 'Specifies the target disease, condition, or medical situation being studied',
    whatToFill: 'Enter the specific medical condition or disease. Be precise and use standard medical terminology. For Phase I trials with healthy volunteers, specify "Healthy Volunteers" with the therapeutic area.',
    examples: [
      'Healthy Volunteers (Drug Development)',
      'Type 2 Diabetes Mellitus',
      'Non-Small Cell Lung Cancer (NSCLC)',
      'Moderate to Severe Rheumatoid Arthritis',
      'Acute Ischemic Stroke',
      'Treatment-Resistant Depression',
      'Chronic Obstructive Pulmonary Disease (COPD)',
      'Metastatic Breast Cancer',
      'Parkinson\'s Disease',
      'Alzheimer\'s Disease',
      'Hypertension',
      'Chronic Kidney Disease',
      'Multiple Sclerosis',
      'Crohn\'s Disease',
      'Psoriasis',
      'Atrial Fibrillation',
      'Heart Failure with Reduced Ejection Fraction',
      'Hepatitis C Virus Infection',
      'HIV-1 Infection',
      'Acute Myeloid Leukemia (AML)'
    ],
    regulatoryNotes: 'Must align with ICD-10 or MedDRA terminology. Phase I studies typically use healthy volunteers unless testing in patient population is required for safety.',
    commonMistakes: [
      'Being too vague (e.g., "Diabetes" instead of "Type 2 Diabetes Mellitus")',
      'Including study design elements (this is just the condition)',
      'Mixing multiple indications without proper formatting',
      'Using non-standard terminology'
    ]
  },
  
  fullTitle: {
    fieldName: 'Full Protocol Title',
    purpose: 'Complete, formal title that describes the entire study in one sentence',
    whatToFill: 'Create a comprehensive title following ICH M11 format: Phase + Design + Intervention + Indication + Population. Should be descriptive enough that readers understand the study without reading further.',
    examples: [
      'A Phase III, Randomized, Double-Blind, Placebo-Controlled Study to Evaluate the Efficacy and Safety of XYZ-123 in Adults with Type 2 Diabetes Mellitus',
      'A Phase I, Open-Label, Dose-Escalation Study to Assess the Safety, Tolerability, and Pharmacokinetics of ABC-456 in Healthy Adult Volunteers',
      'A Phase II, Multicenter, Randomized Study to Evaluate the Efficacy of DEF-789 Compared to Standard of Care in Patients with Moderate to Severe Rheumatoid Arthritis'
    ],
    regulatoryNotes: 'ICH M11 requires titles to include: phase, design, intervention, indication, and population. Keep under 250 characters when possible.',
    commonMistakes: [
      'Too short or vague',
      'Missing key elements (phase, design, population)',
      'Using abbreviations without defining them',
      'Inconsistent with other protocol sections'
    ]
  },

  trialPhase: {
    fieldName: 'Trial Phase',
    purpose: 'Indicates the stage of clinical development',
    whatToFill: 'Select the appropriate phase based on study objectives. Phase I = first-in-human safety; Phase II = efficacy signal in patients; Phase III = confirmatory efficacy; Phase IV = post-marketing.',
    examples: [
      'Phase I - First-in-Human, Safety & Dosing',
      'Phase II - Efficacy & Safety in Target Population',
      'Phase III - Confirmatory Efficacy & Safety',
      'Phase I/II - Combined Early Phase'
    ],
    regulatoryNotes: 'Phase designation must match study objectives and regulatory submissions. Phase I typically uses healthy volunteers unless safety requires patient population.',
    commonMistakes: [
      'Selecting Phase II/III when objectives are clearly Phase I',
      'Misunderstanding phase definitions',
      'Not aligning phase with study design and endpoints'
    ]
  },

  studyType: {
    fieldName: 'Study Type',
    purpose: 'Classifies whether the study involves an intervention or is observational',
    whatToFill: 'Select "Interventional" if you are testing a drug, device, or procedure. Select "Observational" if you are only observing without assigning interventions.',
    examples: [
      'Interventional - Testing a new diabetes medication',
      'Observational - Following patients on standard care',
      'Expanded Access - Compassionate use program'
    ],
    regulatoryNotes: 'Most clinical trials are interventional. Observational studies have different regulatory requirements.',
    commonMistakes: [
      'Confusing observational with non-randomized interventional studies',
      'Not understanding the regulatory implications of each type'
    ]
  }
};

/**
 * Generate context-aware AI prompts for field assistance
 */
export function generateFieldAssistancePrompt(
  fieldName: string,
  currentValue: string,
  protocolContext: any
): AIPromptConfig {
  const guidance = FIELD_GUIDANCE[fieldName];
  
  if (!guidance) {
    // Fallback for fields without specific guidance
    return {
      systemContext: 'You are a clinical research expert helping with protocol completion.',
      userPrompt: `Suggest appropriate content for the "${fieldName}" field. Current value: "${currentValue}"`,
      expectedFormat: 'Provide a clear, concise suggestion.',
      maxLength: 200
    };
  }

  // Build context-aware prompt based on field type
  switch (fieldName) {
    case 'indication':
      return generateIndicationPrompt(currentValue, protocolContext, guidance);
    
    case 'fullTitle':
      return generateTitlePrompt(currentValue, protocolContext, guidance);
    
    default:
      return generateGenericPrompt(fieldName, currentValue, protocolContext, guidance);
  }
}

/**
 * Generate indication-specific prompt
 */
function generateIndicationPrompt(
  currentValue: string,
  context: any,
  guidance: FieldGuidance
): AIPromptConfig {
  const phase = context.trialPhase || '';
  const studyType = context.studyType || '';
  
  // Determine if this is Phase I with healthy volunteers
  const isPhaseI = phase.includes('Phase I') || phase.includes('Phase 1');
  const isHealthyVolunteer = isPhaseI && !phase.includes('Phase I/II');

  const systemContext = `You are a clinical research expert specializing in protocol development and ICH M11 compliance.

FIELD PURPOSE: ${guidance.purpose}

WHAT USER NEEDS TO FILL: ${guidance.whatToFill}

REGULATORY CONTEXT:
- ${guidance.regulatoryNotes}

CURRENT PROTOCOL CONTEXT:
- Trial Phase: ${phase || 'Not specified'}
- Study Type: ${studyType || 'Not specified'}
- Is Phase I: ${isPhaseI ? 'Yes' : 'No'}
- Typical Population: ${isHealthyVolunteer ? 'Healthy Volunteers' : 'Patient Population'}

CRITICAL RULES:
1. For Phase I first-in-human studies: Usually "Healthy Volunteers" unless safety requires patients
2. For Phase II/III: Specify the exact disease/condition using standard medical terminology
3. Be specific and precise - avoid vague terms
4. Use ICD-10 or MedDRA standard terminology
5. Keep it concise - this is just the condition, not the study design
6. DO NOT use placeholder diseases like "Type 2 Diabetes" unless the user's context suggests it
7. If user has provided ANY context about the disease, use that information
8. If no context is available, suggest "Healthy Volunteers" for Phase I or ask user to specify for other phases

COMMON MISTAKES TO AVOID:
${guidance.commonMistakes?.map(m => `- ${m}`).join('\n')}`;

  const userPrompt = `Based on the protocol context:
- Trial Phase: ${phase || 'Not specified'}
- Study Type: ${studyType || 'Not specified'}  
- Current Indication: "${currentValue || 'Not specified'}"
- Full Protocol Title: "${context.fullTitle || 'Not specified'}"
- Short Title: "${context.shortTitle || 'Not specified'}"

ANALYZE THE CONTEXT CAREFULLY:
1. Look for disease/condition mentions in the title or current indication
2. Consider the trial phase to determine if healthy volunteers are appropriate
3. If specific disease is mentioned anywhere, use that
4. If no disease context exists, provide appropriate guidance

Provide ONE clear, specific indication that:
1. Matches the trial phase (Phase I = often healthy volunteers, Phase II/III = specific disease)
2. Uses standard medical terminology from ICD-10 or MedDRA
3. Is concise and precise (typically 2-6 words)
4. Follows ICH M11 guidelines
5. Reflects ANY disease/condition mentioned in the protocol context

RESPOND WITH ONLY THE INDICATION TEXT - NO EXPLANATIONS, NO BULLET POINTS, NO EXTRA TEXT.

If the context mentions a specific disease, use it. If not:
- Phase I: "Healthy Volunteers"
- Phase II/III: Suggest user specify the target condition`;

  return {
    systemContext,
    userPrompt,
    expectedFormat: 'Single line indication text only',
    maxLength: 150
  };
}

/**
 * Generate title-specific prompt
 */
function generateTitlePrompt(
  currentValue: string,
  context: any,
  guidance: FieldGuidance
): AIPromptConfig {
  const phase = context.trialPhase || '';
  const indication = context['indication'] || '';
  const studyType = context.studyType || '';
  const shortTitle = context.shortTitle || '';

  const systemContext = `You are a clinical research expert specializing in ICH M11 compliant protocol titles.

FIELD PURPOSE: ${guidance.purpose}

WHAT USER NEEDS TO FILL: ${guidance.whatToFill}

ICH M11 TITLE REQUIREMENTS:
1. Must include: Phase + Design + Intervention + Indication + Population
2. Should be comprehensive but concise (under 250 characters preferred)
3. Must use professional medical language
4. Should match the protocol's actual design
5. Must reflect the ACTUAL disease/condition being studied, not generic examples

REGULATORY NOTES:
${guidance.regulatoryNotes}

COMMON MISTAKES TO AVOID:
${guidance.commonMistakes?.map(m => `- ${m}`).join('\n')}`;

  const userPrompt = `Generate a complete ICH M11 compliant protocol title using:

PROTOCOL CONTEXT:
- Phase: ${phase || 'Not specified'}
- Indication: ${indication || 'Not specified'}
- Study Type: ${studyType || 'Not specified'}
- Short Title: ${shortTitle || 'Not specified'}
- Current Title: "${currentValue || 'Not specified'}"

CRITICAL INSTRUCTIONS:
1. If indication is specified, use it EXACTLY - do not substitute with examples
2. If indication is "Healthy Volunteers", structure title for Phase I safety study
3. If indication is a specific disease, structure title for efficacy/safety study
4. Use [Drug Name] or [Intervention] as placeholder for the actual drug/intervention
5. Match the study design to the phase:
   - Phase I: "Open-Label, Dose-Escalation" or "First-in-Human"
   - Phase II: "Randomized, Controlled" or "Open-Label"
   - Phase III: "Randomized, Double-Blind, Placebo-Controlled"
6. DO NOT invent or assume diseases - use what's provided in context

REQUIRED ELEMENTS TO INCLUDE:
1. Phase designation (e.g., "A Phase III")
2. Study design appropriate for the phase
3. Study objective (e.g., "to Evaluate the Efficacy and Safety" or "to Assess Safety and Tolerability")
4. Intervention placeholder (e.g., "of [Drug Name]")
5. Target population based on indication provided

RESPOND WITH ONLY THE COMPLETE TITLE - NO EXPLANATIONS, NO NOTES, NO EXTRA TEXT.

Format: "A [Phase], [Design] Study to [Objective] of [Intervention] in [Population with Indication]"`;

  return {
    systemContext,
    userPrompt,
    expectedFormat: 'Complete protocol title in one sentence',
    maxLength: 300
  };
}

/**
 * Generate generic field prompt
 */
function generateGenericPrompt(
  fieldName: string,
  currentValue: string,
  context: any,
  guidance: FieldGuidance
): AIPromptConfig {
  const systemContext = `You are a clinical research expert helping with protocol field completion.

FIELD: ${guidance.fieldName}
PURPOSE: ${guidance.purpose}
WHAT TO FILL: ${guidance.whatToFill}

${guidance.regulatoryNotes ? `REGULATORY NOTES: ${guidance.regulatoryNotes}` : ''}

Provide clear, specific, actionable suggestions that follow ICH M11 guidelines.`;

  const userPrompt = `Suggest appropriate content for "${fieldName}":
- Current value: "${currentValue || 'Not specified'}"
- Protocol context: ${JSON.stringify(context, null, 2)}

Provide a clear, specific suggestion following best practices.

Examples of good values:
${guidance.examples.map(ex => `- ${ex}`).join('\n')}`;

  return {
    systemContext,
    userPrompt,
    expectedFormat: 'Clear, specific suggestion',
    maxLength: 200
  };
}

/**
 * Get field guidance for display in UI
 */
export function getFieldGuidance(fieldName: string): FieldGuidance | null {
  return FIELD_GUIDANCE[fieldName] || null;
}

/**
 * Validate if a field value makes sense given the context
 */
export function validateFieldContext(
  fieldName: string,
  value: string,
  context: any
): { valid: boolean; warning?: string } {
  if (fieldName === 'indication') {
    const phase = context.trialPhase || '';
    const isPhaseI = phase.includes('Phase I') && !phase.includes('Phase I/II');
    
    // Check if Phase I but indication is not about healthy volunteers
    if (isPhaseI && value && !value.toLowerCase().includes('healthy') && !value.toLowerCase().includes('volunteer')) {
      return {
        valid: true,
        warning: 'Phase I studies typically use healthy volunteers unless safety requires patient population. Consider if this is appropriate.'
      };
    }
    
    // Check if Phase II/III but indication mentions healthy volunteers
    if ((phase.includes('Phase II') || phase.includes('Phase III')) && value.toLowerCase().includes('healthy')) {
      return {
        valid: true,
        warning: 'Phase II/III studies typically test in patient populations, not healthy volunteers. Please verify this is correct.'
      };
    }
  }
  
  return { valid: true };
}
