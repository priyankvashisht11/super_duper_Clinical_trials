import { Router } from 'express';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  getSessions,
  revokeSession,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  updateProfileValidation,
  changePasswordValidation,
  handleValidationErrors,
} from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Profile
router.get('/me', getCurrentUser);
router.put(
  '/me',
  updateProfileValidation,
  handleValidationErrors,
  updateProfile
);

// Password
router.put(
  '/me/password',
  changePasswordValidation,
  handleValidationErrors,
  changePassword
);

// Preferences
router.get('/me/preferences', getPreferences);
router.put('/me/preferences', updatePreferences);

// Sessions
router.get('/me/sessions', getSessions);
router.delete('/me/sessions/:sessionId', revokeSession);

export default router;
