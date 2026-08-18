import { Request, Response, NextFunction } from 'express';

interface User {
  id: string;
  role: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Structured Audit Logger for SIEM
 */
const auditLog = (
  userId: string,
  action: string,
  resourceId: string | null,
  ipAddress: string,
  status: 'SUCCESS' | 'DENIED' | 'ERROR'
) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resourceId,
    ipAddress,
    status
  };
  
  // Output JSON log (ideal for CloudWatch, DataDog, Splunk)
  console.log(JSON.stringify(logEntry));
};

/**
 * RBAC Permission Middleware
 */
export const requirePermission = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // In a real app, req.user would be populated by a prior JWT authentication middleware
    const user = req.user; 
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const resourceId = req.params.id || req.body?.id || null;
    const action = `${req.method} ${req.originalUrl}`;

    try {
      if (!user) {
        auditLog('anonymous', action, resourceId, ipAddress, 'DENIED');
        res.status(401).json({ error: 'Unauthorized: No valid session found.' });
        return;
      }

      // Verify user holds ALL required permissions
      const hasPermissions = requiredPermissions.every(permission => 
        user.permissions.includes(permission)
      );

      if (!hasPermissions) {
        auditLog(user.id, action, resourceId, ipAddress, 'DENIED');
        res.status(403).json({ 
          error: 'Forbidden: Insufficient privileges to perform this action.' 
        });
        return;
      }

      // Execution allowed
      auditLog(user.id, action, resourceId, ipAddress, 'SUCCESS');
      next();
      
    } catch (error) {
      auditLog(user?.id || 'unknown', action, resourceId, ipAddress, 'ERROR');
      console.error('[RBAC SECURITY ERROR]', error);
      res.status(500).json({ error: 'Internal server error verifying permissions.' });
    }
  };
};
