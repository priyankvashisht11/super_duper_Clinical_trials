import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding controlled terminologies...');

  // Trial Phases
  const trialPhases = [
    { domain: 'trial_phase', code: 'C15600', displayName: 'Phase 1', definition: 'Initial safety and dosage studies' },
    { domain: 'trial_phase', code: 'C15601', displayName: 'Phase 2', definition: 'Efficacy and side effects studies' },
    { domain: 'trial_phase', code: 'C15602', displayName: 'Phase 3', definition: 'Large-scale efficacy and monitoring' },
    { domain: 'trial_phase', code: 'C15603', displayName: 'Phase 4', definition: 'Post-marketing surveillance' },
    { domain: 'trial_phase', code: 'C49686', displayName: 'Phase 1/Phase 2', definition: 'Combined Phase 1 and 2' },
    { domain: 'trial_phase', code: 'C15604', displayName: 'Phase 2/Phase 3', definition: 'Combined Phase 2 and 3' }
  ];

  // Amendment Scope
  const amendmentScopes = [
    { domain: 'amendment_scope', code: 'GLOBAL', displayName: 'Global Amendment', definition: 'Applies to all sites worldwide' },
    { domain: 'amendment_scope', code: 'REGIONAL', displayName: 'Regional Amendment', definition: 'Applies to specific region' },
    { domain: 'amendment_scope', code: 'NATIONAL', displayName: 'National Amendment', definition: 'Applies to specific country' },
    { domain: 'amendment_scope', code: 'SITE_SPECIFIC', displayName: 'Site-Specific Amendment', definition: 'Applies to individual site' }
  ];

  // Study Types
  const studyTypes = [
    { domain: 'study_type', code: 'INTERVENTIONAL', displayName: 'Interventional', definition: 'Participants receive intervention' },
    { domain: 'study_type', code: 'OBSERVATIONAL', displayName: 'Observational', definition: 'No intervention, only observation' }
  ];

  // Blinding Schema
  const blindingSchemas = [
    { domain: 'blinding_schema', code: 'C132956', displayName: 'Open Label', definition: 'All parties know treatment assignment' },
    { domain: 'blinding_schema', code: 'C132957', displayName: 'Single Blind', definition: 'Participant blinded' },
    { domain: 'blinding_schema', code: 'C132958', displayName: 'Double Blind', definition: 'Participant and investigator blinded' },
    { domain: 'blinding_schema', code: 'C132959', displayName: 'Triple Blind', definition: 'Participant, investigator, and assessor blinded' }
  ];

  // Design Types
  const designTypes = [
    { domain: 'design_type', code: 'C82639', displayName: 'Parallel Group', definition: 'Groups receive different interventions' },
    { domain: 'design_type', code: 'C15694', displayName: 'Crossover', definition: 'Participants receive multiple interventions sequentially' },
    { domain: 'design_type', code: 'C15696', displayName: 'Factorial', definition: 'Multiple interventions tested simultaneously' },
    { domain: 'design_type', code: 'C93632', displayName: 'Adaptive', definition: 'Design modifications based on interim results' },
    { domain: 'design_type', code: 'C98772', displayName: 'Sequential', definition: 'Analysis after each participant or group' }
  ];

  // Routes of Administration
  const routes = [
    { domain: 'route', code: 'C38288', displayName: 'Oral', definition: 'Administered by mouth' },
    { domain: 'route', code: 'C38276', displayName: 'Intravenous', definition: 'Administered into vein' },
    { domain: 'route', code: 'C38279', displayName: 'Intramuscular', definition: 'Administered into muscle' },
    { domain: 'route', code: 'C38299', displayName: 'Subcutaneous', definition: 'Administered under skin' },
    { domain: 'route', code: 'C38284', displayName: 'Topical', definition: 'Applied to body surface' },
    { domain: 'route', code: 'C38216', displayName: 'Inhalation', definition: 'Breathed into lungs' },
    { domain: 'route', code: 'C38287', displayName: 'Nasal', definition: 'Administered through nose' },
    { domain: 'route', code: 'C38285', displayName: 'Transdermal', definition: 'Absorbed through skin' }
  ];

  // Intervention Types
  const interventionTypes = [
    { domain: 'intervention_type', code: 'IP', displayName: 'Investigational Product', definition: 'Test drug/device' },
    { domain: 'intervention_type', code: 'COMPARATOR', displayName: 'Comparator', definition: 'Active comparator/reference' },
    { domain: 'intervention_type', code: 'PLACEBO', displayName: 'Placebo', definition: 'Inactive substance' },
    { domain: 'intervention_type', code: 'BACKGROUND', displayName: 'Background Therapy', definition: 'Standard care' },
    { domain: 'intervention_type', code: 'RESCUE', displayName: 'Rescue Therapy', definition: 'For inadequate response' }
  ];

  // Objective Types
  const objectiveTypes = [
    { domain: 'objective_type', code: 'PRIMARY', displayName: 'Primary', definition: 'Main trial objective' },
    { domain: 'objective_type', code: 'SECONDARY', displayName: 'Secondary', definition: 'Additional objectives' },
    { domain: 'objective_type', code: 'EXPLORATORY', displayName: 'Exploratory', definition: 'Hypothesis-generating' }
  ];

  // Intercurrent Event Strategies
  const ieStrategies = [
    { domain: 'ie_strategy', code: 'TREATMENT_POLICY', displayName: 'Treatment Policy', definition: 'Regardless of intercurrent events' },
    { domain: 'ie_strategy', code: 'COMPOSITE', displayName: 'Composite', definition: 'Event included in outcome' },
    { domain: 'ie_strategy', code: 'HYPOTHETICAL', displayName: 'Hypothetical', definition: 'What would happen if event did not occur' },
    { domain: 'ie_strategy', code: 'PRINCIPAL_STRATUM', displayName: 'Principal Stratum', definition: 'Subpopulation unaffected by event' },
    { domain: 'ie_strategy', code: 'WHILE_ON_TREATMENT', displayName: 'While on Treatment', definition: 'Only data while on treatment' }
  ];

  // Protocol Status
  const protocolStatuses = [
    { domain: 'protocol_status', code: 'DRAFT', displayName: 'Draft', definition: 'Protocol being developed' },
    { domain: 'protocol_status', code: 'UNDER_REVIEW', displayName: 'Under Review', definition: 'Submitted for review' },
    { domain: 'protocol_status', code: 'APPROVED', displayName: 'Approved', definition: 'Approved by authorities' },
    { domain: 'protocol_status', code: 'ACTIVE', displayName: 'Active', definition: 'Trial is ongoing' },
    { domain: 'protocol_status', code: 'AMENDED', displayName: 'Amended', definition: 'Protocol has been amended' },
    { domain: 'protocol_status', code: 'CLOSED', displayName: 'Closed', definition: 'Trial completed or terminated' }
  ];

  // Combine all terminologies
  const allTerminologies = [
    ...trialPhases,
    ...amendmentScopes,
    ...studyTypes,
    ...blindingSchemas,
    ...designTypes,
    ...routes,
    ...interventionTypes,
    ...objectiveTypes,
    ...ieStrategies,
    ...protocolStatuses
  ];

  // Insert terminologies
  for (const term of allTerminologies) {
    await prisma.controlledTerminology.upsert({
      where: {
        domain_code: {
          domain: term.domain,
          code: term.code
        }
      },
      update: {},
      create: term
    });
  }

  console.log(`✅ Seeded ${allTerminologies.length} controlled terminologies across ${new Set(allTerminologies.map(t => t.domain)).size} domains`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
