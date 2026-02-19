import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/auth.controller';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors,
} from '../middleware/validation.middleware';
import {
  authRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rate-limit.middleware';

const router = Router();

// Registration
router.post(
  '/register',
  authRateLimiter,
  registerValidation,
  handleValidationErrors,
  register
);

// Login
router.post(
  '/login',
  authRateLimiter,
  loginValidation,
  handleValidationErrors,
  login
);

// Logout
router.post('/logout', logout);

// Refresh token
router.post('/refresh', refreshToken);

// Forgot password
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword
);

// Verify email
router.post('/verify-email', verifyEmail);

export default router;
