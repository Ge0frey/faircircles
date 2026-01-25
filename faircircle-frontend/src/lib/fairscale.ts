import { API_BASE_URL } from './constants';
import type { FairScoreResponse, FairTier } from '../types';

/**
 * Custom error class for rate limit errors
 * When this error is thrown, the caller should preserve existing cached data
 */
export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Custom error class for network errors
 * When this error is thrown, the caller should preserve existing cached data
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Normalize FairScore to 0-1000 scale
 * The API returns `fairscore` on a 0-100 scale (e.g., 65.3)
 * We convert it to 0-1000 for consistent display
 */
export function normalizeFairScoreToThousand(score: number): number {
  // If score is already > 100, it's likely already on 0-1000 scale
  if (score > 100) {
    return Math.round(score);
  }
  // Convert from 0-100 scale to 0-1000 scale
  return Math.round(score * 10);
}

/**
 * Fetch complete FairScore data from backend API
 * @throws {RateLimitError} When rate limited - caller should preserve cached data
 * @throws {NetworkError} When network fails - caller should preserve cached data
 * @throws {Error} For other errors
 */
export async function fetchFairScore(wallet: string, twitter?: string): Promise<FairScoreResponse> {
  const params = new URLSearchParams({ wallet });
  if (twitter) {
    params.append('twitter', twitter);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fairscale/score?${params}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Unauthorized: Backend API key configuration issue');
      }
      if (response.status === 429) {
        // Throw RateLimitError - caller should preserve existing cached data
        console.warn('Rate limit exceeded - cached data should be preserved');
        throw new RateLimitError();
      }
      throw new Error(error.message || `Failed to fetch FairScore: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalize the score to 0-1000 scale
    return {
      ...data,
      fair_score: normalizeFairScoreToThousand(data.fair_score),
    };
  } catch (error) {
    // Re-throw RateLimitError as-is
    if (error instanceof RateLimitError) {
      throw error;
    }
    
    // If it's a network error, throw NetworkError
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Network error - cached data should be preserved');
      throw new NetworkError();
    }
    throw error;
  }
}

/**
 * Fetch only the FairScore number (lightweight)
 */
export async function fetchFairScoreOnly(wallet: string): Promise<number> {
  const params = new URLSearchParams({ wallet });

  const response = await fetch(`${API_BASE_URL}/fairscale/fairScore?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch FairScore: ${response.statusText}`);
  }

  const data = await response.json();
  return data.fair_score;
}

/**
 * Batch fetch FairScores for multiple wallets
 */
export async function fetchBatchFairScores(wallets: string[]): Promise<Record<string, number>> {
  const response = await fetch(`${API_BASE_URL}/fairscale/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wallets }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch batch FairScores: ${response.statusText}`);
  }

  const data = await response.json();
  return data.scores;
}

export function getTierDescription(tier: FairTier): string {
  switch (tier) {
    case 'platinum':
      return 'Elite reputation - first priority for payouts';
    case 'gold':
      return 'High trust - early access to pooled funds';
    case 'silver':
      return 'Established reputation - standard queue position';
    case 'bronze':
      return 'Building trust - proves commitment by waiting';
    default:
      return 'Unrated - limited access to circles';
  }
}

export function getTierRequirementText(minScore: number): string {
  if (minScore >= 80) return 'Platinum members only';
  if (minScore >= 60) return 'Gold tier or higher';
  if (minScore >= 40) return 'Silver tier or higher';
  if (minScore >= 20) return 'Bronze tier or higher';
  return 'Open to all';
}

export function formatBadgeTier(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
