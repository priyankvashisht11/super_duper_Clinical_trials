import prisma from './db';

async function seedValidationRules() {
  console.log('🌱 Seeding validation rules...');

  const rules = [
    // M11 Conformance Rules (21 rules)
    { ruleId: 'M11-001', ruleName: 'Required Protocol Identifiers', category: 'm11_conformance', severity: 'error', description: 'Sponsor protocol identifier and full title are required', section: '0' },
    { ruleId: 'M11-002', ruleName: 'Amendment Requirements', category: 'm11_conformance', severity: 'error', description: 'Amendment number and scope required when not original protocol', section: '0' },
    { ruleId: 'M11-003', ruleName: 'Objectives & Estimands', category: 'm11_conformance', severity: 'error', description: 'At least one primary objective required with complete estimand', section: '3' },
    { ruleId: 'M11-004', ruleName: 'Population Criteria', category: 'm11_conformance', severity: 'error', description: 'Inclusion and exclusion criteria required', section: '5' },
    { ruleId: 'M11-005', ruleName: 'Interventions', category: 'm11_conformance', severity: 'error', description: 'Investigational product with complete details required', section: '6' },
    { ruleId: 'M11-006', ruleName: 'Trial Design', category: 'm11_conformance', severity: 'error', description: 'Trial phase specification required', section: '4' },
    { ruleId: 'M11-007', ruleName: 'Randomization Details', category: 'm11_conformance', severity: 'error', description: 'Randomization method and ratio required for multi-arm trials', section: '4' },
    { ruleId: 'M11-008', ruleName: 'Blinding Requirements', category: 'm11_conformance', severity: 'warning', description: 'Blinding measures and unblinding procedures for blinded trials', section: '6.7' },
    { ruleId: 'M11-009', ruleName: 'Assessments Schedule', category: 'm11_conformance', severity: 'warning', description: 'Schedule of Activities table required', section: '1.3' },
    { ruleId: 'M11-010', ruleName: 'Discontinuation Criteria', category: 'm11_conformance', severity: 'warning', description: 'Participant discontinuation criteria must be specified', section: '7' },
    { ruleId: 'M11-011', ruleName: 'Adverse Event Definitions', category: 'm11_conformance', severity: 'error', description: 'AE and SAE definitions and reporting timelines required', section: '9' },
    { ruleId: 'M11-012', ruleName: 'Statistical Analysis Plan', category: 'm11_conformance', severity: 'error', description: 'Analysis sets, methods, and sample size justification required', section: '10' },
    { ruleId: 'M11-013', ruleName: 'Data Safety Monitoring', category: 'm11_conformance', severity: 'warning', description: 'DMC recommended for Phase 3 trials', section: '11.4' },
    { ruleId: 'M11-014', ruleName: 'Informed Consent Requirements', category: 'm11_conformance', severity: 'error', description: 'Informed consent process and languages must be documented', section: '11.1' },
    { ruleId: 'M11-015', ruleName: 'Protocol Version Control', category: 'm11_conformance', severity: 'error', description: 'Protocol version and date required', section: '0' },
    { ruleId: 'M11-016', ruleName: 'Study Type Classification', category: 'm11_conformance', severity: 'warning', description: 'Study type (Interventional/Observational) should be specified', section: '4' },
    { ruleId: 'M11-017', ruleName: 'Indication/Disease Area', category: 'm11_conformance', severity: 'error', description: 'Target indication or disease must be specified', section: '2' },
    { ruleId: 'M11-018', ruleName: 'Treatment Duration', category: 'm11_conformance', severity: 'warning', description: 'Treatment duration should be specified for all interventions', section: '6' },
    { ruleId: 'M11-019', ruleName: 'Follow-up Period', category: 'm11_conformance', severity: 'warning', description: 'Follow-up period after treatment completion should be defined', section: '4' },
    { ruleId: 'M11-020', ruleName: 'Pregnancy Requirements', category: 'm11_conformance', severity: 'warning', description: 'Contraception and pregnancy reporting required for trials with women of childbearing potential', section: '5.4' },
    { ruleId: 'M11-021', ruleName: 'Glossary and Abbreviations', category: 'm11_conformance', severity: 'info', description: 'Glossary should define technical terms and abbreviations', section: '13' },

    // Cross-Section Dependency Rules (1 rule)
    { ruleId: 'DEP-001', ruleName: 'Randomization Check', category: 'cross_section', severity: 'warning', description: 'Multiple interventions should have randomization documented', section: '4' },

    // GCP Requirements (2 rules)
    { ruleId: 'GCP-001', ruleName: 'Informed Consent', category: 'gcp', severity: 'warning', description: 'Informed consent process must be documented', section: '11.1' },
    { ruleId: 'GCP-002', ruleName: 'Vulnerable Populations', category: 'gcp', severity: 'warning', description: 'Additional protections required for vulnerable populations', section: '11' },

    // India-Specific Rules (10 rules)
    { ruleId: 'INDIA-001', ruleName: 'CDSCO Approval Number', category: 'india_specific', severity: 'info', description: 'DCGI/CDSCO approval number should be recorded', section: '12.2' },
    { ruleId: 'INDIA-002', ruleName: 'CTRI Registration', category: 'india_specific', severity: 'warning', description: 'CTRI registration required before first enrollment', section: '12.2' },
    { ruleId: 'INDIA-003', ruleName: 'Compensation Policy', category: 'india_specific', severity: 'error', description: 'Detailed compensation policy mandatory per NDCTR 2019', section: '12.2' },
    { ruleId: 'INDIA-004', ruleName: 'Insurance Coverage', category: 'india_specific', severity: 'error', description: 'Insurance policy details mandatory in India', section: '12.2' },
    { ruleId: 'INDIA-005', ruleName: 'Ethics Committee Approvals', category: 'india_specific', severity: 'warning', description: 'EC registration and approval details should be documented', section: '12.2' },
    { ruleId: 'INDIA-006', ruleName: 'Biological Sample Export', category: 'india_specific', severity: 'error', description: 'DCGI approval and justification required for sample export per NDCTR Rule 33', section: '12.2' },
    { ruleId: 'INDIA-007', ruleName: 'Vulnerable Populations (ICMR)', category: 'india_specific', severity: 'error', description: 'Additional protections required per ICMR Guidelines 2017', section: '12.2' },
    { ruleId: 'INDIA-008', ruleName: 'Community Engagement', category: 'india_specific', severity: 'warning', description: 'Community engagement plan for tribal/rural communities', section: '12.2' },
    { ruleId: 'INDIA-009', ruleName: 'Multi-Language Consent', category: 'india_specific', severity: 'warning', description: 'Consent forms should be available in local languages', section: '11.1' },
    { ruleId: 'INDIA-010', ruleName: 'Audio-Visual Recording', category: 'india_specific', severity: 'warning', description: 'Witness and A/V recording for consent from illiterate participants', section: '11.1' },

    // Conditional Rules (5 rules)
    { ruleId: 'COND-001', ruleName: 'Phase 1 Dose Escalation', category: 'conditional', severity: 'warning', description: 'Phase 1 trials should describe dose escalation scheme', section: '6' },
    { ruleId: 'COND-002', ruleName: 'Crossover Washout Period', category: 'conditional', severity: 'error', description: 'Crossover trials require washout period', section: '4' },
    { ruleId: 'COND-003', ruleName: 'Adaptive Design Rules', category: 'conditional', severity: 'error', description: 'Adaptive trials require pre-specified adaptation rules', section: '4' },
    { ruleId: 'COND-004', ruleName: 'Immunogenicity Assessment', category: 'conditional', severity: 'warning', description: 'Biological products should include immunogenicity assessment', section: '8.7' },
    { ruleId: 'COND-005', ruleName: 'Oncology Tumor Assessment', category: 'conditional', severity: 'warning', description: 'Oncology trials should specify tumor assessment schedule', section: '8' }
  ];

  for (const rule of rules) {
    await prisma.validationRule.upsert({
      where: { ruleId: rule.ruleId },
      update: {},
      create: {
        ...rule,
        isEnabled: true
      }
    });
  }

  console.log(`✅ Seeded ${rules.length} validation rules`);
  
  // Print summary
  const categories = rules.reduce((acc, rule) => {
    acc[rule.category] = (acc[rule.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Rules by Category:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} rules`);
  });
}

seedValidationRules()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
