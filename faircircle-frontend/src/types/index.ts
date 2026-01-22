import { PublicKey } from '@solana/web3.js';

// Response from backend (normalized from FairScale API)
export interface FairScoreResponse {
  wallet: string;
  fair_score: number;
  tier: FairTier;
  badges: Badge[];
  last_updated: string;
  actions?: Action[];
  features?: FairScoreFeatures;
}

// Action suggestion from FairScale
export interface Action {
  id: string;
  label: string;
  description: string;
  priority: string;
  cta: string;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type FairTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'unrated';

export interface FairScoreFeatures {
  lst_percentile_score: number;
  major_percentile_score: number;
  native_sol_percentile: number;
  stable_percentile_score: number;
  tx_count: number;
  active_days: number;
  median_gap_hours: number;
  tempo_cv: number;
  burst_ratio: number;
  net_sol_flow_30d: number;
  median_hold_days: number;
  no_instant_dumps: number;
  conviction_ratio: number;
  platform_diversity: number;
  wallet_age_score: number;
}

export type CircleStatus = 'Forming' | 'Active' | 'Completed' | 'Cancelled';

export interface CircleMember {
  address: PublicKey;
  fairScore: number;
  hasContributed: boolean;
  hasClaimed: boolean;
  payoutOrder: number;
}

export interface Circle {
  address: PublicKey;
  creator: PublicKey;
  name: string;
  contributionAmount: number; // in lamports
  periodLength: number; // in seconds
  minFairScore: number;
  currentRound: number;
  memberCount: number;
  status: CircleStatus;
  createdAt: number;
  roundStartTime: number;
  totalPool: number;
  roundContributionsComplete: boolean;
  members: CircleMember[];
  payoutOrder: number[];
}

export interface CreateCircleParams {
  name: string;
  contributionAmount: number; // in SOL
  periodLength: number; // in days
  minFairScore: number; // 0-100
}

export const TIER_THRESHOLDS = {
  platinum: 80,
  gold: 60,
  silver: 40,
  bronze: 20,
  unrated: 0,
} as const;

export const TIER_COLORS = {
  platinum: {
    bg: 'bg-gradient-to-r from-slate-300 to-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    glow: 'shadow-slate-300/50',
  },
  gold: {
    bg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    text: 'text-amber-900',
    border: 'border-amber-400',
    glow: 'shadow-amber-400/50',
  },
  silver: {
    bg: 'bg-gradient-to-r from-gray-400 to-gray-300',
    text: 'text-gray-800',
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50',
  },
  bronze: {
    bg: 'bg-gradient-to-r from-orange-700 to-orange-500',
    text: 'text-orange-100',
    border: 'border-orange-500',
    glow: 'shadow-orange-500/50',
  },
  unrated: {
    bg: 'bg-gradient-to-r from-zinc-700 to-zinc-600',
    text: 'text-zinc-300',
    border: 'border-zinc-600',
    glow: 'shadow-zinc-600/50',
  },
} as const;

export function getTierFromScore(score: number): FairTier {
  if (score >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (score >= TIER_THRESHOLDS.gold) return 'gold';
  if (score >= TIER_THRESHOLDS.silver) return 'silver';
  if (score >= TIER_THRESHOLDS.bronze) return 'bronze';
  return 'unrated';
}

export function formatSOL(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function lamportsToSOL(lamports: number): number {
  return lamports / 1_000_000_000;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}
