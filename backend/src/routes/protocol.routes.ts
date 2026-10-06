import { Router } from 'express';
import protocolControllerModule from '../controllers/protocol.controller';
import * as validationController from '../controllers/validation.controller';
import * as validationRulesController from '../controllers/validation-rules.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
// Handle both named and default exports
const protocolController = (protocolControllerModule as any).protocolController || protocolControllerModule;

// Terminologies (must come BEFORE /:id routes to avoid conflicts)
router.get('/terminologies', protocolController.getAllTerminologies);
router.get('/terminologies/:domain', protocolController.getTerminology);

// Validation Rules Management (must come BEFORE /:id routes)
router.get('/validation-rules', validationRulesController.getAllRules);
router.get('/validation-rules/:ruleId', validationRulesController.getRuleById);
// Enabling/disabling a rule affects validation for every user — admin-only.
// (Everything else in this router is NOT behind auth at all yet — see docs/tech_debt.md
// "No authentication on protocol/ai/research/match/analysis/edc routes" for why that's
// a flagged, deliberately-unresolved gap rather than an oversight in this specific change.)
router.patch(
  '/validation-rules/:ruleId/toggle',
  authenticateToken,
  requireRole('admin'),
  validationRulesController.toggleRule
);

// Protocol CRUD
router.post('/', protocolController.create);
router.get('/', protocolController.getAll);  // Now with enhanced pagination!

// Specific protocol routes (BEFORE /:id to avoid conflicts)
router.get('/:id/completeness', protocolController.getCompleteness);

// Validation routes (BEFORE /:id to avoid conflicts)
router.post('/:id/validate', validationController.validateProtocol);
router.get('/:id/validation/history', validationController.getValidationHistory);
router.get('/:id/validation/latest', validationController.getLatestValidation);

// General protocol routes
router.get('/:id', protocolController.getById);
router.put('/:id', protocolController.update);
router.patch('/:id', protocolController.update); // Support PATCH for partial updates
router.delete('/:id', protocolController.delete);

// Objectives
router.post('/objectives', protocolController.addObjective);
router.put('/objectives/:id', protocolController.updateObjective);

// Eligibility Criteria
router.post('/criteria', protocolController.addCriterion);
router.put('/criteria/:id', protocolController.updateCriterion);
router.delete('/criteria/:id', protocolController.deleteCriterion);

// Interventions
router.post('/interventions', protocolController.addIntervention);
router.put('/interventions/:id', protocolController.updateIntervention);

// Sections
router.put('/sections/:id', protocolController.updateSection);

export { router as protocolRoutes };
