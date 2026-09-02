import { Request, Response, NextFunction } from 'express';
import { UserProfile, UserRole } from '../../src/shared/types/user.js';
import { verifyFirebaseIdToken } from './firebaseAdmin.js';
import { IRepository } from '../database/repositoryInterface.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export function createAuthMiddleware(db: IRepository) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const guestHeaderId = req.headers['x-guest-id'] as string;
    const guestHeaderName = req.headers['x-guest-name'] as string;
    const guestHeaderGrade = req.headers['x-guest-grade'] as string;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = await verifyFirebaseIdToken(token);
        if (decoded) {
          const uid = decoded.uid;
          let user = await db.getUserById(uid);

          if (!user) {
            // Determine initial role
            let initialRole: UserRole = 'student';
            if (decoded.email?.includes('teacher') || decoded.email?.startsWith('gv.')) {
              initialRole = 'teacher';
            } else if (decoded.email?.includes('admin') || decoded.email === 'admin@ioe.msdieu.com') {
              initialRole = 'super_admin';
            }

            user = {
              id: uid,
              email: decoded.email,
              displayName: decoded.name || decoded.email?.split('@')[0] || 'Học viên IOE',
              role: initialRole,
              grade: 5,
              avatarUrl: decoded.picture,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            await db.saveUser(user);
          } else {
            // Update last login timestamp
            user.lastLoginAt = new Date().toISOString();
            if (decoded.picture && !user.avatarUrl) {
              user.avatarUrl = decoded.picture;
            }
            await db.saveUser(user);
          }

          req.user = user;
          return next();
        }
      } catch (err) {
        console.warn('[AuthMiddleware] Error processing bearer token:', err);
      }
    }

    // Guest fallback
    if (guestHeaderId || guestHeaderName) {
      req.user = {
        id: guestHeaderId || `guest-${Date.now()}`,
        displayName: decodeURIComponent(guestHeaderName || 'Học sinh Tự do'),
        role: 'guest',
        grade: parseInt(guestHeaderGrade, 10) || 5,
        createdAt: new Date().toISOString()
      };
      return next();
    }

    // Default guest for unauthenticated public requests
    req.user = {
      id: `guest-${Math.random().toString(36).substring(2, 9)}`,
      displayName: 'Khách',
      role: 'guest',
      grade: 5,
      createdAt: new Date().toISOString()
    };
    next();
  };
}

export function requireRole(allowedRoles: (UserRole | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập để thực hiện thao tác này.'
      });
    }

    const userRole = req.user.role;
    // super_admin passes all checks
    if (userRole === 'super_admin' || userRole === 'admin') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Bạn không có quyền thực hiện thao tác này. Cần quyền Giáo viên hoặc Quản trị viên.'
    });
  };
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Global auth middleware already populates req.user if token/guest header is present
  next();
}

// In-memory rate limiter for high concurrency protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests = 300, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.'
      });
    }

    entry.count++;
    next();
  };
}
