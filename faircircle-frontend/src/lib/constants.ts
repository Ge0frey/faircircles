import { PublicKey } from '@solana/web3.js';

// Backend API URL
// In production: reads from VITE_API_BASE_URL environment variable
// In development: falls back to '/api' which uses Vite proxy
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Program ID (public, safe to expose)
export const PROGRAM_ID = new PublicKey('FeuH9rfHZ8XuMQrFVdWHP6MEA4e4fqtF95Bbi3aiMZdk');

// Solana Network
export const SOLANA_NETWORK = 'devnet';
export const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

// Circle constraints
export const MAX_MEMBERS = 10;
export const MIN_MEMBERS = 3;
export const MIN_CONTRIBUTION = 0.01; // SOL
export const MAX_CONTRIBUTION = 100; // SOL

// Period options (in seconds)
export const PERIOD_OPTIONS = [
  { label: '1 Day', value: 86400 },
  { label: '3 Days', value: 259200 },
  { label: '1 Week', value: 604800 },
  { label: '2 Weeks', value: 1209600 },
  { label: '1 Month', value: 2592000 },
];

// Minimum FairScore options
export const MIN_FAIR_SCORE_OPTIONS = [
  { label: 'No Minimum', value: 0, tier: 'unrated' as const },
  { label: 'Bronze+ (20+)', value: 20, tier: 'bronze' as const },
  { label: 'Silver+ (40+)', value: 40, tier: 'silver' as const },
  { label: 'Gold+ (60+)', value: 60, tier: 'gold' as const },
  { label: 'Platinum (80+)', value: 80, tier: 'platinum' as const },
];
