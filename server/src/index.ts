import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { idempotencyMiddleware } from './middleware/idempotency';
import { requirePermission } from './middleware/rbac';
import { AgentExecutor } from './utils/executor';

const app = express();
const port = process.env.PORT || 3001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Mock Authentication Middleware
// In production, this verifies a JWT and extracts claims into req.user
const mockAuth = (req: Request, res: Response, next: NextFunction) => {
  req.user = {
    id: 'user-123',
    role: 'admin',
    permissions: ['invoices:read', 'invoices:write', 'dispatch:execute']
  };
  next();
};

const executor = new AgentExecutor();

// Route: Create Invoice & Dispatch Workflow
// Secures the endpoint, enforces idempotency, and executes a resilient workflow
app.post(
  '/api/invoices',
  mockAuth,
  requirePermission(['invoices:write', 'dispatch:execute']),
  idempotencyMiddleware,
  async (req: Request, res: Response) => {
    
    // Define the agent task (e.g., calling an external logistics service or complex DB transaction)
    const agentTask = async () => {
      // Simulate network request or heavy operation
      const success = Math.random() > 0.3; // 70% chance of success
      
      if (!success) {
        throw new Error('External Service Error (Simulated)');
      }

      return {
        invoiceId: `INV-${Date.now()}`,
        status: 'DISPATCHED',
        payload: req.body
      };
    };

    try {
      // Execute with Circuit Breaker and Exponential Backoff + Jitter
      const result = await executor.runWithResilience(agentTask, req.body, 3);
      
      res.status(201).json({
        message: 'Invoice created and dispatched successfully',
        data: result
      });
      
    } catch (error: any) {
      // Catch DLQ routing or terminal failures
      res.status(503).json({
        error: 'Service Unavailable',
        message: error.message
      });
    }
  }
);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Navneet API Server running on http://localhost:${port}`);
  console.log(`🔒 RBAC & Idempotency active.`);
});
