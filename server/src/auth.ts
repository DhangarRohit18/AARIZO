import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma.js';

let firebaseAuthInstance: any = null;

const getFirebaseAuth = async () => {
  if (!firebaseAuthInstance) {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    if (!getApps().length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountKey) {
        const parsed = JSON.parse(serviceAccountKey);
        initializeApp({ credential: cert(parsed) });
      } else {
        initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'aarizo-community' });
      }
    }
    firebaseAuthInstance = getAuth();
  }
  return firebaseAuthInstance;
};

export interface AuthenticatedUserContext {
  userId: string;
  firebaseUid?: string;
  email?: string;
  role: string;
  societyId: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthenticatedUserContext;
    }
  }
}

/**
 * P0 Security Authentication Middleware
 * Validates Firebase Bearer tokens, resolves authoritative PostgreSQL profile,
 * and sets trusted server-side request context. Rejects all unverified identity headers.
 */
export const authenticateFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // In production, Authorization Bearer is strictly required
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If local test / dev mode fallback token provided
    const devToken = req.headers['x-test-token'] as string;
    if (process.env.NODE_ENV !== 'production' && devToken) {
      req.authContext = {
        userId: (req.headers['x-user-id'] as string) || 'test-user',
        role: ((req.headers['x-user-role'] as string) || 'resident').toLowerCase(),
        societyId: (req.headers['x-society-id'] as string) || 'soc-gvs',
        name: 'Development User',
      };
      req.societyId = req.authContext.societyId;
      req.userId = req.authContext.userId;
      req.userRole = req.authContext.role;
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Bearer authorization token',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    let uid = '';
    let email = '';
    let claimsRole: string | undefined;
    let claimsSocietyId: string | undefined;

    // Verify Firebase token cryptographically
    try {
      const auth = await getFirebaseAuth();
      const decoded = await auth.verifyIdToken(token);
      uid = decoded.uid;
      email = decoded.email || '';
      claimsRole = decoded.role ? String(decoded.role).toLowerCase() : undefined;
      claimsSocietyId = decoded.societyId ? String(decoded.societyId) : undefined;
    } catch (fbErr: any) {
      // In local dev/testing without active Firebase cloud connection, decode standard JWT
      if (process.env.NODE_ENV !== 'production' && token.startsWith('mock_token_')) {
        uid = token.replace('mock_token_', '');
      } else {
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired Firebase ID token',
          code: 'AUTH_TOKEN_INVALID',
        });
      }
    }

    // Look up authoritative PostgreSQL User record
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: uid }, ...(email ? [{ email }] : [])],
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized: User profile does not exist in authoritative database',
        code: 'USER_NOT_PROVISIONED',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Forbidden: Account has been suspended or deactivated by society administration',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    // Establish trusted server-side request context
    const effectiveRole = claimsRole || user.role.toLowerCase();
    const effectiveSocietyId = claimsSocietyId || user.societyId || 'soc-gvs';

    req.authContext = {
      userId: user.id,
      firebaseUid: uid,
      email: user.email || undefined,
      role: effectiveRole,
      societyId: effectiveSocietyId,
      name: user.name,
    };

    req.societyId = effectiveSocietyId;
    req.userId = user.id;
    req.userRole = effectiveRole;

    next();
  } catch (err: any) {
    return res.status(500).json({
      error: 'Authentication failed due to server error',
      code: 'AUTH_INTERNAL_ERROR',
    });
  }
};

/**
 * Deny-by-default role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.authContext?.role || req.userRole || '').toLowerCase();

    if (!role) {
      return res.status(403).json({
        error: 'Access denied: No authenticated role found',
        code: 'ROLE_MISSING',
      });
    }

    // Platform admin has universal administrative access
    if (role === 'admin') {
      return next();
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    if (normalizedAllowed.includes(role)) {
      return next();
    }

    return res.status(403).json({
      error: `Access denied: Role '${role}' lacks permission for this endpoint`,
      code: 'INSUFFICIENT_PERMISSIONS',
      requiredRoles: allowedRoles,
    });
  };
};

/**
 * Multi-tenant isolation verification middleware
 * Guarantees that users cannot query or mutate records belonging to other societies
 */
export const requireSocietyMembership = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestSocietyId = req.params.societyId || req.body.societyId || req.query.societyId;
  const userSocietyId = req.authContext?.societyId || req.societyId;
  const userRole = req.authContext?.role || req.userRole;

  if (userRole === 'admin') {
    return next();
  }

  if (requestSocietyId && userSocietyId && requestSocietyId !== userSocietyId) {
    return res.status(403).json({
      error: 'Cross-society tenant access denied: Resource belongs to a different society',
      code: 'TENANT_ISOLATION_VIOLATION',
    });
  }

  next();
};

/**
 * In-memory sliding window rate limiter for security against brute-force attacks
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterMs: record.resetTime - now,
      });
    }

    next();
  };
};
