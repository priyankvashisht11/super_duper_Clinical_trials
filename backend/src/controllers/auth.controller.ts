import { Request, Response, CookieOptions } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateRandomToken,
  getTokenExpiry,
  getRefreshTokenExpiry,
} from '../utils/auth.utils';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';

const prisma = new PrismaClient();

// ── httpOnly cookie auth ────────────────────────────────────────────────────────
// Tokens live only in httpOnly cookies now, never in a JSON response body or
// localStorage — closes the XSS-can-read-the-token gap flagged in docs/tech_debt.md.
const isProd = process.env.NODE_ENV === 'production';
const baseCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

function setAuthCookies(res: Response, token: string, refreshToken: string, rememberMe: boolean): void {
  const accessMaxAgeMs = (rememberMe ? 720 : 24) * 60 * 60 * 1000;
  const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000;
  res.cookie('access_token', token, { ...baseCookieOpts, maxAge: accessMaxAgeMs });
  res.cookie('refresh_token', refreshToken, { ...baseCookieOpts, maxAge: refreshMaxAgeMs });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token', baseCookieOpts);
  res.clearCookie('refresh_token', baseCookieOpts);
}

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      title,
      specialty,
      institution,
      licenseNumber,
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        title,
        specialty,
        institution,
        licenseNumber,
      },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken,
        expiresAt: getTokenExpiry(24),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
      },
    });

    // Generate email verification token
    const verificationToken = generateRandomToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: getTokenExpiry(24),
      },
    });

    void sendVerificationEmail(user.email, user.firstName, verificationToken);

    setAuthCookies(res, token, refreshToken, false);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          title: user.title,
          specialty: user.specialty,
          institution: user.institution,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
    });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is inactive',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const expiryHours = rememberMe ? 720 : 24; // 30 days or 24 hours
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken,
        expiresAt: getTokenExpiry(expiryHours),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    setAuthCookies(res, token, refreshToken, !!rememberMe);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          title: user.title,
          specialty: user.specialty,
          institution: user.institution,
          role: user.role,
          emailVerified: user.emailVerified,
          profileImageUrl: user.profileImageUrl,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
    });
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.['access_token'];

    if (token) {
      // Invalidate session
      await prisma.session.updateMany({
        where: { token },
        data: { isActive: false },
      });
    }

    clearAuthCookies(res);
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.['refresh_token'];

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
      return;
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);

    // Check if session exists and is active
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
      return;
    }

    // Generate new access token
    const newToken = generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    // Update session with new token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        expiresAt: getTokenExpiry(24),
      },
    });

    // Refresh token itself is unchanged (still valid for its remaining lifetime) — only
    // the access-token cookie needs rewriting; re-set both so maxAge/expiry stay fresh.
    res.cookie('access_token', newToken, { ...baseCookieOpts, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...baseCookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: getTokenExpiry(1), // 1 hour
      },
    });

    void sendPasswordResetEmail(user.email, user.firstName, resetToken);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    });
  }
}

/**
 * Reset password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Invalidate all sessions
    await prisma.session.updateMany({
      where: { userId: resetToken.userId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
}

/**
 * Verify email
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
      return;
    }

    // Update user
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
    });
  }
}
