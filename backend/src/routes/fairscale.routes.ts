import { Router, Request, Response, NextFunction } from 'express';
import {
  getFairScore,
  getFairScoreOnly,
  getBatchFairScores,
} from '../services/fairscale.service.js';

const router = Router();

/**
 * GET /api/fairscale/score
 * Fetch complete FairScore data for a wallet
 * Query params: wallet (required), twitter (optional)
 */
router.get('/score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallet, twitter } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'wallet query parameter is required',
        statusCode: 400,
      });
      return;
    }

    // Validate wallet address format (basic Solana pubkey validation)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid Solana wallet address format',
        statusCode: 400,
      });
      return;
    }

    const score = await getFairScore(
      wallet,
      typeof twitter === 'string' ? twitter : undefined
    );

    res.json(score);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/fairscale/fairScore
 * Fetch only the FairScore number (lightweight)
 * Query params: wallet (required)
 */
router.get('/fairScore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'wallet query parameter is required',
        statusCode: 400,
      });
      return;
    }

    const score = await getFairScoreOnly(wallet);
    res.json(score);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/fairscale/batch
 * Fetch FairScores for multiple wallets
 * Body: { wallets: string[] }
 */
router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallets } = req.body;

    if (!Array.isArray(wallets) || wallets.length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'wallets array is required in request body',
        statusCode: 400,
      });
      return;
    }

    if (wallets.length > 50) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum 50 wallets per batch request',
        statusCode: 400,
      });
      return;
    }

    const scores = await getBatchFairScores(wallets);
    
    // Convert Map to object for JSON response
    const result: Record<string, number> = {};
    scores.forEach((score, wallet) => {
      result[wallet] = score;
    });

    res.json({ scores: result });
  } catch (error) {
    next(error);
  }
});

export default router;
