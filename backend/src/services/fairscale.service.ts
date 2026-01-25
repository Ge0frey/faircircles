import axios, { AxiosError } from 'axios';
import { config } from '../config/index.js';
import type { FairScaleApiResponse, FairScoreResponse, FairScoreOnlyResponse } from '../types/index.js';

const fairscaleApi = axios.create({
  baseURL: config.fairscale.apiUrl,
  timeout: 10000,
  headers: {
    'fairkey': config.fairscale.apiKey,
    'Content-Type': 'application/json',
  },
});

/**
 * Normalize FairScore to 0-1000 scale
 * The FairScale API returns `fairscore` on a 0-100 scale (e.g., 65.3)
 * We convert it to 0-1000 for consistent display across the application
 */
function normalizeFairScoreToThousand(score: number): number {
  // If score is already > 100, it's likely already on 0-1000 scale
  if (score > 100) {
    return Math.round(score);
  }
  // Convert from 0-100 scale to 0-1000 scale
  return Math.round(score * 10);
}

/**
 * Fetch complete FairScore data including tier and badges
 * Normalizes the API response for the frontend
 * Score is always returned on a 0-1000 scale
 */
export async function getFairScore(
  wallet: string,
  twitter?: string
): Promise<FairScoreResponse> {
  try {
    const params: Record<string, string> = { wallet };
    if (twitter) {
      params.twitter = twitter;
    }

    const response = await fairscaleApi.get<FairScaleApiResponse>('/score', {
      params,
    });

    const data = response.data;
    
    // Normalize to frontend format with score on 0-1000 scale
    return {
      wallet: data.wallet,
      fair_score: normalizeFairScoreToThousand(data.fairscore),
      tier: data.tier,
      badges: data.badges,
      last_updated: data.timestamp,
      actions: data.actions,
      features: data.features,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        const err: any = new Error('Unauthorized: Invalid FairScale API key');
        err.statusCode = 401;
        throw err;
      }
      if (error.response?.status === 429) {
        const err: any = new Error('Rate limit exceeded. Please try again later.');
        err.statusCode = 429;
        throw err;
      }
      if (error.response?.status === 404) {
        // Return default unrated response for wallets without a score
        return {
          wallet,
          fair_score: 0,
          tier: 'unrated',
          badges: [],
          last_updated: new Date().toISOString(),
          features: {
            lst_percentile_score: 0,
            major_percentile_score: 0,
            native_sol_percentile: 0,
            stable_percentile_score: 0,
            tx_count: 0,
            active_days: 0,
            median_gap_hours: 0,
            tempo_cv: 0,
            burst_ratio: 0,
            net_sol_flow_30d: 0,
            median_hold_days: 0,
            no_instant_dumps: 0,
            conviction_ratio: 0,
            platform_diversity: 0,
            wallet_age_days: 0,
          },
        };
      }
      console.error('[ERROR] FairScale API error:', error.response?.data || error.message);
      const err: any = new Error(
        `FairScale API error: ${error.response?.data?.message || error.message}`
      );
      err.statusCode = error.response?.status || 500;
      throw err;
    }
    throw error;
  }
}

/**
 * Fetch only the FairScore number (lightweight endpoint)
 */
export async function getFairScoreOnly(wallet: string): Promise<FairScoreOnlyResponse> {
  try {
    const response = await fairscaleApi.get<{ fairscore: number } | { fair_score: number }>('/fairScore', {
      params: { wallet },
    });

    // Handle both possible response formats
    const fairScore = 'fairscore' in response.data 
      ? response.data.fairscore 
      : response.data.fair_score;

    return {
      wallet,
      fair_score: fairScore || 0,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return { wallet, fair_score: 0 };
      }
      throw new Error(
        `FairScale API error: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}

/**
 * Batch fetch FairScores for multiple wallets
 */
export async function getBatchFairScores(
  wallets: string[]
): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  // Fetch scores in parallel with a limit
  const batchSize = 5;
  for (let i = 0; i < wallets.length; i += batchSize) {
    const batch = wallets.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((wallet) => getFairScoreOnly(wallet))
    );

    results.forEach((result, index) => {
      const wallet = batch[index];
      if (result.status === 'fulfilled') {
        scores.set(wallet, result.value.fair_score);
      } else {
        scores.set(wallet, 0);
      }
    });
  }

  return scores;
}
