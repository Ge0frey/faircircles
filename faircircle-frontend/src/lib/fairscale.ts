import { API_BASE_URL } from './constants';
import type { FairScoreResponse, FairTier } from '../types';

/**
 * Fetch complete FairScore data from backend API
 */
export async function fetchFairScore(wallet: string, twitter?: string): Promise<FairScoreResponse> {
  const params = new URLSearchParams({ wallet });
  if (twitter) {
    params.append('twitter', twitter);
  }

  const response = await fetch(`${API_BASE_URL}/fairscale/score?${params}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Unauthorized: Backend API key configuration issue');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(error.message || `Failed to fetch FairScore: ${response.statusText}`);
  }

  return response.json();
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
