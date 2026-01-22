import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0',
  });
});

/**
 * GET /api/health/config
 * Returns non-sensitive configuration info
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    solana: {
      network: config.solana.network,
      programId: config.solana.programId,
    },
    fairscale: {
      apiUrl: config.fairscale.apiUrl,
      hasApiKey: !!config.fairscale.apiKey,
    },
  });
});

export default router;
