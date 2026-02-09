import { Request, Response } from 'express';
import prisma from '../db';

export const getAllRules = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};

    const rules = await prisma.validationRule.findMany({
      where,
      orderBy: [{ category: 'asc' }, { ruleId: 'asc' }]
    });

    const grouped = rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = [];
      }
      acc[rule.category].push(rule);
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      success: true,
      data: {
        rules,
        grouped,
        totalRules: rules.length,
        categories: Object.keys(grouped),
        summary: {
          m11_conformance: grouped.m11_conformance?.length || 0,
          cross_section: grouped.cross_section?.length || 0,
          gcp: grouped.gcp?.length || 0,
          india_specific: grouped.india_specific?.length || 0,
          conditional: grouped.conditional?.length || 0
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleRule = async (req: Request, res: Response) => {
  try {
    const ruleId = Array.isArray(req.params.ruleId) ? req.params.ruleId[0] : req.params.ruleId;
    const { isEnabled } = req.body;

    const rule = await prisma.validationRule.update({
      where: { ruleId },
      data: { isEnabled }
    });

    res.json({ 
      success: true, 
      data: rule,
      message: `Rule ${ruleId} ${isEnabled ? 'enabled' : 'disabled'}`
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getRuleById = async (req: Request, res: Response) => {
  try {
    const ruleId = Array.isArray(req.params.ruleId) ? req.params.ruleId[0] : req.params.ruleId;

    const rule = await prisma.validationRule.findUnique({
      where: { ruleId }
    });

    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        error: 'Validation rule not found' 
      });
    }

    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
