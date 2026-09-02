import { Request, Response, NextFunction } from 'express';
import { UserProfile, UserRole } from '../../../src/shared/types/user.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const guestHeaderId = req.headers['x-guest-id'] as string;
  const guestHeaderName = req.headers['x-guest-name'] as string;
  const guestHeaderGrade = req.headers['x-guest-grade'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // Check for demo teacher / student tokens or custom tokens
    if (token === 'demo-teacher-token' || token.includes('teacher')) {
      req.user = {
        id: 'teacher-demo-1',
        displayName: 'Cô Hoàng Thu Thảo (Giáo viên)',
        role: 'teacher',
        grade: 5,
        email: 'teacher@ioemaster.edu.vn',
        createdAt: new Date().toISOString()
      };
      return next();
    } else if (token === 'demo-admin-token' || token.includes('admin')) {
      req.user = {
        id: 'admin-1',
        displayName: 'Ban Quản Trị IOE',
        role: 'admin',
        grade: 5,
        email: 'admin@ioemaster.edu.vn',
        createdAt: new Date().toISOString()
      };
      return next();
    } else if (token === 'demo-student-token' || token.includes('student')) {
      req.user = {
        id: 'student-demo-1',
        displayName: 'Nguyễn Minh Anh',
        role: 'student',
        grade: 5,
        schoolName: 'TH Nguyễn Du',
        createdAt: new Date().toISOString()
      };
      return next();
    }

    // Default authenticated user payload if token provided
    req.user = {
      id: `user-${token.slice(0, 10)}`,
      displayName: 'Học viên IOE',
      role: 'student',
      grade: 5,
      createdAt: new Date().toISOString()
    };
    return next();
  }

  // If Guest headers are provided
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

  // Default guest if no auth header
  req.user = {
    id: `guest-${Math.random().toString(36).substring(2, 9)}`,
    displayName: 'Học sinh Khách',
    role: 'guest',
    grade: 5,
    createdAt: new Date().toISOString()
  };
  next();
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Bạn không có quyền thực hiện thao tác này. Cần quyền Giáo viên hoặc Quản trị viên.'
      });
    }
    next();
  };
}

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests = 100, windowMs = 60 * 1000) {
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
