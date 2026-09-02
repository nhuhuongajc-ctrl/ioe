import { Router, Response } from 'express';
import { IRepository } from '../../database/repositoryInterface.js';
import { AuthenticatedRequest, requireRole } from '../../auth/authMiddleware.js';
import { AuditLogger } from '../../security/auditLogger.js';

export function createUserRouter(db: IRepository): Router {
  const router = Router();
  const auditLogger = new AuditLogger(db);

  // Get current user profile
  router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
    const profile = await db.getUserById(req.user.id);
    res.json({
      user: profile || req.user
    });
  });

  // Update current user profile
  router.put('/me', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const { displayName, grade, schoolName, province, avatarUrl } = req.body;
    const current = (await db.getUserById(req.user.id)) || req.user;

    const updated = await db.saveUser({
      ...current,
      displayName: displayName || current.displayName,
      grade: typeof grade === 'number' ? grade : current.grade,
      schoolName: schoolName !== undefined ? schoolName : current.schoolName,
      province: province !== undefined ? province : current.province,
      avatarUrl: avatarUrl || current.avatarUrl,
      lastLoginAt: new Date().toISOString()
    });

    res.json({
      success: true,
      user: updated
    });
  });

  // Update user role (Super Admin only)
  router.put('/:userId/role', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'super_admin', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'INVALID_ROLE' });
    }

    const success = await db.updateUserRole(userId, role);
    if (!success) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    await auditLogger.log({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'UPDATE_USER_ROLE',
      resourceType: 'user',
      resourceId: userId,
      details: { newRole: role }
    });

    res.json({ success: true, message: `Updated role to ${role}` });
  });

  // View audit logs (Teacher & Super Admin)
  router.get('/audit-logs', requireRole(['teacher', 'super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const logs = await db.queryAuditLogs(limit);
    res.json({ logs });
  });

  return router;
}
