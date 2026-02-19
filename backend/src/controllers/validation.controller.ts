import { Request, Response } from 'express';
import { validationEngine } from '../services/validation.service';
import prisma from '../db';

export const validateProtocol = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { level = 'full' } = req.query; // 'full' or 'quick'

    console.log('Validating protocol:', id);

    // Run validation
    const report = await validationEngine.validateProtocol(id);

    console.log('Validation complete:', report.overallStatus);

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
};

export const getValidationHistory = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { limit = '10' } = req.query;

    const history = await prisma.validationResult.findMany({
      where: { protocolId: id },
      orderBy: { validationDate: 'desc' },
      take: parseInt(limit as string)
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLatestValidation = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const latest = await prisma.validationResult.findFirst({
      where: { protocolId: id },
      orderBy: { validationDate: 'desc' }
    });

    if (!latest) {
      return res.status(404).json({
        success: false,
        error: 'No validation results found for this protocol'
      });
    }

    res.json({
      success: true,
      data: latest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
