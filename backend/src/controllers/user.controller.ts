import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/auth.utils';

const prisma = new PrismaClient();

/**
 * Get current user profile
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        title: true,
        specialty: true,
        institution: true,
        licenseNumber: true,
        phone: true,
        country: true,
        state: true,
        city: true,
        role: true,
        emailVerified: true,
        profileImageUrl: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const {
      firstName,
      lastName,
      title,
      specialty,
      institution,
      licenseNumber,
      phone,
      country,
      state,
      city,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName,
        lastName,
        title,
        specialty,
        institution,
        licenseNumber,
        phone,
        country,
        state,
        city,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        title: true,
        specialty: true,
        institution: true,
        licenseNumber: true,
        phone: true,
        country: true,
        state: true,
        city: true,
        role: true,
        emailVerified: true,
        profileImageUrl: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
}

/**
 * Change password
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate all other sessions
    const authHeader = req.headers['authorization'];
    const currentToken = authHeader && authHeader.split(' ')[1];

    await prisma.session.updateMany({
      where: {
        userId: user.id,
        token: { not: currentToken },
      },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
}

/**
 * Get user preferences
 */
export async function getPreferences(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user.userId },
    });

    if (!preferences) {
      // Create default preferences if not exists
      const newPreferences = await prisma.userPreferences.create({
        data: { userId: req.user.userId },
      });

      res.json({
        success: true,
        data: newPreferences,
      });
      return;
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
    });
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const {
      emailNotifications,
      pushNotifications,
      trialAlerts,
      protocolUpdates,
      weeklyDigest,
      theme,
      language,
      timezone,
    } = req.body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.user.userId },
      update: {
        emailNotifications,
        pushNotifications,
        trialAlerts,
        protocolUpdates,
        weeklyDigest,
        theme,
        language,
        timezone,
      },
      create: {
        userId: req.user.userId,
        emailNotifications,
        pushNotifications,
        trialAlerts,
        protocolUpdates,
        weeklyDigest,
        theme,
        language,
        timezone,
      },
    });

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
}

/**
 * Get user sessions
 */
export async function getSessions(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: req.user.userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
    });
  }
}

/**
 * Revoke a session
 */
export async function revokeSession(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { sessionId } = req.params as { sessionId: string };

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: req.user.userId,
      },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      });
      return;
    }

    // Revoke session
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke session',
    });
  }
}
