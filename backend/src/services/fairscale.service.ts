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
 * Fetch complete FairScore data including tier and badges
 * Normalizes the API response for the frontend
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
    
    // Normalize to frontend format
    return {
      wallet: data.wallet,
      fair_score: data.fairscore,
      tier: data.tier,
      badges: data.badges,
      last_updated: data.timestamp,
      actions: data.actions,
      features: data.features,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Invalid FairScale API key');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (error.response?.status === 404) {
        // Return default unrated response for wallets without a score
        return {
          wallet,
          fair_score: 0,
          tier: 'unrated',
          badges: [],
          last_updated: new Date().toISOString(),
        };
      }
      throw new Error(
        `FairScale API error: ${error.response?.data?.message || error.message}`
      );
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
