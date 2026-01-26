import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // FairScale API
  fairscale: {
    apiUrl: process.env.FAIRSCALE_API_URL || 'https://api.fairscale.xyz',
    apiKey: process.env.FAIRSCALE_API_KEY || '',
  },
  
  // Solana
  solana: {
    network: process.env.SOLANA_NETWORK || 'devnet',
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    programId: process.env.PROGRAM_ID || '',
  },
  
  // CORS - trim whitespace and remove trailing slashes from origins
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, '')),
} as const;

// Validate required environment variables
export function validateConfig(): void {
  const required = [
    { key: 'FAIRSCALE_API_KEY', value: config.fairscale.apiKey },
    { key: 'PROGRAM_ID', value: config.solana.programId },
  ];
  
  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.map(m => m.key).join(', ')}`
    );
    console.warn('   Some features may not work correctly.');
  }
}
