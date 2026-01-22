// FairScale API Types (matches actual API response)

export type FairTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unrated';

export interface Badge {
  id: string;
  label: string;
  description: string;
  tier: string;
}

export interface Action {
  id: string;
  label: string;
  description: string;
  priority: string;
  cta: string;
}

export interface Features {
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

export interface FairScaleApiResponse {
  wallet: string;
  fairscore_base: number;
  social_score: number;
  fairscore: number;
  badges: Badge[];
  actions: Action[];
  tier: FairTier;
  timestamp: string;
  features: Features;
}

// Normalized response for frontend
export interface FairScoreResponse {
  wallet: string;
  fair_score: number;
  tier: FairTier;
  badges: Badge[];
  last_updated: string;
  actions?: Action[];
  features?: Features;
}

export interface FairScoreOnlyResponse {
  wallet: string;
  fair_score: number;
}

// API Error Response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Circle Types (for future circle state management)
export interface CircleMember {
  address: string;
  fairScore: number;
  hasContributed: boolean;
  hasClaimed: boolean;
  payoutOrder: number;
}

export interface Circle {
  address: string;
  creator: string;
  name: string;
  contributionAmount: number;
  periodLength: number;
  minFairScore: number;
  currentRound: number;
  memberCount: number;
  status: 'Forming' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: number;
  roundStartTime: number;
  totalPool: number;
  roundContributionsComplete: boolean;
  members: CircleMember[];
  payoutOrder: number[];
}
