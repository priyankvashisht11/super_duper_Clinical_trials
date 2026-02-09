import { Request, Response } from 'express';
import prisma from '../db';
import {
  CreateProtocolSchema,
  UpdateProtocolSchema,
  CreateObjectiveSchema,
  UpdateObjectiveSchema,
  CreateCriterionSchema,
  UpdateCriterionSchema,
  CreateInterventionSchema,
  UpdateInterventionSchema,
  UpdateSectionSchema
} from '../models/protocol.model';

const M11_SECTIONS = [
  { number: '1', title: 'Protocol Summary', type: 'summary', required: true },
  { number: '2', title: 'Introduction', type: 'introduction', required: true },
  { number: '3', title: 'Trial Objectives and Estimands', type: 'objectives', required: true },
  { number: '4', title: 'Trial Design', type: 'design', required: true },
  { number: '5', title: 'Trial Population', type: 'population', required: true },
  { number: '6', title: 'Trial Intervention', type: 'intervention', required: true },
  { number: '7', title: 'Discontinuation', type: 'discontinuation', required: true },
  { number: '8', title: 'Trial Assessments', type: 'assessments', required: true },
  { number: '9', title: 'Adverse Events', type: 'adverse_events', required: true },
  { number: '10', title: 'Statistical Considerations', type: 'statistics', required: true },
  { number: '11', title: 'Trial Oversight', type: 'oversight', required: true },
  { number: '12', title: 'Appendices', type: 'appendices', required: false },
  { number: '13', title: 'Glossary', type: 'glossary', required: false },
  { number: '14', title: 'References', type: 'references', required: false }
];

export const protocolController = {
  create: async (req: Request, res: Response) => {
    try {
      const validated = CreateProtocolSchema.parse(req.body);
      const protocol = await prisma.protocol.create({
        data: {
          sponsorProtocolIdentifier: validated.sponsorProtocolIdentifier,
          fullTitle: validated.fullTitle,
          shortTitle: validated.shortTitle,
          protocolVersion: validated.protocolVersion,
          protocolDate: new Date(validated.protocolDate),
          trialPhase: validated.trialPhase,
          indication: validated.indication,
          studyType: validated.studyType,
          createdBy: validated.createdBy,
          sections: {
            create: M11_SECTIONS.map((section, index) => ({
              sectionNumber: section.number,
              sectionTitle: section.title,
              sectionType: section.type,
              isRequired: section.required,
              orderIndex: index,
              content: {}
            }))
          }
        },
        include: { sections: true, objectives: true, eligibilityCriteria: true, interventions: true }
      });
      res.status(201).json({ success: true, data: protocol });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '10', status, search, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      const where: any = { deletedAt: null };
      if (status) where.protocolStatus = status;
      if (search) {
        where.OR = [
          { fullTitle: { contains: search as string, mode: 'insensitive' } },
          { sponsorProtocolIdentifier: { contains: search as string, mode: 'insensitive' } },
          { indication: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder;
      const [protocols, total] = await Promise.all([
        prisma.protocol.findMany({
          where, skip, take: limitNum, orderBy,
          select: {
            id: true, sponsorProtocolIdentifier: true, fullTitle: true, shortTitle: true,
            protocolVersion: true, protocolStatus: true, trialPhase: true, indication: true,
            completenessPercentage: true, createdAt: true, updatedAt: true, createdBy: true,
            _count: { select: { objectives: true, eligibilityCriteria: true, interventions: true, sections: true } }
          }
        }),
        prisma.protocol.count({ where })
      ]);
      const totalPages = Math.ceil(total / limitNum);
      res.json({
        success: true, data: protocols,
        pagination: {
          total, page: pageNum, limit: limitNum, totalPages,
          hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
          nextPage: pageNum < totalPages ? pageNum + 1 : null,
          prevPage: pageNum > 1 ? pageNum - 1 : null
        },
        filters: { status: status || 'all', search: search || null, sortBy: sortBy as string, sortOrder: sortOrder as string }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const protocol = await prisma.protocol.findUnique({
        where: { id },
        include: {
          sections: { orderBy: { orderIndex: 'asc' } },
          objectives: { orderBy: { orderIndex: 'asc' } },
          eligibilityCriteria: { orderBy: { orderIndex: 'asc' } },
          interventions: true
        }
      });
      if (!protocol || protocol.deletedAt) {
        return res.status(404).json({ success: false, error: 'Protocol not found' });
      }
      res.json({ success: true, data: protocol });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = UpdateProtocolSchema.parse(req.body);
      const updateData: any = { ...validated };
      if (validated.protocolDate) updateData.protocolDate = new Date(validated.protocolDate);
      const protocol = await prisma.protocol.update({
        where: { id }, data: updateData,
        include: { sections: true, objectives: true, eligibilityCriteria: true, interventions: true }
      });
      res.json({ success: true, data: protocol });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await prisma.protocol.update({ where: { id }, data: { deletedAt: new Date() } });
      res.json({ success: true, message: 'Protocol deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  addObjective: async (req: Request, res: Response) => {
    try {
      const validated = CreateObjectiveSchema.parse(req.body);
      const objective = await prisma.objective.create({ data: { ...validated, orderIndex: validated.orderIndex || 0 } });
      res.status(201).json({ success: true, data: objective });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  updateObjective: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = UpdateObjectiveSchema.parse(req.body);
      const objective = await prisma.objective.update({ where: { id }, data: validated });
      res.json({ success: true, data: objective });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  addCriterion: async (req: Request, res: Response) => {
    try {
      const validated = CreateCriterionSchema.parse(req.body);
      const count = await prisma.eligibilityCriterion.count({
        where: { protocolId: validated.protocolId, criterionType: validated.criterionType }
      });
      const criterion = await prisma.eligibilityCriterion.create({
        data: { ...validated, criterionNumber: `${count + 1}`, orderIndex: validated.orderIndex ?? count }
      });
      res.status(201).json({ success: true, data: criterion });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  updateCriterion: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = UpdateCriterionSchema.parse(req.body);
      const criterion = await prisma.eligibilityCriterion.update({ where: { id }, data: validated });
      res.json({ success: true, data: criterion });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  deleteCriterion: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await prisma.eligibilityCriterion.delete({ where: { id } });
      res.json({ success: true, message: 'Criterion deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  addIntervention: async (req: Request, res: Response) => {
    try {
      const validated = CreateInterventionSchema.parse(req.body);
      const intervention = await prisma.intervention.create({ data: validated });
      res.status(201).json({ success: true, data: intervention });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  updateIntervention: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = UpdateInterventionSchema.parse(req.body);
      const intervention = await prisma.intervention.update({ where: { id }, data: validated });
      res.json({ success: true, data: intervention });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  updateSection: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = UpdateSectionSchema.parse(req.body);
      const section = await prisma.protocolSection.update({ where: { id }, data: validated });
      res.json({ success: true, data: section });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  getCompleteness: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const protocol = await prisma.protocol.findUnique({
        where: { id },
        include: { sections: true, objectives: true, eligibilityCriteria: true, interventions: true }
      });
      if (!protocol) return res.status(404).json({ success: false, error: 'Protocol not found' });
      let score = 0;
      const checks: Array<{field: string, complete: boolean | string, weight: number, status: string}> = [];
      const requiredFields = [
        { field: 'Sponsor Protocol ID', value: protocol.sponsorProtocolIdentifier, weight: 5 },
        { field: 'Full Title', value: protocol.fullTitle, weight: 5 },
        { field: 'Trial Phase', value: protocol.trialPhase, weight: 5 },
        { field: 'Indication', value: protocol.indication, weight: 5 },
        { field: 'Protocol Version', value: protocol.protocolVersion, weight: 5 }
      ];
      requiredFields.forEach(item => {
        const isComplete = !!item.value;
        if (isComplete) score += item.weight;
        checks.push({ field: item.field, complete: isComplete, weight: item.weight, status: isComplete ? '✅' : '❌' });
      });
      const hasPrimary = protocol.objectives.some(o => o.objectiveType === 'primary');
      const hasSecondary = protocol.objectives.some(o => o.objectiveType === 'secondary');
      if (hasPrimary) {
        score += 15;
        checks.push({ field: 'Primary Objective', complete: true, weight: 15, status: '✅' });
      } else {
        checks.push({ field: 'Primary Objective', complete: false, weight: 15, status: '❌ Required' });
      }
      if (hasSecondary) {
        score += 5;
        checks.push({ field: 'Secondary Objective', complete: true, weight: 5, status: '✅' });
      }
      const hasInclusion = protocol.eligibilityCriteria.some(c => c.criterionType === 'inclusion');
      const hasExclusion = protocol.eligibilityCriteria.some(c => c.criterionType === 'exclusion');
      if (hasInclusion) {
        score += 8;
        checks.push({ field: 'Inclusion Criteria', complete: true, weight: 8, status: '✅' });
      } else {
        checks.push({ field: 'Inclusion Criteria', complete: false, weight: 8, status: '❌ Required' });
      }
      if (hasExclusion) {
        score += 7;
        checks.push({ field: 'Exclusion Criteria', complete: true, weight: 7, status: '✅' });
      } else {
        checks.push({ field: 'Exclusion Criteria', complete: false, weight: 7, status: '❌ Required' });
      }
      const hasIP = protocol.interventions.some(i => i.interventionType === 'investigational_product');
      const interventionCount = protocol.interventions.length;
      if (hasIP) {
        score += 15;
        checks.push({ field: 'Investigational Product', complete: true, weight: 15, status: `✅ (${interventionCount} intervention${interventionCount > 1 ? 's' : ''})` });
      } else {
        checks.push({ field: 'Investigational Product', complete: false, weight: 15, status: '❌ Required' });
      }
      const completeSections = protocol.sections.filter(s => s.isComplete).length;
      const sectionScore = Math.round((completeSections / 14) * 15);
      score += sectionScore;
      checks.push({ field: 'Sections Complete', complete: `${completeSections}/14`, weight: 15, status: `${Math.round((completeSections / 14) * 100)}%` });
      let status = 'draft';
      let statusMessage = 'Protocol is in draft stage';
      if (score >= 90) {
        status = 'ready_for_review';
        statusMessage = 'Protocol is complete and ready for review';
      } else if (score >= 70) {
        status = 'substantial_progress';
        statusMessage = 'Protocol has substantial progress';
      } else if (score >= 40) {
        status = 'in_progress';
        statusMessage = 'Protocol development in progress';
      }
      await prisma.protocol.update({ where: { id }, data: { completenessPercentage: Math.round(score) } });
      res.json({ 
        success: true, 
        data: { 
          completenessPercentage: Math.round(score), status, statusMessage, breakdown: checks,
          summary: {
            protocolFields: requiredFields.filter(f => f.value).length + '/' + requiredFields.length,
            objectives: protocol.objectives.length,
            eligibilityCriteria: protocol.eligibilityCriteria.length,
            interventions: protocol.interventions.length,
            sectionsComplete: completeSections + '/14'
          }
        } 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getTerminology: async (req: Request, res: Response) => {
    try {
      const domain = Array.isArray(req.params.domain) ? req.params.domain[0] : req.params.domain;
      const terms = await prisma.controlledTerminology.findMany({
        where: { domain, isActive: true },
        orderBy: { displayName: 'asc' }
      });
      res.json({ success: true, data: terms });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getAllTerminologies: async (req: Request, res: Response) => {
    try {
      const terminologies = await prisma.controlledTerminology.findMany({
        where: { isActive: true },
        orderBy: [{ domain: 'asc' }, { displayName: 'asc' }]
      });
      const grouped = terminologies.reduce((acc, term) => {
        if (!acc[term.domain]) acc[term.domain] = [];
        acc[term.domain].push(term);
        return acc;
      }, {} as Record<string, any[]>);
      res.json({ success: true, data: grouped });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default protocolController;
