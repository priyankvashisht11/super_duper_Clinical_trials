import { z } from 'zod';

export const CreateProtocolSchema = z.object({
  sponsorProtocolIdentifier: z.string().min(1).max(100),
  fullTitle: z.string().min(10).max(500),
  shortTitle: z.string().max(250).optional(),
  protocolVersion: z.string().default('1.0'),
  protocolDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  trialPhase: z.string().optional(),
  indication: z.string().optional(),
  studyType: z.string().default('Interventional'),
  createdBy: z.string()
});

export const UpdateProtocolSchema = CreateProtocolSchema.partial();

export const CreateObjectiveSchema = z.object({
  protocolId: z.string().uuid(),
  objectiveType: z.enum(['primary', 'secondary', 'exploratory']),
  objectiveText: z.string().min(10),
  orderIndex: z.number().int().min(0).optional(),
  estimand: z.object({
    treatment: z.string().optional(),
    population: z.string().optional(),
    endpoint: z.string().optional(),
    intercurrentEvents: z.object({
      strategy: z.enum([
        'treatment_policy',
        'composite',
        'hypothetical',
        'principal_stratum',
        'while_on_treatment'
      ]).optional(),
      description: z.string().optional()
    }).optional(),
    summaryMeasure: z.string().optional()
  }).optional(),
  rationale: z.string().optional()
});

export const UpdateObjectiveSchema = CreateObjectiveSchema.omit({ protocolId: true }).partial();

export const CreateCriterionSchema = z.object({
  protocolId: z.string().uuid(),
  criterionType: z.enum(['inclusion', 'exclusion']),
  criterionText: z.string().min(5),
  isCritical: z.boolean().default(false),
  orderIndex: z.number().int().min(0).optional()
});

export const UpdateCriterionSchema = CreateCriterionSchema.omit({ protocolId: true }).partial();

export const CreateInterventionSchema = z.object({
  protocolId: z.string().uuid(),
  interventionType: z.enum(['investigational_product', 'comparator', 'placebo', 'other']),
  productName: z.string().min(1).max(200),
  dosageForm: z.string().max(100).optional(),
  routeOfAdministration: z.string().max(100).optional(),
  dose: z.string().max(50).optional(),
  doseUnit: z.string().max(20).optional(),
  frequency: z.string().max(100).optional(),
  duration: z.string().max(100).optional(),
  rationale: z.string().optional()
});

export const UpdateInterventionSchema = CreateInterventionSchema.omit({ protocolId: true }).partial();

export const UpdateSectionSchema = z.object({
  content: z.record(z.any()),
  isComplete: z.boolean().optional()
});

export type CreateProtocolInput = z.infer<typeof CreateProtocolSchema>;
export type UpdateProtocolInput = z.infer<typeof UpdateProtocolSchema>;
export type CreateObjectiveInput = z.infer<typeof CreateObjectiveSchema>;
export type UpdateObjectiveInput = z.infer<typeof UpdateObjectiveSchema>;
export type CreateCriterionInput = z.infer<typeof CreateCriterionSchema>;
export type UpdateCriterionInput = z.infer<typeof UpdateCriterionSchema>;
export type CreateInterventionInput = z.infer<typeof CreateInterventionSchema>;
export type UpdateInterventionInput = z.infer<typeof UpdateInterventionSchema>;
export type UpdateSectionInput = z.infer<typeof UpdateSectionSchema>;
