import { Request, Response, NextFunction } from 'express';

// For local demonstration without a real Redis server running, we use an in-memory Map.
// In production, swap this `cache` object with the `redis` client.
const memoryCache = new Map<string, string>();

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    res.status(400).json({ error: 'Idempotency-Key header is required for this route' });
    return;
  }

  try {
    // Production: await redis.get(`idempotency:${idempotencyKey}`)
    const cachedResponse = memoryCache.get(`idempotency:${idempotencyKey}`);

    if (cachedResponse) {
      const data = JSON.parse(cachedResponse);
      
      if (data.status === 'IN_FLIGHT') {
        res.status(409).json({ error: 'Request is currently processing' });
        return;
      }
      
      console.log(`[IDEMPOTENCY] Returning cached response for key: ${idempotencyKey}`);
      res.status(data.statusCode).json(data.body);
      return;
    }

    // Mark as in-flight to lock the request
    // Production: await redis.set(..., 'EX', 300)
    memoryCache.set(`idempotency:${idempotencyKey}`, JSON.stringify({ status: 'IN_FLIGHT' }));

    const originalJson = res.json.bind(res);
    
    // Intercept outgoing response to cache it
    res.json = (body: any) => {
      // Production: await redis.set(..., 'EX', 86400)
      memoryCache.set(
        `idempotency:${idempotencyKey}`,
        JSON.stringify({ status: 'COMPLETED', statusCode: res.statusCode, body })
      );
      
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('[IDEMPOTENCY ERROR]', error);
    res.status(500).json({ error: 'Internal Server Error during idempotency check' });
  }
};
