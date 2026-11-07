import { requireRole, requireSocietyMembership, rateLimiter } from '../server/src/auth';

describe('SafeGate / AARIZO 2.0 Auth & Tenant Security Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let nextCalled: boolean;

  beforeEach(() => {
    nextCalled = false;
    mockReq = {
      headers: {},
      params: {},
      body: {},
      query: {},
      authContext: undefined,
      userRole: undefined,
      societyId: undefined,
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    };
    mockRes = {
      statusCode: 200,
      jsonPayload: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.jsonPayload = data;
        return this;
      },
    };
  });

  describe('requireRole Middleware', () => {
    test('Deny-by-default: Rejects requests with no authenticated role', () => {
      const middleware = requireRole(['resident', 'secretary']);
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(mockRes.statusCode).toBe(403);
      expect(mockRes.jsonPayload.code).toBe('ROLE_MISSING');
    });

    test('Rejects unauthorized role escalation (e.g. guard trying to access secretary endpoint)', () => {
      mockReq.authContext = { role: 'guard', societyId: 'soc-gvs', userId: 'g-1', name: 'Guard' };
      const middleware = requireRole(['secretary', 'admin']);
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(mockRes.statusCode).toBe(403);
      expect(mockRes.jsonPayload.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    test('Permits authorized role', () => {
      mockReq.authContext = { role: 'secretary', societyId: 'soc-gvs', userId: 'sec-1', name: 'Secretary' };
      const middleware = requireRole(['secretary']);
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(mockRes.statusCode).toBe(200);
    });

    test('Universal Platform Admin access is always permitted', () => {
      mockReq.authContext = { role: 'admin', societyId: 'soc-platform', userId: 'admin-1', name: 'SuperAdmin' };
      const middleware = requireRole(['resident']);
      middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });

  describe('requireSocietyMembership Tenant Isolation Middleware', () => {
    test('Rejects cross-society IDOR access attempt', () => {
      mockReq.authContext = { role: 'resident', societyId: 'soc-society-A', userId: 'res-1', name: 'Resident' };
      mockReq.params.societyId = 'soc-society-B'; // Trying to access Society B

      requireSocietyMembership(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(mockRes.statusCode).toBe(403);
      expect(mockRes.jsonPayload.code).toBe('TENANT_ISOLATION_VIOLATION');
    });

    test('Permits matching society access', () => {
      mockReq.authContext = { role: 'resident', societyId: 'soc-society-A', userId: 'res-1', name: 'Resident' };
      mockReq.params.societyId = 'soc-society-A';

      requireSocietyMembership(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });

  describe('rateLimiter Middleware', () => {
    test('Allows requests within limits', () => {
      const limiter = rateLimiter(5, 10000);
      limiter(mockReq, mockRes, () => {
        nextCalled = true;
      });
      expect(nextCalled).toBe(true);
    });

    test('Blocks requests exceeding burst threshold with 429 Too Many Requests', () => {
      const limiter = rateLimiter(2, 60000);
      mockReq.ip = '10.0.0.99';

      // 1st request
      limiter(mockReq, mockRes, () => {});
      // 2nd request
      limiter(mockReq, mockRes, () => {});
      // 3rd request (should block)
      let blocked = false;
      limiter(mockReq, mockRes, () => {
        blocked = true;
      });

      expect(blocked).toBe(false);
      expect(mockRes.statusCode).toBe(429);
      expect(mockRes.jsonPayload.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});

