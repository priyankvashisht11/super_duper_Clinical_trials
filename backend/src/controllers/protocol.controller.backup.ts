import { Request, Response } from 'express';
import prisma from '../db';

export const protocolController = {
  create: async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Test endpoint working!' });
  },
  getAll: async (req: Request, res: Response) => {
    res.json({ success: true, data: [] });
  },
  getById: async (req: Request, res: Response) => {
    res.json({ success: true, data: null });
  },
  update: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  delete: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  addObjective: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  updateObjective: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  addCriterion: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  updateCriterion: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  deleteCriterion: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  addIntervention: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  updateIntervention: async (req: Request, res: Response) => {
    res.json({ success: true });
  },
  updateSection: async (req: Request, res: Response) => {
    res.json({ success: true });
  }
};

export default protocolController;
